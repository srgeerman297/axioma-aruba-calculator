# Agent rules

Shared rules for every coding agent in this repo. Claude Code reads them through `CLAUDE.md`; Codex reads this file directly.

## Project

Static PWA comparing Aruba and online prices, including customs duties and shipping. There is no build step and no test suite. All app code is in `index.html`; `sw.js` handles offline caching. It is served from the `/axioma-aruba-calculator/` path.

## Who owns what

| Agent | Owns |
|---|---|
| Claude Code | UI and CSS, `manifest.json`, `sw.js`, icons, merging branches |
| Codex | Calculations, duty tables, cart text parsers, tests |

Stay inside your own area. If a task needs a change in the other agent's area, note it in your final message instead of making the change.

## Working together

- Each agent works in its own git worktree and branch. Never edit `main` directly.
- `index.html` holds both areas, so keep changes small and never reformat code you are not changing. Its long single-line functions are deliberate.
- Do not change a function's name or arguments without saying so in your final message.
- Claude Code merges the branches into `main` after both agents finish.

## Before you finish

- Open `index.html` and confirm the app loads with no console errors.
- If you changed anything `sw.js` caches, increase `CACHE_NAME` so installed copies update.
