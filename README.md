# SpireWrought Map Forge — Windows Desktop V3.1

**Windows desktop is the primary development target.** The app retains the original Forest Kit generation and exports, plus a regional world planner for clustered biomes, linked roads/rivers, settlements, protected map squares, and deterministic regeneration. No Unity importer was added or changed.

**Download Windows builds:** [GitHub Actions](https://github.com/bobuildington/SpriteForge/actions/workflows/windows-desktop.yml). Choose the latest successful build and download the `SpireWrought-Map-Forge-v3-1-Windows` artifact (installer + portable EXE). Source archive available from repo checkout.

**Run from source:** install Node.js 22+, then `npm install` and `npm start`. `npm run pack:win` builds the Windows installer and portable app. `npm run check:desktop` checks the desktop source.

**Desktop usage:** World Grid → **Advanced World Planner** (biome regions, roads, river, settlements) → **Plan World** → **Fill empty squares** or **Regenerate unlocked**. Lock finished squares before regeneration. Click a square to preview it and open its detailed 1254×1254 Map Editor. The existing **Tiles & Objects** editor remains available.

**Important export detail:** World ZIP keeps `forest-map-kit-world` version 2, `world.json`, individual `cells/A1/map.json`, `collision.png`, and `overview.png` so the existing SpireWrought importer still recognizes it. New route plans are additional `world-plan.json` and per-cell `planned-routes.png` files. The existing importer does **not** render those new roads/rivers. They are useful design assets for future map art work, not a claim of Unity rendering compatibility. Licensed Forest Kit images are loaded locally and never redistributed.

**Browser editor (legacy):** https://bobuildington.github.io/SpriteForge/ — the desktop source shares its map-editing logic and also receives new planner files at this URL.

See [desktop/README.md](desktop/README.md) for full details, Windows shortcuts, native saving, and build instructions.
