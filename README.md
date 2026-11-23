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
