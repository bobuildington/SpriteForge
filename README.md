# SpireWrought Map Forge

Map Forge is the map-only replacement for the older SpriteForge app. It combines a **Map Editor** with a touch-first **Tiles & Objects** pixel editor. Monster and spell-effect editors are no longer shown in this app.

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