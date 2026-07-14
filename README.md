# MCEF — Underwater 3D Reconstruction Viewer

A lightweight static website that displays underwater 3D-reconstruction **point clouds** (`.ply`) collected around Hong Kong waters. An interactive **map is the menu**: click a location pin to see its reconstructions, then click a reconstruction to open an in-browser 3D viewer (rotate / zoom / pan).

Designed to be hosted on **GitHub Pages**. No build step.

## Tech

- [Leaflet](https://leafletjs.com/) + CARTO Voyager basemap for the map.
- [Three.js](https://threejs.org/) `PLYLoader` + `Points` + `OrbitControls` for the viewer, loaded via an ES-module `importmap` (no npm/Vite).
- Pure vanilla HTML/CSS/JS. You edit **one file** (`config.js`) to add your data.

## Project structure

```
index.html             # markup + CDN/importmap
config.js              # ← EDIT THIS: sites, coordinates, .ply URLs
js/app.js              # map + pins + click interactions
js/viewer.js           # Three.js point-cloud viewer
css/style.css
tools/ply_to_binary.py # optional: ASCII→binary converter
.nojekyll              # serve raw files as-is on GitHub Pages
```

## Adding your data

Edit `config.js`. Each site is a pin on the map with a few reconstructions:

```js
export const SITES = [
  {
    id: 'potoi', name: 'Po Toi Island',
    lat: 22.1628, lng: 114.2553,        // WGS84 decimal degrees
    description: 'Underwater 3D reconstructions off Po Toi Island.',
    reconstructions: [
      { id: 'p1', title: 'Po Toi — Scene 1', url: 'https://your-host/potoi_1.ply' },
      { id: 'p2', title: 'Po Toi — Scene 2', url: 'https://your-host/potoi_2.ply' },
    ],
  },
];
```

### Semantic segmentation (side by side)

For every scene the viewer automatically also loads `X_semantic.ply` — the same point cloud colored by semantic class — and shows it next to the RGB view with a synced camera. No extra config: just upload `<scene>_semantic.ply` alongside `<scene>.ply` (the URL is derived by inserting `_semantic` before `.ply`). If the semantic file is missing, that pane shows "Semantic unavailable" and the RGB pane still works.

## CORS (required — read this)

The site runs on `https://<user>.github.io` but loads `.ply` files from an external host. Browsers block cross-origin fetches unless the host sends an `Access-Control-Allow-Origin` header. For each host serving `.ply` files, ensure responses include:

```
Access-Control-Allow-Origin: *
```

`statics.hkustvgd.com` is our own host, so add this header there. If you cannot change a host, serve the files via:

- **jsDelivr** — `https://cdn.jsdelivr.net/gh/<user>/<repo>@<tag>/<path>.ply` (adds CORS; ≤50 MB/file).
- **Cloudflare R2** / any S3-compatible bucket with CORS enabled (good for large files).

Verify in the browser DevTools → Network: the `.ply` response must show the CORS header, or loading will fail.

## Performance tip: convert ASCII → binary

Large ASCII `.ply` files (e.g. a 3M-point / ~118 MB `whole.ply`) parse synchronously in the browser and freeze the UI for tens of seconds. Converting to **binary PLY** once, offline, makes them ~3–4× smaller and near-instant to parse. The viewer auto-detects either format — no code change.

```
pip install plyfile numpy
python tools/ply_to_binary.py input.ply output.ply
# convert a whole folder:
python tools/ply_to_binary.py --dir path/to/points --out path/to/points_bin
```

Then host the binary `.ply` files and point `config.js` at them.

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

To test the viewer with a real file before setting up remote hosting, drop a `.ply` (binary is best) into the repo and reference it by relative path in `config.js` — e.g. `url: './data/potoi_1.ply'`. Same-origin requests need no CORS headers, so this works locally with zero configuration.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Source: Deploy from a branch → `master` / `(root)`**.
3. `.nojekyll` is included so files serve as-is.
4. Your site is live at `https://<user>.github.io/MCEF-3D-Viewer/`.

## Viewer controls

- **Left-drag** rotate · **right-drag** pan · **scroll** zoom
- **Point size** slider — adjust point size
- **Reset view** — return to the default framing
- **Back** — return to the location's reconstruction list
