# CLAUDE.md — Инструкции для Claude Code

## Контекст проекта

Ты разрабатываешь интерактивную 3D-сцену «Квиз за круглым столом» — демонстрационный проект, показывающий возможности браузерного 3D-моделирования. Полное техническое задание находится в файле `TECHNICAL_SPEC.md`, архитектурные решения — в `ARCHITECTURE.md`. **Прочитай оба файла перед началом работы.**

## Порядок действий

### Фаза 1: Скаффолдинг
```bash
npm create vite@latest quiz-3d-scene -- --template vanilla
cd quiz-3d-scene
npm install three@^0.160.0 gsap@^3.12.0
npm install -D vite
```

Создай структуру папок из `TECHNICAL_SPEC.md` (раздел 3). Убедись, что `package.json` содержит `"type": "module"`.

### Фаза 2: Сцена и окружение
1. **`src/main.js`** — инициализация по скелету ниже (см. «Скелет main.js»)
2. **`src/scene/SceneSetup.js`** — освещение (ambient + directional + point), туман, фон, тени
3. **`src/scene/Table.js`** — круглый стол из CylinderGeometry
4. **`src/scene/Chair.js`** — фабрика стульев, расставленных по кругу

### Фаза 3: Персонажи
5. **`src/characters/CharacterConfig.js`** — данные 10 персонажей (скопируй из `TECHNICAL_SPEC.md`, раздел 4)
6. **`src/characters/CharacterBody.js`** — процедурная low-poly фигурка. **Обязательно следуй иерархии скелета и углам суставов из `ARCHITECTURE.md` раздел «Скелет фигурки»**
7. **`src/characters/CharacterFactory.js`** — создаёт фигурку по конфигу, сажает на стул, поворачивает к центру

### Фаза 4: UI
8. **`src/ui/NameLabel.js`** — CSS2DObject для табличек с именами
9. **`src/ui/SpeechBubble.js`** — CSS2DObject для фраз (облачко с хвостиком)
10. **`src/ui/HUD.js`** — заголовок сцены, подсказка

### Фаза 5: Интерактивность
11. **`src/interaction/Raycaster.js`** — клик/тач по персонажам, hover-подсветка, debounce
12. **`src/interaction/Controls.js`** — OrbitControls с ограничениями

### Фаза 6: Анимации
13. **`src/animation/CameraAnimation.js`** — облёт стола при загрузке (GSAP timeline)
14. **`src/animation/CharacterAnim.js`** — вставание + поднятие руки (GSAP)
15. **`src/animation/ParticleEffects.js`** — конфетти при клике

### Фаза 7: Деплой
16. Настрой `vite.config.js` (см. ниже «Конфиг Vite»)
17. Создай `.github/workflows/deploy.yml` (см. ниже «GitHub Actions»)

---

## Скелет main.js

Используй именно эту структуру. Оба рендерера работают в одном цикле, CSS2DRenderer наложен поверх WebGLRenderer:

```javascript
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

// === DOM ===
const container = document.getElementById('app');

// === WebGL Renderer ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// === CSS2D Renderer (поверх WebGL) ===
const cssRenderer = new CSS2DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.left = '0';
cssRenderer.domElement.style.pointerEvents = 'none'; // КРИТИЧНО: не блокировать клики
container.appendChild(cssRenderer.domElement);

// === Сцена, камера ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 6, 10);
camera.lookAt(0, 0, 0);

// === Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
});

// === Delta time для частиц ===
const clock = new THREE.Clock();

// === Render loop ===
// Порядок: controls → анимации/частицы → WebGL render → CSS2D render
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  // controls.update();
  // updateAllConfetti(delta);
  renderer.render(scene, camera);
  cssRenderer.render(scene, camera); // ПОСЛЕ WebGL
}
animate();
```

**`index.html`** должен содержать:
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Квиз за круглым столом</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #1a1a2e; touch-action: none; }
    #app { position: relative; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## Конфиг Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Для GitHub Pages: замени 'quiz-3d-scene' на имя репозитория
  // Для Vercel/Netlify: убери или поставь base: '/'
  base: '/quiz-3d-scene/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

---

## GitHub Actions для деплоя

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Критически важные правила

### Three.js
- `import * as THREE from 'three'`
- `import { OrbitControls } from 'three/addons/controls/OrbitControls.js'`
- `import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'`
- Все low-poly материалы: **`flatShading: true`**
- **НЕ используй CapsuleGeometry** — используй CylinderGeometry + SphereGeometry
- Версия three: **0.160.0+**

### Персонажи — следуй иерархии скелета из ARCHITECTURE.md

Каждый персонаж при создании должен записать ссылки на свои кости в `userData.bones`:
```javascript
character.userData.bones = {
  upperBody, lowerBody,
  leftLegUpper, leftLegLower,
  rightLegUpper, rightLegLower,
  leftArmPivot, rightArmPivot,
  head
};
character.userData.seatY = character.position.y; // запомнить для возврата
character.userData.characterId = config.id;
```

### Raycaster — debounce + pointer events

```javascript
let lastClickTime = 0;
const CLICK_DEBOUNCE = 800; // мс

function onPointerDown(event) {
  const now = Date.now();
  if (now - lastClickTime < CLICK_DEBOUNCE) return;
  lastClickTime = now;

  const x = event.clientX ?? event.touches?.[0]?.clientX;
  const y = event.clientY ?? event.touches?.[0]?.clientY;
  if (x === undefined) return;

  const mouse = new THREE.Vector2(
    (x / window.innerWidth) * 2 - 1,
    -(y / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects, true);

  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj && !obj.userData.characterId) obj = obj.parent;
    if (obj) handleCharacterClick(obj.userData.characterId);
  }
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
```

### CSS2D — таблички и облачка

Табличка с именем — `pointer-events: none`, `max-width` не нужен (имена короткие).

Облачко с фразой — `max-width: 220px`, `word-wrap: break-word`, `text-align: center`. Хвостик через CSS-треугольник. Анимация появления: `opacity 0→1` + `transform scale(0.5→1)` через CSS transitions. Автоскрытие через 4 секунды (`setTimeout`).

### OrbitControls

```javascript
controls.target.set(0, 0.5, 0);
controls.minDistance = 3;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minPolarAngle = 0.3;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.enabled = false; // Выключено на время облёта, включить после
```

---

## Стиль кода
- ES-модули, без TypeScript
- Комментарии на русском
- JSDoc для фабрик
- `const` / `let`, никаких `var`

## Тестирование

После каждой фазы `npm run dev` и проверка:
- Фаза 2: Стол, стулья, свет, тени на полу
- Фаза 3: 10 фигурок **сидят** (ноги согнуты, торс на уровне стула Y≈0.55)
- Фаза 4: Таблички с именами парят над головами
- Фаза 5: Клик → console.log(characterId), курсор pointer при hover
- Фаза 6: Облёт → клик → встаёт → рука → облачко → конфетти
- Фаза 7: `npm run build` ок, `npm run preview` ок
