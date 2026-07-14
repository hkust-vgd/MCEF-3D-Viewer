// Interactive point-cloud viewer using Three.js.
// Loads a .ply (ASCII or binary, auto-detected by PLYLoader) and renders it as
// colored points with orbit/zoom/pan controls. Lightweight: no splatting, no viser.

import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let renderer, scene, camera, controls, points, animationId, resizeHandler, framedState;

const el = (id) => document.getElementById(id);

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

function dispose() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  if (resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
  if (points) { points.geometry.dispose(); points.material.dispose(); points = null; }
  if (controls) { controls.dispose(); controls = null; }
  if (renderer) { renderer.dispose(); renderer = null; }
  scene = camera = null;
  framedState = null;
}

export function openViewer(url, title, onClose) {
  if (renderer) dispose(); // safety: tear down any existing scene first
  el('viewer-error').classList.add('hidden');
  setLoading(true, 0);
  el('viewer').classList.add('open');
  el('viewer-title').textContent = title || '';

  const w = window.innerWidth, h = window.innerHeight;

  renderer = new THREE.WebGLRenderer({ canvas: el('viewer-canvas'), antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111827);

  camera = new THREE.PerspectiveCamera(60, w / h, 0.01, 5000);
  camera.position.set(0, 0, 5);

  controls = new OrbitControls(camera, el('viewer-canvas'));
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  const loader = new PLYLoader();
  loader.load(
    url,
    (geometry) => {
      const hasColor = !!geometry.attributes.color;
      const material = new THREE.PointsMaterial({
        size: 0.02,
        sizeAttenuation: true,
        vertexColors: hasColor,
      });
      points = new THREE.Points(geometry, material);
      scene.add(points);
      frameGeometry(geometry);
      setLoading(false);
    },
    (xhr) => {
      if (xhr.lengthComputable) setLoading(true, xhr.loaded / xhr.total);
      else setLoading(true, null);
    },
    (err) => {
      const reason = (err && err.target && err.target.status)
        ? `HTTP ${err.target.status}`
        : ((err && err.message) ? err.message : 'Network or parse error');
      showError(
        'Could not load this .ply file.\n' + reason +
        '\n\nCheck the URL in config.js and that the host sends Access-Control-Allow-Origin (see README → CORS).'
      );
    }
  );

  animate();
  bindControls(onClose);
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
  camera.updateProjectionMatrix();
  controls.update();

  framedState = { position: camera.position.clone(), target: controls.target.clone() };

  // Point-size slider scaled to this model's size.
  const slider = el('point-size');
  const min = radius * 0.0005;
  const max = radius * 0.05;
  const def = radius * 0.008;
  slider.min = min;
  slider.max = max;
  slider.step = (max - min) / 100;
  slider.value = def;
  points.material.size = def;
}

function animate() {
  animationId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function bindControls(onClose) {
  const slider = el('point-size');
  slider.oninput = () => { if (points) points.material.size = parseFloat(slider.value); };

  el('viewer-reset').onclick = () => {
    if (!framedState) return;
    camera.position.copy(framedState.position);
    controls.target.copy(framedState.target);
    controls.update();
  };

  el('viewer-back').onclick = () => closeViewer(onClose);

  resizeHandler = () => {
    if (!renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', resizeHandler);
}

export function closeViewer(onClose) {
  dispose();
  el('viewer').classList.remove('open');
  if (typeof onClose === 'function') onClose();
}
