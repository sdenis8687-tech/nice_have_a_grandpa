import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export function createNameLabel(text) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.padding = '4px 8px';
  el.style.background = 'rgba(30,30,46,.8)';
  el.style.color = '#fff';
  el.style.borderRadius = '8px';
  el.style.fontSize = '12px';
  el.style.whiteSpace = 'nowrap';
  return new CSS2DObject(el);
}
