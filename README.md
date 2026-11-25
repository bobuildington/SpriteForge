# SpireWrought Map Forge Desktop V3.2

**Desktop-first Windows map editor** for the 1254×1254 squares used by the Tiny Realms Forest Map Kit. The full-size world grid previews individual maps with terrain and objects. The app includes the Map Editor and the Tiles & Objects pixel studio.

**[Windows Desktop Builds](https://github.com/bobuildington/SpriteForge/actions/workflows/windows-desktop.yml)** · [Browser version](https://bobuildington.github.io/SpriteForge/) · [Importer extension handoff](docs/TERRAIN_EXPORT_V3_2.md)

## New in V3.2: optional roads, rivers, and villages

Open **World Grid → Advanced World Planner**. Each option can be controlled independently:

- **Generate roads** — when unchecked, no main or local village roads are created; when checked, choose main road or connected road network.
- **Generate river artwork** — creates an aligned river across map squares, or no river when unchecked.
- **Generate villages / settlements** — generates settlement sites and clearings, or no settlement content when unchecked.
- **Generate village buildings** — separate switch available when settlements are enabled. If unchecked, settlement markers remain, but the editor adds no houses or village clearing artwork.
- **Village count** — sets how many settlements to plan when enabled. **Biome regions**, density and seed remain configurable.

Select **Plan World** to review the proposal, then **Fill empty squares** or **Regenerate unlocked** to apply it. Locked squares are never overwritten automatically, including when generation options are disabled. Each square has its own reproducible plan and original kit artwork.

## Actual, editable terrain art

Roads, rivers, village clearings and houses are now generated as *transparent artwork*, not merely the planning overlays used in V3.1. Each square's terrain is saved as editable path points and building records, with a 1254×1254 rendered preview.

Select a square → **Open square** → **Map Editor → Place → Terrain & village artwork** to use:

- Draw road / Draw river (mouse-drag, adjustable width)
- Erase art (remove nearby paths or buildings)
- Add house (choose hut, cottage, workshop or hall)
- Move house (click and drag an existing house)
- Delete house
- Reset to generated terrain / Clear all terrain artwork

Map editing uses normal Undo and preserves the terrain in project saves, cell saves and full backups. The current licensed Forest Kit assets remain untouched.

## Exports and Codex compatibility

The **Forest Kit World ZIP** still includes its original `world.json`, separate `cells/<cell>/map.json` and `collision.png`, and `overview.png`, matching the existing `ArenaMapKitImport` in SpireWrought.

New original terrain artwork goes into an **optional, clearly separated `extended/` folder** per cell: transparent `terrain.png`, `roads.png`, `rivers.png`, `clearings.png`, `buildings.png` (only when relevant), and an editable `terrain-design.json`. The individual map ZIP includes similar layers. Read [TERRAIN_EXPORT_V3_2.md](docs/TERRAIN_EXPORT_V3_2.md) for Codex-facing schema and recommended rendering order.

**The existing game importer ignores those additional layers.** They are not represented in current Unity scenes until Codex updates the importer separately. This repository update does **not** change the SpireWrought game repo. The legacy collision mask remains unchanged; road/river/building collision is not generated for gameplay yet.

## Windows development

```sh
npm install
npm run test:terrain
npm run check:desktop
npm run pack:win
```

Windows installers and portable executables are built in GitHub Actions from source changes. The original Forest Kit ZIP is never committed or included in an installer; users load their licensed copy from local disk. Source is bundled using Electron.

## Stability

The map and terrain source were browser-tested using original kit data (4 grounds, 29 overlays, 259 objects). Regression tests exercise optional generation switches, deterministic world plans, border alignment, drawing/moving houses, PNG exports, and ZIP structure. Windows packaging remains dependent on the hosted Windows build workflow; check the Actions result before treating an installer as ready.
