// MCEF 3D Viewer — map menu + interactions.
// Renders the Leaflet map with one pin per site (from config.js). Clicking a pin
// opens a side panel listing that site's reconstructions; clicking a reconstruction
// opens the Three.js viewer. The viewer is loaded lazily so the map renders even
// if the Three.js CDN is unreachable.

import { SITES } from '../config.js';

const MAP_CENTER = [22.25, 114.10];
const MAP_ZOOM = 11;

function showFatal(msg) {
  console.error('[MCEF]', msg);
  const el = document.getElementById('fatal-error');
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

// Lazily load the Three.js viewer only when a reconstruction is clicked.
let viewerModulePromise = null;
async function openViewerLazy(url, title, onClose) {
  try {
    if (!viewerModulePromise) viewerModulePromise = import('./viewer.js');
    const { openViewer } = await viewerModulePromise;
    openViewer(url, title, onClose);
  } catch (e) {
    showFatal(
      'Could not load the 3D viewer: ' + (e && e.message ? e.message : e) +
      '\nCheck that cdn.jsdelivr.net is reachable (or vendor the libraries locally — see README).'
    );
  }
}

try {
  const map = L.map('map', { zoomControl: false }).setView(MAP_CENTER, MAP_ZOOM);
  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  // Custom pin (div icon) — avoids Leaflet's default-marker image-path issues.
  const pinIcon = L.divIcon({
    className: 'pin',
    html: '<div class="pin-dot"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  SITES.forEach((site) => {
    const marker = L.marker([site.lat, site.lng], { icon: pinIcon }).addTo(map);
    marker.bindTooltip(site.name, { className: 'site-tooltip', direction: 'top', offset: [0, -8] });
    marker.on('click', () => showPanel(site));
  });

  // Re-measure in case the container was laid out late.
  setTimeout(() => map.invalidateSize(), 0);
} catch (e) {
  showFatal(
    'Map failed to initialize: ' + (e && e.message ? e.message : e) +
    '\nIs Leaflet reachable? Open the browser console (F12) for details.'
  );
}

const panel = document.getElementById('panel');
const panelTitle = document.getElementById('panel-title');
const panelDesc = document.getElementById('panel-desc');
const panelList = document.getElementById('panel-list');

function showPanel(site) {
  panelTitle.textContent = site.name;
  panelDesc.textContent = site.description || '';
  panelList.innerHTML = '';

  site.reconstructions.forEach((r) => {
    const btn = document.createElement('button');
    btn.className = 'recon-item';
    btn.textContent = r.title || r.id;
    btn.addEventListener('click', () => {
      hidePanel();
      openViewerLazy(r.url, r.title, () => showPanel(site)); // Back returns here.
    });
    panelList.appendChild(btn);
  });

  panel.classList.add('open');
}

function hidePanel() {
  panel.classList.remove('open');
}

document.getElementById('panel-close').addEventListener('click', hidePanel);
