# Map Forge V3.2 terrain extension — Codex handoff (SpireWrought)

**The SpireWrought game repository has not been modified.** This document describes *additional* data that Map Forge emits; it does not claim that the current Unity importer displays or collides with the new artwork.

## Compatibility with the original Forest Map Kit exporter

The existing `UnityProject/Assets/Editor/ArenaMapKitImport.cs` expects the following files and format in a world ZIP:

- `world.json`: `format="forest-map-kit-world"`, `version=2`, `cols`, `rows`, and named `cells`
- `cells/A1/map.json`: `format="forest-map-kit-map"`, `version=2`, `size=[1254,1254]`, `pixelsPerMetre=37`, `ground.tile`, `ground.overlay`, and original kit `objects`
- `cells/A1/collision.png`: existing Forest Kit collision mask with its established semantics
- `overview.png`: world thumbnail

**All of those remain present and retain their original meaning.** The importer resolves Forest Kit PNGs from the user's separately extracted licensed kit. The Map Forge project does not redistribute that artwork.

## Extra files for each square

When a square contains generated or hand-edited terrain, Map Forge additionally emits:

```
world-plan.json                          # optional world-level planner metadata
MAPFORGE_TERRAIN_README.txt
cells/A1/extended/terrain-design.json  # editable source of truth
cells/A1/extended/terrain.png          # combined transparent composited artwork
cells/A1/extended/roads.png            # transparent road artwork (when present)
cells/A1/extended/rivers.png           # transparent river artwork (when present)
cells/A1/extended/clearings.png        # transparent clearing texture (when present)
cells/A1/extended/buildings.png        # transparent village building art (when present)
```

The single-square `Map Forge Unity map ZIP` also emits `extended/terrain-design.json` and matching transparent PNG layers at the ZIP root. The legacy `map.json` may include `terrainDesign` as an extra field; the original importer ignores it.

All extended images use the map square's **1254×1254 pixel space**, top-left origin with Y growing downward. PNGs have transparency outside their artwork. `terrain.png` is painted in this order: clearings → rivers → roads → buildings. Original kit ground and overlay should render **behind** the new terrain layer. Trees and other original kit objects usually render above the new terrain.

### `terrain-design.json` schema

```json
{
  "format": "spirewrought-terrain-design",
  "version": 1,
  "size": [1254, 1254],
  "seed": 123456,
  "paths": [
    {"id":"roads-0", "kind":"road", "width":64, "points":[[0,627],[130,620],[1254,627]], "source":"generated"},
    {"id":"hand-abc", "kind":"river", "width":110, "points":[[400,0],[410,120]], "source":"manual"}
  ],
  "buildings": [
    {"id":"house-0", "x":430, "y":640, "w":80, "h":64, "kind":"cottage", "roof":0, "source":"generated"}
  ],
  "clearings": [{"x":627, "y":627, "rx":335, "ry":300, "source":"generated"}],
  "roadsEnabled": true,
  "riversEnabled": true,
  "villageEnabled": true
}
```

- `paths[]`: editable world-space polyline control points, with a type and pixel-width. Border endpoints of planned roads and rivers are paired across adjacent squares.
- `buildings[]`: original procedurally drawn visual art, centered on `(x,y)`, with dimensions `w,h`. Currently no separate Unity prefab linkage or native GameObject placement is generated.
- `clearings[]`: nonblocking ellipses used to visually soften settlement sites.
- `source`: `generated` versus `manual`; all are editable in the map app.

## Suggested importer integration (future work only)

1. Read `extended/terrain.png` when it exists and display it as a transparent sprite **above kit overlay but below kit objects**. Use point filtering and map scale identical to the original ground. Do not double-draw individual road/river/village layers if using the combined PNG.
2. Keep existing Forest Kit collision logic intact. If gameplay requires it, derive *additional* collision from `terrain-design.json`: river paths may block or slow movement except bridges, and building footprints may block movement while leaving doorway access. Neither additional collision rule is currently implemented by Map Forge.
3. Read editable `paths` and `buildings` only if Unity-side authoring is desired. Keep raw source coordinates in the same top-left system and convert to Unity Y-up when placing assets.
4. No changes to `world.json` or legacy `map.json` are required to use the extension. A world ZIP without `extended/` remains valid.
5. Use the world-wide `world-plan.json` to understand regional biomes, optional generation switches, settlement types and border endpoints. Respect the `locked` field when regenerating.

## Intentionally not implemented here

- No modifications to `bobuildington/Spirewrought`, its C# importer, scenes or `.meta` files
- No assumptions about whether roads are traversable or rivers are blocking
- No automatic bridge collision, navmesh carving, doorway placement or village NPC spawning
- No redistribution of the original Tiny Realms Forest Kit artwork
