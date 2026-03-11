import * as THREE from 'three';
import { COLORS } from '../utils/colors.js';
import { randomRange } from '../utils/helpers.js';

let active = null;

export function spawnConfetti(scene, position) {
  if (active) {
    scene.remove(active.points);
    active = null;
  }
  const count = 140;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const velocities = [];
  const c = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y + 1;
    positions[i * 3 + 2] = position.z;
    const col = COLORS.confetti[i % COLORS.confetti.length];
    c.setHex(col);
    colors.set([c.r, c.g, c.b], i * 3);
    velocities.push(new THREE.Vector3(randomRange(-1.3, 1.3), randomRange(0.9, 2.8), randomRange(-1.3, 1.3)));
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, depthWrite: false, opacity: 0.95 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  active = { points, velocities, lifetime: 1.8 };
}

export function updateConfetti(delta, scene) {
  if (!active) return;
  const attr = active.points.geometry.attributes.position;
  for (let i = 0; i < active.velocities.length; i += 1) {
    const v = active.velocities[i];
    v.y -= 3.4 * delta;
    attr.array[i * 3] += v.x * delta;
    attr.array[i * 3 + 1] += v.y * delta;
    attr.array[i * 3 + 2] += v.z * delta;
  }
  attr.needsUpdate = true;
  active.lifetime -= delta;
  if (active.lifetime <= 0) {
    scene.remove(active.points);
    active = null;
  }
}
