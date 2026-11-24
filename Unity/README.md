# Map Forge V2.2 Unity import helper

Copy **Unity/Editor** and **Unity/Runtime** folders into your private SpireWrought Unity project below `Assets/`. In Unity choose **Tools → SpireWrought → Import Map Forge ZIP** and select a map ZIP from the browser editor.

The helper unpacks only generated art and JSON into `Assets/MapForgeImports/`. It creates a map root with a baked map SpriteRenderer, `MapForgeMarker` components for spawn/loot/stairs/NPC locations, `MapForgePlacedObject` anchor components with source metadata, and an approximate 32px merged BoxCollider2D grid sampled from the supplied collision mask.

The image is a **baked composite** of all drawn objects. Do not enable an additional set of visual object sprites without changing the composite, or art will be duplicated. To achieve actor/object Y-sorting and exact collision polygons in SpireWrought, the game-side importer will need another pass with your privately licensed source sprites. Licensed Forest Kit graphics are never embedded in this public repository.

This Unity code is a starting integration for your game project. It has not yet been compiled or validated in that Unity version. It does not create a runtime world-cell streaming system.
