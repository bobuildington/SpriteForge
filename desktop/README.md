# SpireWrought Map Forge — Windows Desktop V3.0

This is the **desktop-first** edition of Map Forge, built from the existing World Grid, Map Editor, and Tile & Object Studio.

**No changes were made to the separate SpireWrought Unity project or its Forest Kit importer.** Forest Kit World Grid ZIP exports retain the existing format.

## Download the Windows executable

Open [Windows builds](https://github.com/bobuildington/SpriteForge/actions/workflows/windows-desktop.yml), choose the newest **successful** run, and under **Artifacts** download **SpireWrought-Map-Forge-v3-Windows**. Extract the artifact ZIP to find the two Windows x64 executables:

- `SpireWrought-Map-Forge-Setup-3.0.0-x64.exe` — installable app with desktop/Start shortcuts.
- `SpireWrought-Map-Forge-Portable-3.0.0-x64.exe` — no installation required.

These builds are unsigned. Windows SmartScreen may show an *Unknown publisher* warning; verify the GitHub Actions run and downloaded source before deciding whether to run the executable. If a build fails or has not completed, inspect that Actions run.

## Run from source

On Windows with Node.js 22 or later:

```powershell
npm install
npm start
```

To create the installer and portable app yourself:

```powershell
npm run check:desktop
npm run pack:win
```

`npm run prepare` uses the **current** `index.html` and `world/index.html` at the repository root and creates the desktop-specific `web/` directory. This keeps Forest Kit ZIP exporters and map tools aligned with the website. Generated `web/` is not committed.

## Desktop controls

The app opens in a large resizable window with dedicated **World Grid**, **Map Editor**, and **Tiles & Objects** sections, a wider editing canvas, native menus, keyboard shortcuts, and native Save/Open dialogs. The existing terrain generation, per-square thumbnails, object move/delete, custom tile groups, and Map Kit World ZIP export remain.

| Keys | Result |
|---|---|
| Ctrl+1 / Ctrl+2 / Ctrl+3 | World / Map / Tile-Object Studio |
| Ctrl+K | Select original Forest Kit ZIP |
| Ctrl+O | Open a `.json` Map Forge project or complete backup |
| Ctrl+S | Save current map JSON to disk; subsequent saves reuse its path |
| Ctrl+Shift+S | Save current map JSON under a new name |
| Ctrl+Alt+S | Export an editable backup with saved maps, world cells, and custom art |
| Ctrl+E | Open/export the Forest Kit World ZIP |
| Ctrl+Z | Undo map edit |
| Ctrl+0 | Fit map or world into view |

PNG/ZIP/JSON exports from the existing editor open a Windows file-save dialog. Project files are stored on your disk; the application's **autosaves, thumbnails, and optional cached Forest Kit ZIP** also use a private local Electron profile (IndexedDB).

**Migration:** Desktop app storage and your old Android/Chrome storage are separate. Export the old **Full backup** JSON and open it in the Windows app; select the original Forest Kit ZIP if the imported project references its art.

## Forest Kit sizes and compatibility

- Each original World Grid cell: **1254×1254 px**.
- Original kit ground/overlay: **1254×1254 px**.
- Optional custom paint tiles: **32×32 px**, with custom placeable objects of various sizes.
- World Grid export: `forest-map-kit-world` version 2 with `world.json`, `overview.png`, and per-cell `map.json` and `collision.png`.

Your current Unity importer reads the original artwork from the licensed kit folder. It does **not** import custom art from a World Grid ZIP; the app continues to warn about unsupported exports rather than discard artwork silently.

## Security and limitations

Licensed kit artwork is **not shipped**, uploaded, or redistributed. Electron uses a restricted `mapforge://` protocol, sandboxed renderer, context isolation, no renderer Node.js integration, blocked external navigation, and file-dialog-only native access. No auto-update or telemetry is included.

This release is the **desktop packaging and editing-workflow foundation**. It does not yet replace the procedural generator with a full biome/road/river algorithm, remove the custom-asset limit, or automatically integrate with Unity. Huge multi-square worlds can still need substantial memory. Native Windows behavior has not yet been tested on your personal PC.
