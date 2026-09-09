# Local voice slot

Place only audio that you are authorized to redistribute in this directory. Register each file in `window.ARK_MASCOT_VOICE_ASSETS` before loading `js/main.js`; the runtime accepts local paths under `assets/mascot/voice/` and keeps one audio channel active.

All pages load `catalog.js` before `js/main.js`. It currently registers an empty catalog, so no actual voice file is included. Add an entry only after the source, redistribution permission, license scope, and replacement/removal conditions are recorded in `../SOURCES.md`.
