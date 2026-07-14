// Interactive point-cloud viewer using Three.js.
// Shows a scene's RGB reconstruction and its semantic segmentation side by side
// in two panes that share ONE camera (orbit/zoom/pan are synced). Lightweight:
// PLYLoader + Points, no splatting, no viser.

import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, controls, animationId, resizeHandler, framedState;
let rgbRenderer, semRenderer, rgbScene, semScene, rgbPoints, semPoints;

const el = (id) => document.getElementById(id);
const panes = () => document.querySelectorAll('#viewer-stage .viewer-pane');
const canvases = () => document.querySelectorAll('#viewer-stage .viewer-canvas');
const statuses = () => document.querySelectorAll('#viewer-stage .pane-status');

// X.ply -> X_semantic.ply (matches the project's paired-file convention).
function semanticUrlFor(url) {
  return url.replace(/\.ply$/i, '_semantic.ply');
}

function reasonOf(err) {
  if (err && err.target && err.target.status) return `HTTP ${err.target.status}`;
  if (err && err.message) return err.message;
  return 'Network or parse error';
}

function setLoading(visible, fraction) {
  const box = el('viewer-loading');
  const fill = el('loading-fill');
  const txt = box.querySelector('.loading-text');
  box.classList.toggle('hidden', !visible);
  if (!visible) return;
  if (fraction == null) {
    fill.style.width = '100%';
    txt.textContent = 'Loading point cloud…';
  } else {
    const pct = Math.round(fraction * 100);
    fill.style.width = pct + '%';
    txt.textContent = `Loading point cloud… ${pct}%`;
  }
}

function showError(message) {
  el('viewer-loading').classList.add('hidden');
  const err = el('viewer-error');
  err.textContent = message;
  err.classList.remove('hidden');
  console.error(message);
}

function setPaneStatus(index, text) {
  const s = statuses()[index];
  if (!s) return;
  if (text == null) { s.classList.add('hidden'); s.textContent = ''; }
  else { s.classList.remove('hidden'); s.textContent = text; }
}

function setSize(s) {
  if (rgbPoints) rgbPoints.material.size = s;
  if (semPoints) semPoints.material.size = s;
}

function updateCameraAspect() {
  const c = canvases()[0];
  if (c && camera) camera.aspect = c.clientWidth / Math.max(c.clientHeight, 1);
}

function frameGeometry(geometry) {
  geometry.computeBoundingSphere();
  const center = geometry.boundingSphere.center.clone();
  const radius = Math.max(geometry.boundingSphere.radius, 1e-3);

  controls.target.copy(center);
  const dir = new THREE.Vector3(1, 0.6, 1).normalize();
  camera.position.copy(center).add(dir.multiplyScalar(radius * 1.8));
  camera.near = radius / 200;
  camera.far = radius * 200;
  updateCameraAspect();
  camera.updateProjectionMatrix();
  controls.update();

  framedState = { position: camera.position.clone(), target: controls.target.clone() };

  // Point-size slider scaled to this model's size; applies to both materials.
  const slider = el('point-size');
  const min = radius * 0.0005;
  const max = radius * 0.05;
  const def = radius * 0.008;
  slider.min = min;
  slider.max = max;
  slider.step = (max - min) / 100;
  slider.value = def;
  setSize(def);
}

// Generic loader: fetch a .ply, build colored Points, add to `scene`.
// paneIndex 0 = RGB (drives main overlay), 1 = Semantic (drives its pane-status).
function loadPly(url, scene, paneIndex, cb) {
  const loader = new PLYLoader();
  loader.load(
    url,
    (geometry) => {
      // Source clouds use Y-down (camera convention); Three.js is Y-up,
      // so flip Y to render right-side up. Applied to both panes identically.
      geometry.scale(1, -1, 1);
      const material = new THREE.PointsMaterial({
        size: 0.02,
        sizeAttenuation: true,
        vertexColors: !!geometry.attributes.color,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);
      cb(null, points);
    },
    (xhr) => {
      if (paneIndex === 0) {
        if (xhr.lengthComputable) setLoading(true, xhr.loaded / xhr.total);
        else setLoading(true, null);
      }
    },
    (err) => cb(err, null)
  );
}

export function openViewer(url, title, onClose) {
  if (rgbRenderer) dispose(); // safety: tear down any existing scene first
  el('viewer-error').classList.add('hidden');
  setPaneStatus(1, null);
  setLoading(true, 0);
  el('viewer').classList.add('open');
  el('viewer-title').textContent = title || '';

  const [rgbCanvas, semCanvas] = canvases();

  rgbRenderer = new THREE.WebGLRenderer({ canvas: rgbCanvas, antialias: true });
  semRenderer = new THREE.WebGLRenderer({ canvas: semCanvas, antialias: true });
  rgbRenderer.setPixelRatio(window.devicePixelRatio);
  semRenderer.setPixelRatio(window.devicePixelRatio);

  rgbScene = new THREE.Scene();
  rgbScene.background = new THREE.Color(0x111827);
  semScene = new THREE.Scene();
  semScene.background = new THREE.Color(0x111827);

  camera = new THREE.PerspectiveCamera(60, 1, 0.01, 5000);
  // Controls on the stage container: pointer/wheel events from either canvas
  // bubble up, so dragging anywhere orbits the shared camera (both panes).
  controls = new OrbitControls(camera, el('viewer-stage'));
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  // RGB (primary) — frames the shared camera.
  loadPly(url, rgbScene, 0, (err, points) => {
    if (err) {
      showError(
        'Could not load the RGB point cloud.\n' + reasonOf(err) +
        '\n\nCheck the URL in config.js and that the host sends Access-Control-Allow-Origin (see README → CORS).'
      );
      return;
    }
    rgbPoints = points;
    frameGeometry(points.geometry); // semantic shares this geometry
    setLoading(false);
  });

  // Semantic (secondary) — degrade gracefully if the file is missing.
  setPaneStatus(1, 'Loading semantic…');
  loadPly(semanticUrlFor(url), semScene, 1, (err, points) => {
    if (err) {
      setPaneStatus(1, 'Semantic unavailable\n(' + reasonOf(err) + ')');
      return;
    }
    semPoints = points;
    setPaneStatus(1, null);
  });

  animate();
  bindControls(onClose);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  controls.update();
  rgbRenderer.render(rgbScene, camera);
  semRenderer.render(semScene, camera);
}

function bindControls(onClose) {
  const slider = el('point-size');
  slider.oninput = () => setSize(parseFloat(slider.value));

  el('viewer-reset').onclick = () => {
    if (!framedState) return;
    camera.position.copy(framedState.position);
    controls.target.copy(framedState.target);
    controls.update();
  };

  el('viewer-back').onclick = () => closeViewer(onClose);

  resizeHandler = () => {
    if (!rgbRenderer) return;
    const [rgbPane, semPane] = panes();
    rgbRenderer.setSize(rgbPane.clientWidth, rgbPane.clientHeight);
    semRenderer.setSize(semPane.clientWidth, semPane.clientHeight);
    updateCameraAspect();
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resizeHandler);
  resizeHandler(); // initial synchronous sizing
}

function dispose() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  if (resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
  for (const pts of [rgbPoints, semPoints]) {
    if (pts) { pts.geometry.dispose(); pts.material.dispose(); }
  }
  rgbPoints = semPoints = null;
  if (controls) { controls.dispose(); controls = null; }
  if (rgbRenderer) { rgbRenderer.dispose(); rgbRenderer = null; }
  if (semRenderer) { semRenderer.dispose(); semRenderer = null; }
  rgbScene = semScene = null;
  camera = null;
  framedState = null;
}

export function closeViewer(onClose) {
  dispose();
  el('viewer').classList.remove('open');
  if (typeof onClose === 'function') onClose();
}
