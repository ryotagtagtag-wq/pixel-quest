# PIXEL QUEST — 8-Bit Adventure

A responsive retro-style 2D platform game built with **React + Vite + Canvas**. The project is split into reusable React components, a separately maintained Canvas game engine, data-driven level geometry, and an automated GitHub Pages deployment workflow.

## Features

- Side-scrolling pixel-art world, platforms, gaps, hazards, and checkpoints
- Run, jump, attack, stomp enemies, collect relic coins, and fight a multi-hit boss
- Title, pause, game-over, and victory screens
- Score, best score saved in local storage, hearts, exploration progress, and boss HP
- Keyboard and pointer-based touch controls
- Optional synthesized retro sound effects (no external sound assets)
- Responsive desktop/mobile UI and fullscreen mode
- GitHub Actions build + deploy to GitHub Pages
- No external art assets required; game graphics are rendered by Canvas

## Requirements

- Node.js 20 or newer (Node.js 18 may work with compatible npm versions)
- npm
- A GitHub account for publishing the game

## Run locally

```bash
npm install
npm run dev
```

Vite prints a local URL (typically `http://localhost:5173`). Open it in your browser.

## Production build

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`. `npm run preview` serves that built output locally.

## Publish using GitHub Pages (recommended)

1. Create a **new public repository** on GitHub, for example `pixel-quest`. Do not add a README or `.gitignore` in the GitHub creation dialog if you are pushing this folder as-is.
2. Unzip this project and open a terminal in the `pixel-quest` directory.
3. Push the source code to the repository's `main` branch:

   ```bash
   git init
   git add .
   git commit -m "Build PIXEL QUEST retro game"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/pixel-quest.git
   git push -u origin main
   ```

   Replace `YOUR-USERNAME` with your GitHub username. If your repository has a different name, the workflow detects it automatically for the Vite base path.
4. On GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
5. Open the repository's **Actions** tab. Wait for `Deploy PIXEL QUEST to GitHub Pages` to finish successfully. The site URL is shown in the deployment job, usually `https://YOUR-USERNAME.github.io/pixel-quest/`.
6. After each push to `main`, the site will build and deploy automatically. You can also run it manually from Actions using **Run workflow**.

### Why the Vite base path works

`vite.config.js` reads `GITHUB_REPOSITORY` during GitHub Actions builds and sets the Vite `base` to `/<repository-name>/`. Local development uses `/`. That avoids the common asset-path problem with project sites hosted under a GitHub Pages subpath.

## Controls

| Action | Keyboard | Touch / mobile |
|---|---|---|
| Move | `A` / `D` or `←` / `→` | Left / right buttons |
| Jump | `Space`, `W`, or `↑` | Up button |
| Attack | `Z`, `X`, or `J` | Sword button |
| Pause / resume | `P`, `Esc`, or on-screen pause | Pause button |
| Toggle sound | `M` or speaker button | Speaker button |
| Restart | On-screen restart button | On-screen restart button |

**Gameplay hints:** stomp enemies from above or use an attack at close range. Reach teal checkpoint flags to save your respawn position. Defeat the final guardian before entering the exit gate.

## Project structure

```text
pixel-quest/
├── .github/workflows/deploy.yml # GitHub Pages CI/CD
├── src/
│   ├── components/
│   │   ├── Hud.jsx
│   │   ├── ScreenOverlay.jsx
│   │   └── TouchControls.jsx
│   ├── engine/
│   │   ├── GameEngine.js         # Simulation, collisions, rendering, audio
│   │   └── level.js              # Data-driven stage layout
│   ├── hooks/useGameEngine.js    # Canvas engine lifecycle hook
│   ├── App.jsx                   # React page / mission HUD
│   ├── main.jsx                  # React entry point
│   └── styles.css                # Responsive retro UI
├── AI_EDITING_GUIDE.md           # Guidance for other AI / contributors
├── index.html
├── package.json
└── vite.config.js
```

## Editing the project with another AI

Start with `AI_EDITING_GUIDE.md`. Level layout is data-driven in `src/engine/level.js`; React presentation lives in `src/components/` and `src/App.jsx`; the core simulation is in `src/engine/GameEngine.js`. This boundary separation is intended to let an AI edit level balance or presentation without rewriting the entire engine.

## Notes

- Best score is stored locally in the current browser using `localStorage`; it is not a global online leaderboard.
- Audio is generated with the browser's Web Audio API and begins after user interaction. Browsers may block audio until that first interaction.
- The game is client-side only. No backend, account, or server is required.
- This repository intentionally does not include generated `dist/` or `node_modules/` folders; GitHub Actions recreates the build artifact during deployment.
