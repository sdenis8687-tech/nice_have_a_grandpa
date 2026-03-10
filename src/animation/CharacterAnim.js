import gsap from 'gsap';

let activeId = null;
const timelines = new Map();

function setBubbleVisible(character, visible) {
  const el = character.userData.speechBubble.element;
  el.style.opacity = visible ? '1' : '0';
  el.style.transform = visible ? 'scale(1)' : 'scale(.6)';
}

export function animateCharacter(character, scene, spawnConfetti) {
  const id = character.userData.characterId;
  if (activeId === id) {
    return animateToSit(character);
  }

  if (activeId && timelines.has(activeId)) {
    timelines.get(activeId).kill();
    animateToSit(timelines.get(activeId).data.character);
  }

  const b = character.userData.bones;
  const tl = gsap.timeline({ data: { character } });
  tl.to(character.position, { y: 0.35, duration: 0.8, ease: 'power2.out' }, 0);
  tl.to([b.leftLegUpper.rotation, b.rightLegUpper.rotation], { x: 0, duration: 0.7 }, 0.1);
  tl.to([b.leftLegLower.rotation, b.rightLegLower.rotation], { x: 0, duration: 0.7 }, 0.1);
  tl.to(b.upperBody.rotation, { x: -0.05, duration: 0.3 }, 0.2);
  tl.to(b.rightArmPivot.rotation, { z: -Math.PI * 0.75, x: 0, duration: 0.5, ease: 'back.out(1.7)' }, 0.4);
  tl.to(b.leftArmPivot.rotation, { x: 0, z: 0.1, duration: 0.4 }, 0.4);
  tl.call(() => setBubbleVisible(character, true), null, 0.6);
  tl.call(() => spawnConfetti(scene, character.position), null, 0.7);
  tl.call(() => setBubbleVisible(character, false), null, 4.0);

  activeId = id;
  timelines.set(id, tl);
  return tl;
}

export function animateToSit(character) {
  const b = character.userData.bones;
  const tl = gsap.timeline();
  tl.to(character.position, { y: character.userData.seatY, duration: 0.6, ease: 'power2.inOut' }, 0);
  tl.to([b.leftLegUpper.rotation, b.rightLegUpper.rotation], { x: -Math.PI / 2, duration: 0.5 }, 0);
  tl.to([b.leftLegLower.rotation, b.rightLegLower.rotation], { x: Math.PI / 2, duration: 0.5 }, 0);
  tl.to([b.leftArmPivot.rotation, b.rightArmPivot.rotation], { x: -Math.PI / 4, z: 0, duration: 0.4 }, 0);
  tl.to(b.upperBody.rotation, { x: 0, duration: 0.3 }, 0);
  tl.call(() => setBubbleVisible(character, false));
  if (activeId === character.userData.characterId) activeId = null;
  return tl;
}
