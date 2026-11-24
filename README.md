# SpireWrought Map Forge

## V2.2 — World cells, terrain blending, markers and Unity importer

The v2.2 update adds all six requested improvements while keeping the original 24-tile pack, the optional locally loaded Forest Kit, and existing Map Forge project compatibility.

1. **Smart terrain edges**: Enable **Smart tile edge blending** under Generate to blend borders between different painted 32×32 custom tiles. This changes the rendered pixels only; it does not rewrite tile IDs or collision. It does not yet produce rule-based animated shorelines.
2. **Connected world cells**: Choose world X/Y and use the north/east/south/west buttons to save the current cell and open an adjacent cell. Each cell has its own placements, painted tiles, collision overrides and gameplay markers, stored in IndexedDB. **World JSON** exports/imports cell recipes; licensed kit art stays local.
3. **Gameplay markers**: In Place, pick the **Marker** tool and marker type (player spawn, enemy spawn, loot, NPC, door, stairs, teleporter, interactable, checkpoint, boss, quest). Tap the map. Edit the label/target before placing and delete placed markers from the list. Markers are serialized in `map.json` and remain editor-only visual overlays (not baked into `map.png`).
4. **Collision painting**: **Block**, **Walk** and **Clear paint** brush tools operate on a 32×32 grid. Overrides are applied after terrain/object blocking and included in `collision.png` and `map.json`. **Collision** toolbar switch previews blocked regions.
5. **Native Unity import helper**: `Unity/Editor/MapForgeImporter.cs` and `Unity/Runtime/*.cs`. Copy both folders into the private SpireWrought Unity project and choose **Tools → SpireWrought → Import Map Forge ZIP**. The importer creates baked visual art, markers, object anchors, and approximately sampled 32px collision colliders. Requires game-side verification and refinement for live Y-sorting, exact polygon collision and procedural streaming.
6. **More durable storage and backups**: IndexedDB stores active projects, saved map library, original art and world cells, alongside the existing private offline Forest Kit ZIP. Earlier localStorage projects and artwork are read for migration. **Full backup** exports active project, saved maps, artwork and world-cell recipes. Restore with **Open project**. Use JSON exports regularly; clearing browser data still removes locally stored projects.

### V2.2 smoke test

Tests using a phone-sized Chromium viewport covered marker placement, collision brush and Undo, two adjacent terrain tiles with an actual pixel-color change, world cell navigation and restoration (using a simulated IndexedDB store), full JSON backup restore, intact Unity ZIP output, and Forest Kit ZIP loading (4 ground tiles, 29 overlays, 259 objects). `Unity/Editor` C# code is **not** compiled against your game project by these browser tests.

**Workflow limitation:** A connected world is a collection of separately exported editable cell recipes. The Unity ZIP importer currently imports **one** rendered map ZIP at a time; it does not implement loading or streaming multiple cells at runtime.


Map Forge is the map-only replacement for the older SpriteForge app. It combines a **Map Editor** with a touch-first **Tiles & Objects** pixel editor. Monster and spell-effect editors are no longer shown in this app.

## V2.1: Ground tiles and editor fixes

**24 original 32×32 ground tiles** are now integrated directly into the **Tiles & Objects** workspace. Tap **+ Add 24 tiles** to add them to your local library, edit them, and paint them onto maps. The **Tile pack ZIP** button downloads the individual PNGs. The pack includes grass, flowers, moss, dirt, gravel, sand, cobblestone, roads, snow, ice, water, marsh, and ash. Shallow and deep water default to blocking movement; other tiles default to walkable. The artwork was created independently and is not from the licensed Forest Kit.

**Audited and fixed:** mobile swipe painting interpolates skipped cells; 32px tile stamps stay within the 1254px map bounds; redraws are serialized to avoid mixed images; walkable tiles can override a blocked terrain background in the collision mask; editing a saved object's size/collision updates its placed copies; blocking custom objects use the kit-compatible `standing` collision type; the Forest Kit toolbar hides while in the pixel editor; and the Android PWA worker uses network-first navigation with offline fallback.

**Grid caveat:** 1254px is not divisible by 32. Tiles can be stamped on 39 complete cells per axis, leaving a 6px strip near the right and bottom edges. Use a repeating fill tile, which covers the full canvas, for seamless ground.

**Verification:** tested original ZIP discovery (4 ground, 29 overlay, 259 object assets), generating 40 forest objects, loading 24 starter tiles, painting fast swipes, updating placed objects, restoring a map project, PNG/ZIP structure, and collision pixels. A Unity *runtime* importer is still not included.

## Use on Android

Open **https://bobuildington.github.io/SpriteForge/** in Chrome, refresh online, and then use Chrome's **Install app** action. If an older Sprite Forge installation still loads the old interface, refresh the HTTPS page twice while connected and restart the installed app. The previous `/SpriteForge/maps/` URL redirects to the new home screen. The editor's code works offline after caching; the optional Forest Kit must be loaded from a local ZIP again or saved separately in browser storage.

## Map Editor

- Load the optional **Tiny Realms Forest Map Kit HTML v2.0 ZIP** from your device. Its licensed artwork remains local to your browser; **no kit PNGs are published to GitHub**.
- Generate seeded 1254×1254 forest maps using the kit's 4 ground tiles, 29 overlays, and 259 placeable objects, including original collision footprints and depth-sort data.
- Place, move, duplicate, or remove kit objects or your own custom objects.
- Paint original 32×32 tiles on a snap-to-grid ground layer; drag to paint multiple cells, use Erase tile to clear, or set a tile to repeat across the whole ground.
- Preview blocking footprints and tiles in the collision overlay.
- Save maps to browser-managed storage or export an editable JSON backup. Reload the licensed kit separately when reopening maps that use it.

## Tiles & Objects Editor

- Create **32×32 ground tiles** or **32, 64, 96, and 128px square objects** with transparent backgrounds.
- Pencil, eraser, bucket fill, eyedropper, line, rectangle, flip, grid, touch drawing, Undo and Redo.
- Start from original grass, dirt, stone, water, bush, rock, tree and crate patterns. No licensed artwork is embedded in these patterns.
- Import an existing PNG, or copy a selected kit object into the studio **locally**, scaled to fit the 128px object canvas. Export individual PNGs.
- Mark painted tiles and objects as blocking when appropriate. Objects use a feet pivot near their bottom center.
- Save custom artwork into the device's asset library, then add it to the map directly. Custom art is also embedded in editable project JSON exports.

## Unity-ready exports

**Unity map bundle ZIP** includes:

- `map.png` — composited 1254×1254 map preview.
- `objects.png` — transparent positioned object layer.
- `custom-tiles.png` — transparent custom ground/tile layer.
- `collision.png` — black walkable / white blocked pixels.
- `map.json` — kit-compatible metadata when a kit is loaded, plus `custom` asset records and tile positions. Without a kit, format is `spirewrought-mapforge-map` v2.
- `assets/*.png` — your own custom tiles and objects, never the original kit's licensed sources.
- `mapforge-project.json` — editable project including custom art data URLs (load your own kit ZIP separately for kit-backed projects).
- `README.txt` — import notes.

**Unity importer not included.** The files carry image and collision data, but connecting these layers to the actual SpireWrought Unity game is a separate integration task. The Forest Kit's character art scale (~63px) differs from SpireWrought's original 32×32 monster sprites; handle that mismatch in the game's world scale settings.

## Licensing

The supplied Forest Kit licence permits using and editing the art in commercial games, but prohibits redistributing source artwork in a public tool, template, or asset collection. Do not commit the original ZIP, licensed image data, or extracted kit artwork to this public repository.

The map editor's original starter patterns and underlying code contain no embedded Forest Kit art. Any map bundle made with the kit may contain a composite rendered image as game output, but does not include the original source image files.

## Hosting

The GitHub Pages workflow publishes the repository's root on `main`. The `service-worker.js` pre-caches the editor's essential code so the installed Android PWA can work offline. Data and the optional 100MB kit are stored locally in browser-managed storage and may be evicted by the browser: **export backups regularly**.