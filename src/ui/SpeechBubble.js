import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export function createSpeechBubble(text) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.padding = '8px 10px';
  el.style.background = 'rgba(255,255,255,.95)';
  el.style.color = '#1a1a2e';
  el.style.borderRadius = '12px';
  el.style.fontSize = '13px';
  el.style.maxWidth = '180px';
  el.style.textAlign = 'center';
  el.style.opacity = '0';
  el.style.transform = 'scale(.6)';
  el.style.transition = 'opacity .25s ease, transform .25s ease';
  return new CSS2DObject(el);
}
