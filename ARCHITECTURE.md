# Архитектурные решения и стилевое руководство

## Почему такой стек

**Three.js** (не R3F / Babylon / PlayCanvas) — минимальный бандл (~150KB), чистый JavaScript без React, максимальная гибкость для процедурной геометрии. Для разового демо — идеальный выбор.

**GSAP** (не Tween.js / anime.js) — Timeline позволяет выстраивать цепочки: «встал → рука → облачко → конфетти». Бесплатен для некоммерческого использования.

**CSS2DRenderer** (не спрайты / HTML overlay вручную) — привязывает HTML к 3D-координатам автоматически, billboard-эффект из коробки, CSS-стилизация.

---

## Палитра цветов

```
Фон сцены:       0x1a1a2e
Пол:              0x2d3436
Стол:             0x8B5E3C
Стулья:           0x654321
Ambient light:    0x404060, intensity 0.5
Direct light:     0xfff5e0, intensity 0.8
Point light:      0xffaa44, intensity 1.0
Туман:            0x1a1a2e, density 0.015
```

### Одежда персонажей:
```
Юля:    0x6a5acd   Арсен:  0x2e8b57   Таня:   0xff6347
Катя:   0x4682b4   Алена:  0xda70d6   Аня:    0xff69b4
Саша:   0x556b2f   Оля:    0x708090   Рус:    0x8b4513
Денис:  0x4169e1
```

### Конфетти:
```
0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff6b9d, 0xc792ea
```

---

## Скелет фигурки (КРИТИЧЕСКИ ВАЖНО)

### Иерархия THREE.Group

Каждая часть тела — отдельный Group или Mesh. Pivot point каждого сустава определяется позицией Group, а Mesh внутри смещён так, чтобы вращение происходило от сустава.

```
character (Group) — Y = на уровне пола стула
│
├── lowerBody (Group) — pivot: точка таза, position.y = 0.4
│   ├── leftLegUpper (Group) — pivot: тазобедренный сустав
│   │   ├── thighMesh (Mesh) — CylinderGeometry, смещён на -halfLength по локальной Y
│   │   └── leftLegLower (Group) — pivot: колено, position.y = -thighLength
│   │       └── shinMesh (Mesh) — CylinderGeometry, смещён на -halfLength по локальной Y
│   └── rightLegUpper (Group) — аналогично
│       ├── thighMesh (Mesh)
│       └── rightLegLower (Group)
│           └── shinMesh (Mesh)
│
└── upperBody (Group) — pivot: поясница, position.y = 0.4
    ├── torsoMesh (Mesh) — BoxGeometry, центр на уровне груди
    ├── neckMesh (Mesh) — CylinderGeometry
    ├── head (Group) — position.y = от верха торса + шея
    │   ├── skullMesh (Mesh) — DodecahedronGeometry(0.18, 1)
    │   ├── hairMesh (Mesh) — по hairStyle
    │   ├── leftEye (Mesh) — SphereGeometry(0.025, 4, 3)
    │   ├── rightEye (Mesh) — SphereGeometry(0.025, 4, 3)
    │   ├── nose (Mesh) — ConeGeometry(0.018, 0.04, 4)
    │   ├── beard (Mesh | null) — DodecahedronGeometry(0.1, 0) если hasBeard
    │   ├── nameLabel (CSS2DObject) — position.y = +0.25
    │   └── speechBubble (CSS2DObject) — position.y = +0.55
    │
    ├── leftArmPivot (Group) — pivot: левое плечо, position = (torsoWidth/2, topOfTorso, 0)
    │   ├── upperArmMesh (Mesh) — CylinderGeometry, смещён вниз от плеча
    │   └── lowerArmMesh (Mesh) — CylinderGeometry, смещён ниже
    │
    └── rightArmPivot (Group) — pivot: правое плечо, position = (-torsoWidth/2, topOfTorso, 0)
        ├── upperArmMesh (Mesh)
        └── lowerArmMesh (Mesh)
```

### Принцип pivot point

Mesh внутри Group смещён так, чтобы вращение Group-а вращало конечность вокруг сустава:

```javascript
// Пример: бедро (thigh)
const thighLength = 0.22;
const thighGeo = new THREE.CylinderGeometry(0.05, 0.045, thighLength, 5);
const thighMesh = new THREE.Mesh(thighGeo, material);
thighMesh.position.y = -thighLength / 2; // сместить вниз от pivot

const leftLegUpper = new THREE.Group();
leftLegUpper.add(thighMesh);
leftLegUpper.position.set(-0.1, 0, 0); // относительно таза

// Колено
const shinLength = 0.22;
const shinGeo = new THREE.CylinderGeometry(0.045, 0.035, shinLength, 5);
const shinMesh = new THREE.Mesh(shinGeo, material);
shinMesh.position.y = -shinLength / 2;

const leftLegLower = new THREE.Group();
leftLegLower.add(shinMesh);
leftLegLower.position.y = -thighLength; // в конце бедра = колено

leftLegUpper.add(leftLegLower);
```

### Углы суставов

**СИДЯЧАЯ ПОЗА (начальное состояние):**
```javascript
// Бёдра: горизонтально вперёд (от тела)
leftLegUpper.rotation.x = -Math.PI / 2;    // -90° — бедро вперёд
rightLegUpper.rotation.x = -Math.PI / 2;

// Голени: вертикально вниз от колена
leftLegLower.rotation.x = Math.PI / 2;     // +90° — компенсирует, голень вниз
rightLegLower.rotation.x = Math.PI / 2;

// Руки: слегка вниз-вперёд (лежат на коленях / на столе)
leftArmPivot.rotation.x = -Math.PI / 4;    // -45° — чуть вперёд
leftArmPivot.rotation.z = 0;
rightArmPivot.rotation.x = -Math.PI / 4;
rightArmPivot.rotation.z = 0;

// Торс: прямо
upperBody.rotation.x = 0;
```

**СТОЯЧАЯ ПОЗА (после анимации клика):**
```javascript
// character.position.y += 0.35 (высота стула)

// Ноги: прямые
leftLegUpper.rotation.x = 0;
leftLegLower.rotation.x = 0;
rightLegUpper.rotation.x = 0;
rightLegLower.rotation.x = 0;

// Правая рука: вверх
rightArmPivot.rotation.z = -Math.PI * 0.75;  // ~135° вверх
rightArmPivot.rotation.x = 0;

// Левая рука: вдоль тела
leftArmPivot.rotation.x = 0;
leftArmPivot.rotation.z = 0.1; // слегка отведена

// Лёгкий наклон торса
upperBody.rotation.x = -0.05;
```

---

## Y-координаты (абсолютные, вид сбоку)

```
Y = 0.00   Пол
Y = 0.175  Центр ножек стула
Y = 0.35   Сиденье стула (верхняя грань)
Y = 0.40   Pivot таза персонажа (lowerBody.position.y и upperBody.position.y)
Y = 0.52   Центр торса
Y = 0.65   Столешница (верхняя грань)
Y = 0.69   Декор на столе (листочки, карандаши)
Y = 0.73   Шея
Y = 0.85   Центр головы
Y = 1.10   Табличка с именем (CSS2D)
Y = 1.40   Облачко с фразой (CSS2D)
```

**Важно:** Персонаж (character Group) размещается так, чтобы его `position.y = 0`. Внутренние координаты (таз Y=0.4, голова Y=0.85) — относительно group-а. При вставании `character.position.y += 0.35`.

---

## Расположение за столом

Радиус расстановки стульев: **3.7** юнита. Радиус стола: **3.0** юнита.

```
                    Юля (0°)
          Денис (324°)      Арсен (36°)

      Рус (288°)     [ СТОЛ ]     Таня (72°)

          Оля (252°)        Катя (108°)

          Саша (216°)       Алена (144°)
                    Аня (180°)
```

**Формула позиции:**
```javascript
const chairRadius = 3.7;
const angleRad = (config.seatAngle * Math.PI) / 180;
const x = Math.sin(angleRad) * chairRadius;
const z = Math.cos(angleRad) * chairRadius;

chair.position.set(x, 0, z);
character.position.set(x, 0, z);

// Поворот лицом к центру стола
const faceAngle = Math.atan2(-x, -z);
chair.rotation.y = faceAngle;
character.rotation.y = faceAngle;
```

**Согласование с камерой:** Юля (seatAngle=0°) находится на оси +Z. Камера после облёта останавливается на позиции `(5, 4, 6)` — Юля видна спереди-справа. Это делает сцену «живой» сразу после загрузки.

---

## Порядок рендеринга

В каждом кадре render loop:

```
1. controls.update()            — OrbitControls с damping
2. updateAllConfetti(delta)     — физика частиц
3. renderer.render(scene, cam)  — WebGL: opaque → transparent (авто-сортировка Three.js)
4. cssRenderer.render(scene, cam) — CSS2D: таблички и облачка ПОВЕРХ WebGL
```

Three.js автоматически рендерит opaque-объекты до transparent (стаканы, частицы). Для корректного отображения:
- Стаканы: `material.transparent = true`, `material.opacity = 0.3`, `material.depthWrite = false`
- Частицы (PointsMaterial): `transparent = true`, `depthWrite = false`

### Z-fighting табличек с именами

CSS2DObject рендерится в HTML, а не в WebGL — z-fighting с 3D-объектами невозможен. Но при очень близких ракурсах таблички могут перекрывать друг друга. Решение: `CSS2DObject` имеет `element.style.zIndex`, но Three.js управляет им автоматически по глубине — **дополнительных действий не требуется**. Если два имени перекрываются — это нормально, ведь и в реальности люди сидят друг за другом.

---

## Анимационные таймлайны

### Timeline A: Загрузка

```
0.0с – 0.5с:  body opacity 0→1 (CSS transition)
0.5с – 6.0с:  Камера: angle 0→2π, radius=8, height=5, lookAt(0, 0.5, 0)
6.0с – 7.0с:  Камера → позиция (5, 4, 6), плавный ease
7.0с:          controls.enabled = true
7.0с – 7.5с:  HUD подсказка fadeIn
```

### Timeline B: Клик по персонажу

```
0.0с:          Если есть активный → запуск Timeline C (возврат)
0.0с – 0.5с:  Камера мягко доворачивается к персонажу (controls.target → персонаж)
0.0с – 0.8с:  character.position.y += 0.35
0.1с – 0.8с:  Ноги разгибаются (rotation.x → 0)
0.2с – 0.5с:  Торс наклон -0.05
0.4с – 0.9с:  Правая рука вверх (rotation.z → -0.75π), ease: back.out(1.7)
0.6с – 0.9с:  Облачко появляется (opacity 0→1, scale 0.5→1)
0.7с:          Конфетти запуск
4.0с – 4.3с:  Облачко исчезает (если не было нового клика)
```

### Timeline C: Возврат в сидячую позу

```
0.0с – 0.6с:  character.position.y → seatY
0.0с – 0.5с:  Ноги сгибаются (rotation.x → исходные)
0.0с – 0.4с:  Рука опускается (rotation.z → 0, rotation.x → -π/4)
0.0с – 0.3с:  Торс rotation.x → 0
0.0с – 0.2с:  Облачко скрывается
```

---

## GSAP: сохранение ссылок на bones

При создании персонажа обязательно записать все анимируемые группы в `userData`:

```javascript
character.userData.characterId = config.id;
character.userData.seatY = character.position.y;
character.userData.isStanding = false;
character.userData.activeTween = null; // текущая анимация, чтобы можно было kill()

character.userData.bones = {
  upperBody,       // Group — торс и всё выше
  lowerBody,       // Group — таз и ноги
  leftLegUpper,    // Group — бедро левое
  leftLegLower,    // Group — голень левая
  rightLegUpper,   // Group — бедро правое
  rightLegLower,   // Group — голень правая
  leftArmPivot,    // Group — вся левая рука от плеча
  rightArmPivot,   // Group — вся правая рука от плеча
  head             // Group — голова (для позиционирования облачка)
};
```

При запуске новой анимации: сначала `character.userData.activeTween?.kill()`, затем создать новый timeline и записать его в `activeTween`. Это предотвращает конфликты анимаций.

---

## Известные ограничения и решения

1. **CapsuleGeometry** не существует в Three.js < r142. Используй `CylinderGeometry + 2× SphereGeometry`.

2. **CSS2DRenderer перекрывает клики.** Контейнер CSS2D: `pointer-events: none`. Если нужны кликабельные HTML-элементы (кнопки HUD) — добавлять их вне CSS2DRenderer.

3. **GSAP на мобильных.** OrbitControls + GSAP одновременно: отключать `controls.enabled = false` на время анимации камеры (Timeline A и начало Timeline B), включать обратно после.

4. **Шрифты.** Используй `system-ui, -apple-system, sans-serif`. Не грузи веб-шрифты — экономия на загрузке.

5. **GitHub Pages subdirectory.** `base: '/<repo>/'` в `vite.config.js`. Без этого все ассеты 404.

6. **Множественные быстрые клики.** Debounce 800мс на `pointerdown`. Дополнительно: `activeTween.kill()` перед запуском новой анимации на том же персонаже.

7. **Производительность на слабых устройствах.** Общий полигонаж < 10,000. Один shadow map 1024×1024. Одна активная система частиц. `pixelRatio` ограничен 2.
