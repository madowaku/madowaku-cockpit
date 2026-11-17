# MGSF Astryx pilot lab

Independent React 19 + Vite playground. It does not affect the cockpit production UI or the public madowaku-world site.

## Run

cd experiments/astryx
npm install
npm run dev
npm run build
npm test
npm run astryx -- doctor --json
npm run bridge:evidence > astryx-evidence.local.json

Astryx scoped packages are pinned together to 0.7.9 for the pilot. Install inside **this folder**, not the repository root. The CSS import order is reset, core, neutral theme. A lockfile will be committed after installation is verified with npm-registry access; this pilot is **not yet** claimed to have passed npm install or a browser build.

Use the local UI to test keyboard focus, status narration, mobile overflow, and reduced-motion. Compare with existing cockpit controls before adoption. Keep any evidence JSON local and review it before reuse.

See ../../docs/mgsf-astryx-design-bridge-m0.1.md.
