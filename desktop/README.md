# SpireWrought Map Forge — Windows Desktop V3.1

A **Windows-first desktop application** built from the existing Map Forge World Grid and Map/Tile/Object editors. This update changes how the editor runs and saves files; it **does not add another Unity importer** or change the separate SpireWrought game repository.

## Advanced World Planner (V3.1)

Open **World Grid → Advanced World Planner** or press **Ctrl+Shift+P** to prepare a deterministic region-wide plan. Choose a world seed, clustered biome regions, road-network density, a connecting river, and up to 12 settlements. Tap **Plan World** to view the design without altering saved map artwork. **Fill empty squares** creates only missing maps; **Regenerate unlocked** replaces unprotected squares after explicit confirmation. **Lock square** protects a completed area.

Planned routes have *matching endpoints* across neighboring 1254×1254 Forest Kit squares and are visible in the World Grid and individual Map Editor. Their placement reserves open corridors when generating trees and props. A `world-plan.json` and per-cell `planned-routes.png` are included in the World Grid ZIP alongside its original `forest-map-kit-world` v2 files. **These procedural roads/rivers are planning artwork**, not native original Forest Kit overlays: SpireWrought's existing importer ignores them unless they are baked or incorporated separately. Existing Unity import compatibility is preserved, and no changes to SpireWrought's repository were made.

Regeneration is seeded and reproducible for the same loaded kit and settings. Locked squares remain unchanged; changing the world plan around a locked map may leave an imperfect connection at that protected border. Use the preview to inspect those boundaries.

## Download the Windows app

1. Open [Build Windows Map Forge Desktop](https://github.com/bobuildington/SpriteForge/actions/workflows/windows-desktop.yml).
2. Open the newest **successful** run.
3. Under **Artifacts**, download `SpireWrought-Map-Forge-v3-1-Windows`.
4. Extract the artifact ZIP. It contains two `.exe` files:
   - `SpireWrought-Map-Forge-Setup-3.1.0-x64.exe` — installer with a Start-menu and desktop shortcut.
   - `SpireWrought-Map-Forge-Portable-3.1.0-x64.exe` — runs without installing.
5. Open either `.exe`. Because these community-built executables are not code-signed, Windows SmartScreen may show an **Unknown publisher** warning. Verify the GitHub Actions run and download source before choosing to proceed.

These builds target **Windows x64**. The GitHub workflow generates the executables; they are not checked into git. If no successful build is listed yet, check the Actions run logs.

## Source development

Requires Node.js 22+ on Windows.

```powershell
npm install
npm start
```

For Windows installers and portable builds:

```powershell
npm run check:desktop
npm run pack:win
```

The `prepare` script copies the up-to-date Map Forge pages from the repository root to the packaged `web/` directory and adds the native save-bridge hooks. **Never edit the generated `web/` folder directly**. `web/` is excluded from git.

## Desktop tools

- **World Grid:** full-size world overview with separately rendered 1254×1254 Forest Kit squares, individual previews, per-square generation, and compatible Forest Kit World ZIP exports.
- **Map Editor:** generate/edit a map square, move/delete objects, paint collisions, place gameplay markers, adjust terrain, and undo changes.
- **Tiles & Objects:** create and import 32×32 paint tiles and larger placeable PNG objects; customize groups and edit pixels.
- **Native JSON files:** `Ctrl+S` saves the current map to disk. Further `Ctrl+S` overwrites the same file; `Ctrl+Shift+S` chooses another name. `Ctrl+Alt+S` saves a full backup of the current map, saved map library, custom art, and world cells.
- **Native exports:** PNG, ZIP, and JSON exports open a Windows Save As dialog rather than silently downloading to a browser folder.
- **Kit stays private:** use **Open Forest Kit** to choose your original licensed ZIP. Its artwork is not included in this repo or app installer. The editor can cache the kit in its local app profile using **Save offline**.

### Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+P` | Plan World (from World Grid) |
| `Ctrl+1` | World Grid |
| `Ctrl+2` | Map Editor |
| `Ctrl+3` | Tiles & Objects |
| `Ctrl+O` | Open map project JSON |
| `Ctrl+S` | Save map project JSON |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+Alt+S` | Save full editable backup JSON |
| `Ctrl+K` | Open original Forest Kit ZIP |
| `Ctrl+E` | Export Forest Kit World ZIP from the World Grid |
| `Ctrl+Z` | Undo map edit |
| `Ctrl+0` | Fit view |

The app stores autosaves, map thumbnails, and cached kit data inside **its local Electron profile** (IndexedDB), separate from Chrome's storage. Files from the earlier Android/browser app **do not automatically migrate**. Export a full backup from the old app and open that JSON in the Windows application.

## Forest Kit compatibility

The World Grid still exports the kit's `forest-map-kit-world` format v2, including `world.json`, `overview.png`, and `cells/A1/map.json`, `cells/A1/collision.png`, etc. Each cell remains **1254×1254** pixels. The SpireWrought Unity importer you already have reads that format; it is not bundled or modified here.

Custom pixel-art assets can be used inside Map Forge and included in editable backups, but the unchanged game importer cannot read those custom assets in a Forest Kit World ZIP. Map Forge warns/refuses unsupported World Grid exports rather than silently dropping artwork.

## Security and privacy

The Electron application uses a private `mapforge://` protocol, context isolation, a sandboxed renderer, disabled Node integration, restricted navigation, and narrow file-dialog IPC. It never uploads the licensed kit. No automatic updates, analytics, or network access to artwork are built in.

## Current scope / limits

This is the **desktop conversion and workflow foundation**, now includes advanced biome and route planning, but not a native Unity pipeline. The Forest Kit map-square generator and object editor are preserved. Large 9×9 worlds still consume substantial RAM and disk space for previews and exports; the Windows build has not been tested on your specific PC.

## V3.2 editable terrain and village generation

World Grid can independently enable or disable roads, rivers, villages, and buildings. Draw and erase paths or add/move/delete houses in Map Editor. The original Forest Kit ZIP format remains valid; extra transparent terrain artwork and editable metadata are exported under `extended/` for future Unity integration. No changes are made to the separate game repository.
