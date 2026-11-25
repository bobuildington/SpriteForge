# SpireWrought Map Forge — Windows Desktop V3.0

**The desktop edition is the main new development target.** A Windows x64 installer and portable executable are built by GitHub Actions. Open [Windows Desktop Builds](https://github.com/bobuildington/SpriteForge/actions/workflows/windows-desktop.yml) and download the artifact from the newest successful run.

[Desktop installation, shortcuts and build instructions](desktop/README.md)

The **existing browser editor remains available** at https://bobuildington.github.io/SpriteForge/ as a legacy option. The desktop app uses the same Forest Kit world-square generator and World Grid ZIP format; it does **not** alter your separate SpireWrought Unity importer. Licensed Forest Kit images are not distributed in this repository.

---

# SpireWrought Map Forge V2.4 — Original World Grid

A mobile-first forest map creator for SpireWrought, hosted on GitHub Pages at https://bobuildington.github.io/SpriteForge/.

**The SpireWrought Unity repository has not been modified.** The existing `UnityProject/Assets/Editor/ArenaMapKitImport.cs` importer already understands the original Forest Map Kit World Grid v2 export.

## Tile and map sizes (confirmed from the original kit)

- **World square:** 1254×1254 pixels (default and Unity importer requirement).
- **Original Forest Kit ground tile:** a complete 1254×1254 pixel PNG, not a grid of smaller 32px sprites.
- **Forest Kit overlay:** also 1254×1254, with alpha transparency.
- **Additional hand-painted custom tiles:** 32×32 PNGs. They are separate editable detail/paint stamps, not replacements for the full-size kit ground.
- **Placeable objects:** PNGs up to 512px in either dimension, centered on a square editing canvas; transparent margins are retained.

The individual map editor still allows custom widths/heights for non-kit standalone maps, but the **World Grid** always uses 1254×1254 and rejects incompatible cells when exporting for SpireWrought's current Unity importer.

## Original-style World Grid

1. In Map Forge, tap **World Grid**. Choose 3×3, 5×5, 7×7 or 9×9, or enter your own columns/rows (1–12).
2. Load your original licensed `TinyRealms_ForestMapKit_HTML_v2.0.zip` directly on your phone. Its artwork is kept local; none is copied into this public repo.
3. **Generate here** makes the selected 1254×1254 square; **Fill empty squares** generates missing cells using per-square seeded layouts.
4. Each square displays its actual rendered ground, overlay and objects in the overview. Tap A1, B1, etc. to see its preview and object count.
5. **Open square** takes you to Map Editor to move/delete objects, paint custom tiles, adjust collisions, etc. Save your map before returning.
6. **Export Forest Kit World ZIP** downloads `world.json`, `overview.png`, and `cells/A1/map.json`, `cells/A1/collision.png`, etc. Optional map/object PNGs increase size. The layout matches `ArenaMapKitImport.ImportWorld` in SpireWrought.

**Compatibility:** The existing importer requires `world.json` with `format='forest-map-kit-world'` and `version=2`; square cells; each `map.json` with `size=[1254,1254]`, ground references to original `tiles/` and `overlays/` art, and collision PNG. It resolves images from the separately extracted licensed kit folder. The World Grid exports only original-kit artwork for this importer.

**Custom art limitation:** New custom 32px tiles and imported objects work in Map Forge and its editable backups but cannot be inserted into a World Grid export accepted by the *unchanged* existing importer. To use custom art in these exported Unity scenes, update the importer later in the game repo (not done in this update), or add the art inside Unity manually. The World Grid rejects incompatible custom art rather than silently losing it.

## Custom tile and object groups

- Go to **Tiles & Objects**. Select **Custom paint tile (32×32)** or **Placeable object**.
- Choose/create a group (Terrain, Props, Trees, Rocks, Houses, etc.). Groups may be renamed. The library can be filtered by group.
- **Import PNGs to group** accepts multiple PNG files. Paint tiles must be exactly 32×32. Objects preserve their original pixel proportions and are stored on the smallest supported square canvas that fits (32, 64, 96, 128, 256 or 512px). No upscale is applied.
- Imported art is saved locally in IndexedDB and included in Map Forge project backups, subject to the existing 70-asset library cap.
- The original 24 generated SpireWrought terrain tiles remain available under **Add 24 tiles**.
- The 1254px original kit ground images are loaded only through **Load kit ZIP** (not as 32px paint tiles).

## Android offline use

Open the HTTPS address in Chrome once, refresh, then open the installed app. The service worker caches **both** Map Editor and World Grid, and uses network-first updates with cached offline fallbacks. Kit artwork is not automatically cached by the service worker; use **Save kit offline** separately (storage quota permitting).

Export an editable project backup before major work. Browser-managed app data can be cleared by Android or browser cleanup.

## Development verification

- Tested the actual 102 MB Forest Kit ZIP: 4 full-size ground tiles, 29 overlays, 259 object assets.
- World Grid displayed nine separate squares at 3×3, with the generated A1 cell rendered as a thumbnail and a full selected preview.
- Generated and exported a 1254px A1 map with 75 objects; ZIP passed integrity validation; verified `world.json`, `cells/A1/map.json` and `cells/A1/collision.png` plus `overview.png`.
- Tested creating an object group, filtering saved artwork, importing a 96×96-padded rectangular object and rejecting incorrect-size paint tiles.
- The C# importer schema was checked by reading the existing SpireWrought repo. Unity Editor integration itself has **not** been retested.