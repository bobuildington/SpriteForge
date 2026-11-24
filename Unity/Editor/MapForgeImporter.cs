#if UNITY_EDITOR
using System;
using System.IO;
using System.IO.Compression;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;
using SpireWrought.MapForge;

namespace SpireWrought.MapForge.Editor
{
    /// <summary>
    /// Imports a ZIP exported from Map Forge V2.1 or later into the current Unity scene.
    /// Uses the baked map PNG so separately licensed Forest Kit files never need to be
    /// redistributed. It also creates semantic marker and placement nodes and a simple
    /// cell-based collision approximation from the 1:1 collision mask.
    /// </summary>
    public static class MapForgeImporter
    {
        [Serializable] private class ExportMap
        {
            public string format;
            public int version;
            public int[] size;
            public float pixelsPerMetre;
            public WorldCoord world;
            public Marker[] markers;
            public MapObject[] objects;
        }
        [Serializable] private class WorldCoord { public int x, y; }
        [Serializable] private class Marker { public string id, type, label, target; public int x, y; }
        [Serializable] private class MapObject
        {
            public string file, collision;
            public int footX, footY, sortY;
        }

        [MenuItem("Tools/SpireWrought/Import Map Forge ZIP")]
        public static void ImportZip()
        {
            string zipPath = EditorUtility.OpenFilePanel("Select a Map Forge Unity map ZIP", "", "zip");
            if (string.IsNullOrEmpty(zipPath)) return;
            try
            {
                Import(zipPath);
            }
            catch (Exception e)
            {
                Debug.LogException(e);
                EditorUtility.DisplayDialog("Map Forge import failed", e.Message, "OK");
            }
        }

        public static void Import(string zipPath)
        {
            string label = Path.GetFileNameWithoutExtension(zipPath);
            foreach (char c in Path.GetInvalidFileNameChars()) label = label.Replace(c, '_');
            string assetFolder = "Assets/MapForgeImports/" + label;
            string projectRoot = Path.GetFullPath(Path.Combine(Application.dataPath, ".."));
            string targetFolder = Path.GetFullPath(Path.Combine(projectRoot, assetFolder));
            Directory.CreateDirectory(targetFolder);

            // A small allowlist prevents path traversal and overwriting arbitrary project files.
            string[] allowed = { "map.json", "mapforge-project.json", "map.png", "collision.png", "objects.png", "custom-tiles.png" };
            using (var archive = ZipFile.OpenRead(zipPath))
            {
                foreach (ZipArchiveEntry entry in archive.Entries)
                {
                    string path = entry.FullName.Replace('\\', '/');
                    if (string.IsNullOrEmpty(path) || path.EndsWith("/")) continue;
                    bool isAllowed = allowed.Contains(path) || (path.StartsWith("assets/", StringComparison.Ordinal) && path.EndsWith(".png", StringComparison.OrdinalIgnoreCase));
                    if (!isAllowed || path.Contains("..") || path.StartsWith("/")) continue;
                    string destination = Path.GetFullPath(Path.Combine(targetFolder, path));
                    if (!destination.StartsWith(targetFolder + Path.DirectorySeparatorChar, StringComparison.Ordinal)) continue;
                    Directory.CreateDirectory(Path.GetDirectoryName(destination));
                    entry.ExtractToFile(destination, true);
                }
            }

            string jsonPath = Path.Combine(targetFolder, "map.json");
            string previewPath = Path.Combine(targetFolder, "map.png");
            if (!File.Exists(jsonPath) || !File.Exists(previewPath)) throw new Exception("This ZIP must include map.json and map.png.");
            ExportMap info = JsonUtility.FromJson<ExportMap>(File.ReadAllText(jsonPath));
            if (info == null || info.size == null || info.size.Length < 2) throw new Exception("Invalid Map Forge map.json.");
            int width = info.size[0], height = info.size[1];
            if (width < 1 || height < 1 || width > 10000 || height > 10000) throw new Exception("Invalid map dimensions.");
            float ppu = info.pixelsPerMetre > 0 ? info.pixelsPerMetre : 37f;
            AssetDatabase.Refresh(ImportAssetOptions.ForceUpdate);
            string mapAssetPath = assetFolder + "/map.png";
            ConfigureSprite(mapAssetPath, ppu);
            Sprite sprite = AssetDatabase.LoadAssetAtPath<Sprite>(mapAssetPath);
            if (sprite == null) throw new Exception("Unity could not import map.png as a sprite.");

            int worldX = info.world != null ? info.world.x : 0;
            int worldY = info.world != null ? info.world.y : 0;
            GameObject root = new GameObject("MapForge_" + label);
            Undo.RegisterCreatedObjectUndo(root, "Import Map Forge cell");
            // Each world-cell step uses the map pixel extent and keeps neighbors aligned.
            root.transform.position = new Vector3(worldX * width / ppu, -worldY * height / ppu, 0);
            GameObject art = new GameObject("Baked Map Art");
            art.transform.SetParent(root.transform, false);
            SpriteRenderer sr = art.AddComponent<SpriteRenderer>();
            sr.sprite = sprite;
            sr.sortingOrder = -100;
            // A center-pivot sprite occupies [0,w] x [-h,0] in world coordinates.
            art.transform.localPosition = new Vector3(width / (2f * ppu), -height / (2f * ppu), 0);

            GameObject markers = new GameObject("Gameplay Markers");
            markers.transform.SetParent(root.transform, false);
            if (info.markers != null)
            {
                foreach (Marker marker in info.markers)
                {
                    GameObject node = new GameObject("Marker: " + (string.IsNullOrEmpty(marker.label) ? marker.type : marker.label));
                    node.transform.SetParent(markers.transform, false);
                    node.transform.localPosition = new Vector3(marker.x / ppu, -marker.y / ppu, 0);
                    MapForgeMarker tag = node.AddComponent<MapForgeMarker>();
                    tag.MarkerId = marker.id;
                    tag.MarkerType = marker.type;
                    tag.Label = marker.label;
                    tag.TargetId = marker.target;
                    tag.SourcePixel = new Vector2Int(marker.x, marker.y);
                    tag.WorldCell = new Vector2Int(worldX, worldY);
                }
            }

            GameObject objectNodes = new GameObject("Object Foot Anchors (baked visuals)");
            objectNodes.transform.SetParent(root.transform, false);
            if (info.objects != null)
            {
                foreach (MapObject o in info.objects)
                {
                    GameObject node = new GameObject("Object: " + Path.GetFileName(o.file ?? "object"));
                    node.transform.SetParent(objectNodes.transform, false);
                    node.transform.localPosition = new Vector3(o.footX / ppu, -o.footY / ppu, 0);
                    var component = node.AddComponent<MapForgePlacedObject>();
                    component.SourcePath = o.file;
                    component.CollisionKind = o.collision;
                    component.FootPixelX = o.footX;
                    component.FootPixelY = o.footY;
                    component.SortingPixelY = o.sortY;
                }
            }

            string collisionPath = Path.Combine(targetFolder, "collision.png");
            if (File.Exists(collisionPath))
            {
                CreateColliders(root.transform, File.ReadAllBytes(collisionPath), width, height, ppu);
            }
            Selection.activeGameObject = root;
            Debug.Log("Map Forge imported: " + label + " (" + width + "x" + height + ", world cell " + worldX + "," + worldY + ").");
            EditorUtility.DisplayDialog("Map Forge import complete", "Created baked map artwork, collision cells, gameplay markers and object anchor metadata.\n\nFor runtime object-level Y sorting, replace the baked object art with separately licensed object sprites in your private Unity project.", "OK");
        }

        private static void ConfigureSprite(string path, float ppu)
        {
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer == null) throw new Exception("Texture importer not found for " + path);
            importer.textureType = TextureImporterType.Sprite;
            importer.spriteImportMode = SpriteImportMode.Single;
            importer.spritePixelsPerUnit = ppu;
            importer.filterMode = FilterMode.Point;
            importer.mipmapEnabled = false;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.alphaIsTransparency = true;
            importer.SaveAndReimport();
        }

        // 32px cells are sampled at their center. This is a grid approximation of the
        // pixel-accurate collision.png; long horizontal blocked spans are merged.
        private static void CreateColliders(Transform root, byte[] png, int width, int height, float ppu)
        {
            var mask = new Texture2D(2, 2, TextureFormat.RGBA32, false);
            if (!mask.LoadImage(png)) { UnityEngine.Object.DestroyImmediate(mask); return; }
            GameObject holder = new GameObject("Collision Grid (32px sampling)");
            holder.transform.SetParent(root, false);
            int columns = Mathf.CeilToInt(width / 32f), rows = Mathf.CeilToInt(height / 32f);
            for (int row = 0; row < rows; row++)
            {
                int y = Mathf.Min(height - 1, row * 32 + 16);
                int x = 0;
                while (x < columns)
                {
                    int px = Mathf.Min(width - 1, x * 32 + 16);
                    bool blocked = mask.GetPixel(px, height - 1 - y).r > 0.5f;
                    if (!blocked) { x++; continue; }
                    int from = x;
                    while (x < columns)
                    {
                        px = Mathf.Min(width - 1, x * 32 + 16);
                        if (mask.GetPixel(px, height - 1 - y).r <= 0.5f) break;
                        x++;
                    }
                    int left = from * 32;
                    int right = Mathf.Min(width, x * 32);
                    int top = row * 32;
                    int bottom = Mathf.Min(height, (row + 1) * 32);
                    GameObject colliderNode = new GameObject("Blocked_" + row + "_" + from);
                    colliderNode.transform.SetParent(holder.transform, false);
                    colliderNode.transform.localPosition = new Vector3((left + right) / (2f * ppu), -(top + bottom) / (2f * ppu), 0);
                    BoxCollider2D box = colliderNode.AddComponent<BoxCollider2D>();
                    box.size = new Vector2((right - left) / ppu, (bottom - top) / ppu);
                }
            }
            UnityEngine.Object.DestroyImmediate(mask);
        }
    }
}
#endif