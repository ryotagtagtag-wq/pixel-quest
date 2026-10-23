# AI / Contributor Editing Guide

This file describes the intended boundaries so another AI or developer can change the project without accidentally breaking the build or game loop.

## Architecture

- `src/App.jsx`: page composition and React-side mission dashboard.
- `src/components/`: presentational React components (HUD, overlay screens, touch input).
- `src/hooks/useGameEngine.js`: creates and disposes the imperative engine; keep lifecycle cleanup here.
- `src/engine/GameEngine.js`: deterministic-ish simulation loop, keyboard input, collision, combat, drawing, audio.
- `src/engine/level.js`: level data only (world size, collision rectangles, coin positions, enemy spawns, checkpoints, hazards, boss).
- `src/styles.css`: responsive layout, visual theme, mobile touch controls.
- `.github/workflows/deploy.yml`: CI build + GitHub Pages deployment.

## Guardrails when editing

1. Keep the game engine independent of React. It should expose a small API (`start`, `restart`, `togglePause`, `toggleSound`, `setInput`, `startLoop`, `destroy`) and send UI snapshots through `onState`.
2. If adding a new input, add it consistently in the engine's `input` object, keyboard handling, and `TouchControls.jsx` if mobile support is relevant.
3. If changing `WORLD.width`, update the goal placement and the exploration display in `App.jsx` (currently uses 2860).
4. Solids use `{x, y, w, h, kind}`; other level records are documented inline in `level.js`. Keep coordinates in the 480 × 270 logical canvas space vertically.
5. Always remove event listeners and cancel animation frames in `destroy()`.
6. Keep touch buttons on pointer events (not only mouse clicks) so they work on phones and tablets. Never depend on hover-only controls.
7. Run `npm run build` after code changes. The GitHub Pages workflow executes the same build automatically.
8. Do not commit `node_modules/`, `dist/`, credentials, or `.env` secrets.

## Useful extension points

- Add maps and stage choices in `level.js` and a level-selection React component in `src/components/`.
- Add persistent settings alongside the existing best-score key in `GameEngine.js`.
- Add new UI status values in `publish()` and consume them in `Hud.jsx` or `App.jsx`.
- Add sound effects through `beep()` or a separate audio module. Keep sound optional and failure-safe.
