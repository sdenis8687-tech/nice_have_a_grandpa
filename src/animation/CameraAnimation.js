import gsap from 'gsap';

export function playIntroCamera(camera, controls, onDone) {
  const state = { angle: 0, radius: 8, height: 5 };
  const tl = gsap.timeline();
  tl.to(state, {
    angle: Math.PI * 2,
    duration: 5.5,
    ease: 'power1.inOut',
    onUpdate: () => {
      camera.position.set(Math.cos(state.angle) * state.radius, state.height, Math.sin(state.angle) * state.radius);
      camera.lookAt(0, 0.5, 0);
    }
  });
  tl.to(camera.position, {
    x: 5,
    y: 4,
    z: 6,
    duration: 1,
    ease: 'power2.out',
    onUpdate: () => camera.lookAt(0, 0.5, 0),
    onComplete: () => {
      controls.enabled = true;
      onDone?.();
    }
  });
}
