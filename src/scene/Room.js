import * as THREE from 'three';
import { COLORS } from '../utils/colors.js';

export function createRoom() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: COLORS.floor, flatShading: true })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  return floor;
}
