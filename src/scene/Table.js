import * as THREE from 'three';
import { COLORS } from '../utils/colors.js';
import { randomRange } from '../utils/helpers.js';

export function createTable(characters) {
  const table = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: COLORS.table, flatShading: true });

  const top = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.08, 24), mat);
  top.position.y = 0.65;
  top.castShadow = true;
  top.receiveShadow = true;
  table.add(top);

  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.65, 8), mat);
  leg.position.y = 0.325;
  leg.castShadow = true;
  table.add(leg);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 12), mat);
  base.position.y = 0.025;
  base.castShadow = true;
  base.receiveShadow = true;
  table.add(base);

  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });
  const pencilMat = new THREE.MeshStandardMaterial({ color: 0xffd700, flatShading: true });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x9ed2ff, transparent: true, opacity: 0.3, depthWrite: false, flatShading: true });

  characters.forEach((character) => {
    const a = (character.seatAngle * Math.PI) / 180;
    const x = Math.sin(a) * 2.4;
    const z = Math.cos(a) * 2.4;
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.005, 0.1), paperMat);
    paper.position.set(x, 0.69, z);
    table.add(paper);

    const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 4), pencilMat);
    pencil.position.set(x + 0.05, 0.69, z + 0.03);
    pencil.rotation.x = Math.PI / 2;
    pencil.rotation.z = randomRange(-0.3, 0.3);
    table.add(pencil);
  });

  for (let i = 0; i < 5; i += 1) {
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 6), glassMat);
    const a = randomRange(0, Math.PI * 2);
    const r = randomRange(0.4, 1.8);
    glass.position.set(Math.sin(a) * r, 0.70, Math.cos(a) * r);
    table.add(glass);
  }

  return table;
}
