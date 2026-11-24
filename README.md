# SpireWrought Map Forge V2.3

A map-only Android/desktop editor for SpireWrought. Hosted app: https://bobuildington.github.io/SpriteForge/

## Variable-sized maps

In **Map Editor → Generate → Map dimensions**, select a preset or enter a custom width and height, then tap **Apply map size**. Both dimensions can be 256–3072 pixels, with a maximum area of 4,194,304 pixels to avoid excessive mobile memory use. Available presets include 512×512, 768×768, 1024×1024, 1254×1254, 1536×1536, 2048×2048, 1024×768, 2048×1024 and 1024×2048.

**Fit** (or **Show full map**) calculates a scale that fits the entire rectangular map into the current map viewport. Use +/− for close editing; the Pan tool or scrolling moves a zoomed canvas. Maps preserve dimensions across local project saves, full backups, neighboring world cells and Unity ZIP exports. Older maps without a size field reopen at 1254×1254.

Resizing smaller removes content outside the new boundaries after a confirmation. Use Undo to restore. The Forest Kit's 1254px ground and overlay textures are scaled to the selected map size; for perfect original pixel scale, use 1254×1254 or original 32×32 ground tiles.

## Generate objects

Choose a **theme, density and seed**, then tap **Generate map objects**. With the original licensed Forest Kit loaded, generation uses its categories, source object dimensions, object collision and spacing, and avoids overlay exclusion areas. Without the kit, create at least one original placeable object in **Tiles & Objects**, then generate from your custom objects. Forest Kit and custom objects can be combined. Object counts scale with map area, up to 500 generated objects. Generation is deterministic for the same settings and available asset set.

**Replace existing placed objects** is checked by default; generation asks before removing placements. Uncheck it to keep manual objects and replace only previously generated objects. Ground tiles, collision painting and gameplay markers are never erased by object generation.

## Move and delete map objects

In the **Place** tab, select **↔ Move** and tap an object. Drag it directly with your finger or mouse; alternatively tap an empty location to move it there, or enter exact **Foot X / Foot Y** coordinates. To delete, use the **✕ Delete** button at the top after selecting an object, **Delete selected** in the selection panel, or the **✕ Delete obj** tool and tap an object. All moves and deletes can be undone.

## Original Forest Kit use

Load `TinyRealms_ForestMapKit_HTML_v2.0.zip` locally from your Android downloads. The original licensed artwork remains on your device and **is not bundled in this public repository**. Kit ZIP is needed again to edit previously saved projects that use its assets. Optionally store the ZIP offline using IndexedDB, subject to device storage limits.

## Unity export

**Save / Export → Unity map bundle ZIP** exports map.json, map.png, objects.png, custom-tiles.png, collision.png, the editable project, and original custom asset PNGs. All PNG outputs use the map's current width and height. The Unity editor importer in `Unity/Editor/MapForgeImporter.cs` reads dimensions from map.json. When neighboring world cells have different dimensions, their Unity placements are approximate—position the imported scene roots manually until a world-level layout importer is available. The importer generates baked art and approximate colliders, not full dynamic depth sorting or runtime streaming.

## Compatibility and safeguards

- Old V2.1/V2.2 projects and 1254px maps are supported.
- Resizing smaller warns before trimming objects, markers or terrain, and supports Undo.
- New custom assets can be stored in IndexedDB and exported in full backups.
- Ground painting, edge blending, gameplay markers, tile/object editing, collision painting and tile pack remain available.
- Service worker cache bumped to V2.3 for Android updates. Refresh the HTTPS site online before reopening the installed app.

## Verification

Chromium mobile regression tested custom object generation without kit, 1024×768 map sizing and full-fit, exact-coordinate object move, Delete/Undo, project serialization, rectangular PNG/ZIP export, original Forest Kit loading (4 tiles, 29 overlays, 259 objects), pointer drag, undo after resize and per-cell dimension restoration. Physical Android and Unity play-mode testing still pending.