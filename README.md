# SpireWrought Sprite Forge

A mobile-friendly, installable pixel-art editor for **32×32 four-direction monster sprites**.

## Open on Android

Once GitHub Pages is enabled, launch:

**https://bobuildington.github.io/SpriteForge/**

Open that URL in Chrome, allow it to fully load, then use the Chrome menu **⋮ → Install app**. Do **not** install from a temporary `127.0.0.1` local preview.

## Mobile alignment guides (V5.2)

- The mint **Center** line is now intentionally subtle; it marks the sprite's horizontal center, not the middle of the character.
- The amber **Feet baseline** line is independent and labeled with its Y pixel coordinate. For directional monsters it follows the Down-facing sprite's lowest opaque pixel.
- Tap the two guide chips under the canvas to turn either line on or off. Both options also appear under **Menu → Tools & settings → Canvas overlays**. Settings are remembered on the current device.
- The mobile drawing tools are a **single horizontally swipeable row**, with colors immediately below, to leave more space for art.

## Monster-aware builder (V5.3)

- Builder controls now adapt to the selected species; irrelevant anatomy controls are hidden.
- Slime controls focus on the blob body, surface, face, and extras instead of ears, horns, or a separate head.
- Basic / Advanced builder modes simplify the touch interface, with species-specific help.
- All four facing sprites preview changes before creation; customizations remain editable and are included with project backups.

## Effect Maker (V5.4)

Sprite Forge now supports **two asset modes**:

- **Monsters** — four 32×32 facings (Down, Left, Right, Up) with the existing species-aware builder.
- **Effects** — timed frame animations for spells, projectiles, impact flashes, auras, smoke and particle effects.

### Create an effect

1. Tap **Effects** above the canvas.
2. Tap **Effect Maker**.
3. Choose one of 10 presets: Fireball, Magic Bolt, Explosion, Slash Arc, Lightning, Poison Cloud, Healing Shimmer, Hit Impact, Smoke Puff, or Shield Aura.
4. Choose one of 6 color themes, set **4–12 frames**, **1–18 FPS**, and whether the animation loops.
5. Preview the animated effect, then tap **Generate editable effect**.
6. Tap/swipe frame thumbnails to edit individual 32×32 frames. Use the pixel editor, onion skin, frame duplication, Undo, and recoloring.
7. Export a transparent PNG strip, GIF, metadata JSON, editable backup, or Unity-ready ZIP.

**Effects do not use facing-direction controls.** The feet baseline is hidden for effect projects. A generator replaces the current open project only after confirmation; export a backup before replacing unsaved art.

### Unity export layout

An effect with 8 frames becomes a **256×32 PNG** with frames ordered left to right (each 32×32). The ZIP includes a JSON with FPS, frame duration, loop mode, and pixel rectangles, plus a project backup and import instructions.

**Android updates:** Load the GitHub Pages URL in Chrome while online, refresh once, then reopen the installed app to pick up the V5.4 offline cache. Old projects remain importable.

## Map Forge (V5.5)

Open **[Map Forge](https://bobuildington.github.io/SpriteForge/maps/)** inside the Sprite Forge app (Monsters · Effects · Maps).

This dedicated forest map maker is built around the **Tiny Realms Forest Map Kit HTML v2.0** format, but it **does not include or redistribute any of the kit's licensed artwork**. The kit's licence permits use in finished commercial games, but prohibits republishing the raw assets in a public tool, template, or stock library.

### Load the licensed kit on Android

1. Keep your own original `TinyRealms_ForestMapKit_HTML_v2.0.zip` in your Android downloads.
2. Open [Map Forge](https://bobuildington.github.io/SpriteForge/maps/) in Chrome or from the installed Sprite Forge PWA.
3. Tap **Load kit ZIP** and select the ZIP from your phone. The browser reads its contents locally without uploading them.
4. Optionally tap **Save offline** to store the ZIP in browser-managed storage (roughly 101 MB). This can fail if Android storage quota is low.
5. Tap **Generate**. Choose the base ground, overlay, theme, density, and numeric seed.
6. Use **Place** to select individual trees, bushes, rocks, logs and 19 other categories, then tap on the map. Use **Select**, **Pan**, and zoom controls for manual edits; toggle collision overlay.
7. Use **Save / Export** for a Unity map ZIP, transparent objects PNG, collision PNG, composite map PNG, map.json, and editable Map Forge JSON. The local library can retain up to 20 map recipes.

The exported `map.json` follows **forest-map-kit-map v2** with a 1254×1254 map, original ground filenames, source foot pivots, depth sort lines, object footprints, and overlay water metadata. Unity integration is still a separate step: bring the original licensed kit into your **private** Unity project and import or consume the exported JSON and pictures. The sample bundle README documents the data and import guidance.

**Important scale note:** The kit targets character art around 63 pixels tall, while original SpireWrought sprites are 32×32. Adjust actor or map scale in Unity rather than assuming a 1:1 character size.

A world-grid / multi-cell seamless travel importer is **not yet included**. You can generate and save individual map cells.

## Features

- Seven editable monster starters (rat, slime, bat, goblin, skeleton, golem, spider)
- Down, Left, Right, Up sprite directions with shared guidance and four-view comparison
- Monster Builder for body/head and accessory variants
- Global recoloring across directions
- Touch-friendly drawing, pixel cursor, zoom, mirror and Undo
- Local monster library, project backups, transparent PNG and Unity-ready ZIP export
- Offline operation after the initial HTTPS visit

## GitHub Pages deployment

This repository includes **.github/workflows/pages.yml**, which publishes the site on changes to `main`. To complete the one-time GitHub Pages setup:

1. Open **Settings → Pages** on this repository.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open **Actions**, select **Deploy Sprite Forge to Pages**, and run the workflow if it has not run yet.
4. Once deployment succeeds, open **https://bobuildington.github.io/SpriteForge/** on your Android phone.
5. Load/reload once online, install from Chrome, then test launching in airplane mode.

> If the Pages setting is initially unavailable, make sure GitHub Actions are enabled for the repository. A first deployment can take a moment to be published.

## File structure

- `index.html` – complete Sprite Forge editor
- `manifest.webmanifest` – Android install metadata
- `service-worker.js` – offline app shell and cache management
- `icon-192.png`, `icon-512.png` – install icons
- `.github/workflows/pages.yml` – automatic Pages deployment

### Important data note

Projects and the library are stored in your browser's local storage. When moving from `127.0.0.1` to a new HTTPS origin, existing projects do not transfer automatically. Export backups from the old site before removing its installation, then import them into the hosted app.
