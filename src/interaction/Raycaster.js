import * as THREE from 'three';

export function bindRaycast(renderer, camera, clickableObjects, onCharacterClick) {
  const raycaster = new THREE.Raycaster();
  let lastClickTime = 0;
  const CLICK_DEBOUNCE = 800;

  function onPointerMove(event) {
    const mouse = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    renderer.domElement.style.cursor = intersects.length ? 'pointer' : 'default';
  }

  function onPointerDown(event) {
    const now = Date.now();
    if (now - lastClickTime < CLICK_DEBOUNCE) return;
    lastClickTime = now;

    const x = event.clientX ?? event.touches?.[0]?.clientX;
    const y = event.clientY ?? event.touches?.[0]?.clientY;
    if (x === undefined) return;

    const mouse = new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    if (!intersects.length) return;

    let obj = intersects[0].object;
    while (obj && !obj.userData.characterId) obj = obj.parent;
    if (obj) onCharacterClick(obj.userData.characterId);
  }

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
}
