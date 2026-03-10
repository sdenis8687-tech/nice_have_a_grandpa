# Техническое задание: Интерактивная 3D-сцена «Квиз за круглым столом»

## 1. Общее описание

**Цель:** Интерактивная 3D-сцена в браузере. За круглым столом сидят 10 стилизованных low-poly фигурок, играющих в квиз. При клике персонаж встаёт, тянет руку, над ним появляется облачко с фразой.

**Визуальный стиль:** Low-poly (в духе Monument Valley) — чистые грани, мягкие цвета, процедурная геометрия, `flatShading: true`.

**Деплой:** GitHub Pages / Vercel / Netlify — статический сайт по публичной ссылке.

---

## 2. Технологический стек

| Компонент | Технология | Версия |
|---|---|---|
| Сборка | Vite | 5+ |
| 3D-движок | Three.js | 0.160.0+ |
| Камера | OrbitControls (three/addons) | — |
| UI-оверлей | CSS2DRenderer (three/addons) | — |
| Анимации | GSAP | 3.12+ |
| Частицы | THREE.Points (custom) | — |
| Язык | JavaScript ES2022+ | — |

**Требование к Node.js:** 18+ (для Vite и npm ci).

---

## 3. Структура проекта

```
quiz-3d-scene/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── favicon.ico
├── src/
│   ├── main.js                 # Инициализация, render loop, resize
│   ├── scene/
│   │   ├── SceneSetup.js       # Сцена, камера, свет, фон, туман
│   │   ├── Table.js            # Круглый стол + декор на столе
│   │   ├── Chair.js            # Стул (переиспользуемый)
│   │   └── Room.js             # Пол + опционально стены
│   ├── characters/
│   │   ├── CharacterFactory.js # Фабрика персонажей
│   │   ├── CharacterConfig.js  # Данные 10 персонажей
│   │   └── CharacterBody.js    # Процедурная low-poly фигурка
│   ├── ui/
│   │   ├── NameLabel.js        # CSS2DObject — таблички с именами
│   │   ├── SpeechBubble.js     # CSS2DObject — облачко с фразой
│   │   └── HUD.js              # Заголовок, подсказка
│   ├── animation/
│   │   ├── CameraAnimation.js  # Авто-облёт при загрузке
│   │   ├── CharacterAnim.js    # Вставание / поднятие руки / возврат
│   │   └── ParticleEffects.js  # Конфетти
│   ├── interaction/
│   │   ├── Raycaster.js        # Клик/тач, hover, debounce
│   │   └── Controls.js         # OrbitControls
│   └── utils/
│       ├── colors.js           # Палитра
│       └── helpers.js          # degToRad, randomRange и т.д.
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

---

## 4. Данные персонажей

```javascript
export const CHARACTERS = [
  {
    id: 'yulia',
    name: 'Юля',
    phrase: 'думайте! думайте!',
    height: 0.85,          // относительный рост (1.0 = средний)
    bodyBuild: 'slim',     // slim | medium | stocky
    gender: 'female',
    hairColor: 0x1a1a1a,
    hairStyle: 'short',    // short | medium | long
    skinColor: 0xf5c6a0,
    shirtColor: 0x6a5acd,
    faceType: 'sharp',     // sharp | round | asian
    hasBeard: false,
    beardColor: null,
    seatAngle: 0           // градусы, позиция за столом
  },
  {
    id: 'arsen',
    name: 'Арсен',
    phrase: 'в этой песне по другому поётся!!',
    height: 1.15,
    bodyBuild: 'stocky',
    gender: 'male',
    hairColor: 0x2d1b0e,
    hairStyle: 'short',
    skinColor: 0xe8b887,
    shirtColor: 0x2e8b57,
    faceType: 'round',
    hasBeard: false,
    beardColor: null,
    seatAngle: 36
  },
  {
    id: 'tanya',
    name: 'Таня',
    phrase: 'ща буду шутить',
    height: 1.0,
    bodyBuild: 'medium',
    gender: 'female',
    hairColor: 0xcc4400,
    hairStyle: 'long',
    skinColor: 0xf5c6a0,
    shirtColor: 0xff6347,
    faceType: 'round',
    hasBeard: false,
    beardColor: null,
    seatAngle: 72
  },
  {
    id: 'katya',
    name: 'Катя',
    phrase: 'хороший стол в этот раз накрыли!',
    height: 1.0,
    bodyBuild: 'medium',
    gender: 'female',
    hairColor: 0xf0d58c,
    hairStyle: 'medium',
    skinColor: 0xf5c6a0,
    shirtColor: 0x4682b4,
    faceType: 'round',
    hasBeard: false,
    beardColor: null,
    seatAngle: 108
  },
  {
    id: 'alena',
    name: 'Алена',
    phrase: 'музыкальный блок я вам точно выиграю',
    height: 0.9,
    bodyBuild: 'slim',
    gender: 'female',
    hairColor: 0x6b4226,
    hairStyle: 'medium',
    skinColor: 0xf5c6a0,
    shirtColor: 0xda70d6,
    faceType: 'round',
    hasBeard: false,
    beardColor: null,
    seatAngle: 144
  },
  {
    id: 'anya',
    name: 'Аня',
    phrase: 'Да! Да! Точно!',
    height: 1.1,
    bodyBuild: 'medium',
    gender: 'female',
    hairColor: 0x1a1a1a,
    hairStyle: 'long',
    skinColor: 0xf0d5a0,
    shirtColor: 0xff69b4,
    faceType: 'asian',
    hasBeard: false,
    beardColor: null,
    seatAngle: 180
  },
  {
    id: 'sasha',
    name: 'Саша',
    phrase: 'полетели как сдурели!',
    height: 1.0,
    bodyBuild: 'stocky',
    gender: 'male',
    hairColor: 0x2d1b0e,
    hairStyle: 'short',
    skinColor: 0xf5c6a0,
    shirtColor: 0x556b2f,
    faceType: 'round',
    hasBeard: true,
    beardColor: 0xcc4400,
    seatAngle: 216
  },
  {
    id: 'olya',
    name: 'Оля',
    phrase: 'телефон мой жирными руками не трогать!',
    height: 1.1,
    bodyBuild: 'medium',
    gender: 'female',
    hairColor: 0x2d1b0e,
    hairStyle: 'long',
    skinColor: 0xf5c6a0,
    shirtColor: 0x708090,
    faceType: 'round',
    hasBeard: false,
    beardColor: null,
    seatAngle: 252
  },
  {
    id: 'rus',
    name: 'Рус',
    phrase: 'Некорректный вопрос!',
    height: 0.9,
    bodyBuild: 'medium',
    gender: 'male',
    hairColor: 0x2d1b0e,
    hairStyle: 'short',
    skinColor: 0xf5c6a0,
    shirtColor: 0x8b4513,
    faceType: 'round',
    hasBeard: false,
    beardColor: null,
    seatAngle: 288
  },
  {
    id: 'denis',
    name: 'Денис',
    phrase: 'Доверьтесь мне!',
    height: 1.0,
    bodyBuild: 'medium',
    gender: 'male',
    hairColor: 0x2d1b0e,
    hairStyle: 'short',
    skinColor: 0xf5c6a0,
    shirtColor: 0x4169e1,
    faceType: 'round',
    hasBeard: true,
    beardColor: 0x1a1a1a,
    seatAngle: 324
  }
];
```

---

## 5. Детальные требования

### 5.1 Сцена и окружение

**Фон:** Градиент от `#1a1a2e` к `#16213e`. Реализация — `scene.background = new THREE.Color(0x1a1a2e)` + лёгкий `FogExp2(0x1a1a2e, 0.015)`.

**Освещение (конкретные параметры):**
```javascript
// Заполняющий
new THREE.AmbientLight(0x404060, 0.5);
// Основной — тёплый, с тенями
const dirLight = new THREE.DirectionalLight(0xfff5e0, 0.8);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 25;
dirLight.shadow.camera.left = -6;
dirLight.shadow.camera.right = 6;
dirLight.shadow.camera.top = 6;
dirLight.shadow.camera.bottom = -6;
// Лампа над столом
const pointLight = new THREE.PointLight(0xffaa44, 1.0, 12);
pointLight.position.set(0, 3, 0);
pointLight.castShadow = false; // экономия — тени только от dirLight
```

**Тени:** `renderer.shadowMap.enabled = true`, тип `PCFSoftShadowMap`. Пол — `receiveShadow = true`. Персонажи и стулья — `castShadow = true`. Стол — и `cast`, и `receive`.

**Пол:** `PlaneGeometry(20, 20)`, повёрнут `rotation.x = -Math.PI / 2`, цвет `0x2d3436`, `receiveShadow = true`.

### 5.2 Круглый стол

- Столешница: `CylinderGeometry(3.0, 3.0, 0.08, 24)`, Y = 0.65, цвет `0x8B5E3C`
- Ножка: `CylinderGeometry(0.15, 0.2, 0.65, 8)`, Y = 0.325
- Основание ножки: `CylinderGeometry(0.8, 0.8, 0.05, 12)`, Y = 0.025
- Все части: `castShadow = true`, `receiveShadow = true`

**Декор на столе (обязательный минимум):**
- 10 листочков бумаги: `BoxGeometry(0.15, 0.005, 0.1)`, белый, расставлены перед каждым местом, Y = 0.69
- 10 карандашей: `CylinderGeometry(0.008, 0.008, 0.12, 4)`, жёлтый `0xffd700`, Y = 0.69, слегка повёрнуты рандомно
- 5 стаканов: `CylinderGeometry(0.04, 0.035, 0.1, 6)`, полупрозрачный `opacity: 0.3`, расставлены случайно ближе к центру

### 5.3 Стулья

- Радиус расстановки: **3.7** юнита от центра (чуть дальше края стола)
- Сиденье: `BoxGeometry(0.4, 0.05, 0.4)`, Y = 0.35
- Спинка: `BoxGeometry(0.4, 0.35, 0.05)`, Y = 0.55, Z-смещение назад от центра
- 4 ножки: `CylinderGeometry(0.025, 0.025, 0.35, 4)`, Y = 0.175
- Цвет: `0x654321`
- Каждый стул повёрнут лицом к центру стола: `chair.lookAt(0, chair.position.y, 0)` не работает для группы — используй `Math.atan2` от позиции

### 5.4 Фигурки людей

**Полностью процедурные.** Строение описано в `ARCHITECTURE.md` → раздел «Скелет фигурки» (там же точные углы суставов для сидячей/стоячей позы).

**Ключевые параметры индивидуализации:**
- `height` → `character.scale.setScalar(config.height)`
- `bodyBuild`:
  - `slim` — торс `×0.8` по X/Z, конечности `×0.8` по радиусу
  - `medium` — без изменений
  - `stocky` — торс `×1.3` по X/Z, конечности `×1.2` по радиусу, добавить сферу-живот (`SphereGeometry(0.12, 6, 4)`, Y на уровне низа торса)
- `hairStyle`:
  - `short` — `SphereGeometry(0.18, 5, 3)`, обрезать нижнюю полусферу (масштаб Y = 0.6), поставить на макушку
  - `medium` — аналогично, но `scaleY = 0.8` + два `BoxGeometry(0.08, 0.15, 0.04)` по бокам головы
  - `long` — полная шапка + `BoxGeometry(0.16, 0.25, 0.06)` свисающие ниже плеч
- `faceType`:
  - `sharp` — голову слегка вытянуть `head.scale.set(0.9, 1.1, 0.95)`
  - `round` — без изменений
  - `asian` — голову слегка сплющить `head.scale.set(1.05, 0.95, 0.9)`, глаза уже (более узкие mesh-и)
- Глаза: 2 × `SphereGeometry(0.03, 4, 3)`, цвет `0x222222`, на передней стороне головы
- Нос: `ConeGeometry(0.02, 0.04, 4)`, выступает вперёд
- `hasBeard` → `DodecahedronGeometry(0.1, 0)`, цвет `beardColor`, на нижней части лица

**Материалы:** `MeshLambertMaterial({ flatShading: true, color: ... })`

### 5.5 Таблички с именами

- `CSS2DObject` с HTML `<div>`
- Позиция: 0.25 юнита над головой (относительно головы в иерархии)
- Стиль: `background: rgba(0,0,0,0.7); color: #fff; padding: 4px 12px; border-radius: 12px; font: 600 13px system-ui, -apple-system, sans-serif; white-space: nowrap; pointer-events: none; user-select: none;`
- Billboard-эффект автоматический для CSS2DObject

### 5.6 Облачко с фразой (Speech Bubble)

- `CSS2DObject` с HTML `<div>`
- Позиция: 0.55 юнита над головой
- Стиль: `background: #fff; color: #333; padding: 8px 16px; border-radius: 16px; font: 700 14px system-ui; max-width: 220px; word-wrap: break-word; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none;`
- Хвостик: CSS-треугольник (`border-left: 8px transparent; border-right: 8px transparent; border-top: 8px solid #fff; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%)`)
- Анимация появления: `opacity: 0→1` + `transform: scale(0.5)→scale(1)` через CSS `transition: 0.3s ease`
- Автоскрытие: `setTimeout(hideBubble, 4000)` — обратная анимация за 0.2с
- При клике на другого персонажа: немедленное скрытие предыдущего, сброс таймера

### 5.7 Интерактивность

**Клик (mouse + touch):**
1. Событие: `pointerdown` на `renderer.domElement` (унифицирует mouse и touch)
2. **Debounce: 800мс** между кликами (игнорировать быстрые повторные)
3. Raycaster → intersect кликабельных mesh-ей → traverse вверх до `userData.characterId`
4. Если найден персонаж:
   - Если уже есть активный → запустить возврат в сидячую позу (GSAP timeline)
   - Запустить анимацию нового персонажа (вставание → рука → облачко → конфетти)
   - Камера плавно подкручивается к персонажу (не телепортация!)

**Hover:**
- Событие: `pointermove`
- Raycaster → если пересечение с персонажем → `document.body.style.cursor = 'pointer'` + увеличение `emissive` на материалах фигурки (`emissive.setHex(0x222222)`)
- Если нет пересечения → cursor `default`, сброс emissive

**Множественные клики:** Если кликнуть на уже стоящего персонажа — он садится обратно (toggle). Если кликнуть на другого — первый садится, второй встаёт.

### 5.8 Анимация камеры при загрузке

1. `0.0с – 0.5с`: CSS fade-in от чёрного (`body { opacity: 0→1 }`)
2. `0.5с – 6.0с`: Камера облетает стол на 360° (radius=8, height=5, центр `0, 0.5, 0`)
3. `6.0с – 7.0с`: Камера переходит в позицию обзора (x=5, y=4, z=6)
4. `7.0с`: `controls.enabled = true` — пользователь получает управление
5. `7.0с – 7.5с`: Появляется подсказка «Нажмите на персонажа» (CSS fade-in, позиция внизу экрана)

**Стартовая позиция камеры (seatAngle=0° = Юля):** Камера после облёта смотрит примерно на Юлю — это первый персонаж, которого видит пользователь. Финальная позиция `(5, 4, 6)` обеспечивает это.

### 5.9 Конфетти

- `THREE.Points` + `BufferGeometry` + `PointsMaterial({ vertexColors: true, depthWrite: false })`
- 80 частиц, палитра: `[0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff6b9d, 0xc792ea]`
- Начальная позиция: над головой активного персонажа
- Физика: случайная начальная скорость (вверх + в стороны) + гравитация
- Время жизни: 2.5с, затем `geometry.dispose()` + `material.dispose()` + удаление из сцены
- **Максимум 1 активная система частиц** — при новом клике предыдущая удаляется мгновенно

### 5.10 Свечение при клике

- Кратковременная вспышка: `PointLight` (intensity `0→2→0`, duration 0.3с, цвет `0xffffff`) в позиции персонажа
- Или увеличение emissive на материалах фигурки на 0.3с, затем возврат

---

## 6. Адаптивность и мобильные устройства

- Canvas: `100vw × 100vh`, resize listener обновляет оба рендерера
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- **Touch:** `pointerdown` обрабатывает и mouse, и touch единообразно
- **Pinch-to-zoom:** OrbitControls из Three.js поддерживает это из коробки (`enableZoom = true` — по умолчанию). Дополнительно: `<meta name="viewport" ... user-scalable=no>` + `body { touch-action: none }` — чтобы браузер не зумил страницу, а жест шёл в OrbitControls
- **Двойной тап:** OrbitControls не обрабатывает — ничего не сломается
- Оптимизация: общий полигонаж < 10,000, один shadowMap 1024×1024

---

## 7. Деплой

### GitHub Pages (рекомендуемый)
1. `vite.config.js` → `base: '/<repo-name>/'`
2. `.github/workflows/deploy.yml` — см. `CLAUDE.md`
3. GitHub → Settings → Pages → Source: GitHub Actions
4. URL: `https://<username>.github.io/<repo-name>/`

### Vercel (альтернативный)
1. `base: '/'` в vite.config.js
2. `npx vercel` — следовать инструкциям
3. URL: `https://<project>.vercel.app`

### Netlify (альтернативный)
1. `npm run build`
2. `npx netlify deploy --dir=dist --prod`
3. URL: `https://<project>.netlify.app`

---

## 8. Приёмочные критерии

- [ ] Загрузка < 3с в Chrome/Firefox/Safari
- [ ] 10 персонажей **сидят** за круглым столом (ноги согнуты, не стоят)
- [ ] Каждый визуально отличим (рост, телосложение, цвет волос, одежда, борода)
- [ ] Таблички с именами читаемы, парят над головами
- [ ] Клик → анимация вставания → рука вверх → облачко с фразой → конфетти
- [ ] Повторный клик → возврат в сидячую позу
- [ ] Клик по другому персонажу → первый садится, второй встаёт
- [ ] Быстрые множественные клики не ломают анимацию (debounce 800мс)
- [ ] Автооблёт камеры при загрузке, затем OrbitControls
- [ ] Работает на мобильных (touch, pinch-to-zoom через OrbitControls)
- [ ] `npm run build` без ошибок
- [ ] Задеплоено по публичной ссылке
