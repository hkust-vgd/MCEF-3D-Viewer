// MCEF 3D Viewer — map menu + interactions.
// Renders the Leaflet map with one pin per site (from config.js). Clicking a pin
// opens a side panel listing that site's reconstructions; clicking a reconstruction
// opens the Three.js viewer. Closing the viewer returns to the panel.

import { SITES } from './config.js';
import { openViewer } from './viewer.js';

const MAP_CENTER = [22.25, 114.10];
const MAP_ZOOM = 11;

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
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const panel = el('panel');
const panelTitle = el('panel-title');
const panelDesc = el('panel-desc');
const panelList = el('panel-list');

SITES.forEach((site) => {
  const marker = L.marker([site.lat, site.lng], { icon: pinIcon }).addTo(map);
  marker.bindTooltip(site.name, { className: 'site-tooltip', direction: 'top', offset: [0, -8] });
  marker.on('click', () => showPanel(site));
});

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
      openViewer(r.url, r.title, () => showPanel(site)); // Back returns here.
    });
    panelList.appendChild(btn);
  });

  panel.classList.add('open');
}

function hidePanel() {
  panel.classList.remove('open');
}

el('panel-close').addEventListener('click', hidePanel);

function el(id) {
  return document.getElementById(id);
}
