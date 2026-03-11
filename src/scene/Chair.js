import * as THREE from 'three';
import { COLORS } from '../utils/colors.js';

export function createChair() {
  const chair = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: COLORS.chair, flatShading: true });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), mat);
  seat.position.y = 0.35;
  seat.castShadow = true;
  chair.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.05), mat);
  back.position.set(0, 0.55, -0.18);
  back.castShadow = true;
  chair.add(back);

  const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 4);
  [[0.16,0.16],[0.16,-0.16],[-0.16,0.16],[-0.16,-0.16]].forEach(([x,z]) => {
    const leg = new THREE.Mesh(legGeo, mat);
    leg.position.set(x, 0.175, z);
    leg.castShadow = true;
    chair.add(leg);
  });

  return chair;
}
