import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { createScene } from './scene/SceneSetup.js';
import { createRoom } from './scene/Room.js';
import { createTable } from './scene/Table.js';
import { createChair } from './scene/Chair.js';
import { CHARACTERS } from './characters/CharacterConfig.js';
import { createCharacter } from './characters/CharacterFactory.js';
import { createControls } from './interaction/Controls.js';
import { bindRaycast } from './interaction/Raycaster.js';
import { playIntroCamera } from './animation/CameraAnimation.js';
import { animateCharacter } from './animation/CharacterAnim.js';
import { spawnConfetti, updateConfetti } from './animation/ParticleEffects.js';
import { createHUD } from './ui/HUD.js';
import { degToRad } from './utils/helpers.js';

const container = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const cssRenderer = new CSS2DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.left = '0';
cssRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(cssRenderer.domElement);

const { scene, camera } = createScene(window.innerWidth / window.innerHeight);
const controls = createControls(camera, renderer.domElement);
scene.add(createRoom());
scene.add(createTable(CHARACTERS));

const charactersById = new Map();
const clickTargets = [];
const chairRadius = 3.7;

CHARACTERS.forEach((cfg) => {
  const chair = createChair();
  const angle = degToRad(cfg.seatAngle);
  const x = Math.sin(angle) * chairRadius;
  const z = Math.cos(angle) * chairRadius;
  chair.position.set(x, 0, z);
  chair.rotation.y = Math.atan2(-x, -z);
  scene.add(chair);

  const character = createCharacter(cfg);
  scene.add(character);
  charactersById.set(cfg.id, character);
  clickTargets.push(character);
});

bindRaycast(renderer, camera, clickTargets, (id) => {
  const target = charactersById.get(id);
  if (!target) return;
  controls.target.lerp(target.position, 0.2);
  animateCharacter(target, scene, spawnConfetti);
});

const hud = createHUD();
container.appendChild(hud);
playIntroCamera(camera, controls, () => {
  hud.style.opacity = '1';
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  controls.update();
  updateConfetti(delta, scene);
  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

animate();
