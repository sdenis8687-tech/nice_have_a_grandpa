import * as THREE from 'three';
import { COLORS } from '../utils/colors.js';

export function createScene(cameraAspect) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.background);
  scene.fog = new THREE.FogExp2(COLORS.background, 0.015);

  const camera = new THREE.PerspectiveCamera(50, cameraAspect, 0.1, 100);
  camera.position.set(0, 6, 10);
  camera.lookAt(0, 0.5, 0);

  const ambient = new THREE.AmbientLight(0x404060, 0.5);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xfff5e0, 0.8);
  directional.position.set(6, 10, 4);
  directional.castShadow = true;
  directional.shadow.mapSize.set(1024, 1024);
  scene.add(directional);

  const point = new THREE.PointLight(0xffaa44, 1.0, 20, 2);
  point.position.set(0, 2.5, 0);
  scene.add(point);

  return { scene, camera };
}
