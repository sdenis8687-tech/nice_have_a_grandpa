# Быстрый старт

## Что в комплекте

| Файл | Для кого | Назначение |
|---|---|---|
| `CLAUDE.md` | Claude Code | Главные инструкции — положить в корень проекта |
| `TECHNICAL_SPEC.md` | Claude Code + ты | Полное ТЗ: стек, данные персонажей, требования |
| `ARCHITECTURE.md` | Claude Code + ты | Скелет фигурки, углы суставов, палитра, таймлайны |
| `QUICKSTART.md` | Ты | Этот файл |

## Требования

- **Node.js 18+** и npm (проверь: `node -v`, `npm -v`)
- Git (для деплоя на GitHub Pages)
- Современный браузер (Chrome, Firefox, Safari)

## Пошаговый план

### 1. Создай рабочую папку и положи туда файлы

```bash
mkdir quiz-project && cd quiz-project
# Скопируй сюда: CLAUDE.md, TECHNICAL_SPEC.md, ARCHITECTURE.md
```

### 2. Открой Claude Code

```bash
claude
```

Или используй веб-версию Claude Code.

### 3. Дай команду

```
Прочитай CLAUDE.md, TECHNICAL_SPEC.md и ARCHITECTURE.md.
Создай проект по техзаданию, двигаясь по фазам из CLAUDE.md.
Начни с Фазы 1 (скаффолдинг) и двигайся последовательно.
После каждой фазы подтверждай готовность.
```

### 4. Проверяй после каждой фазы

```bash
npm run dev
# Открой http://localhost:5173 в браузере
```

Если что-то не так — опиши проблему Claude Code. Если ок — «Переходи к следующей фазе».

### 5. Задеплой

**Vercel (самый быстрый — 30 секунд):**
```bash
# Поменяй base в vite.config.js на '/'
npx vercel
```

**GitHub Pages:**
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
# GitHub → Settings → Pages → Source: GitHub Actions
# Подожди 1-2 минуты, зайди на https://<user>.github.io/<repo>/
```

**Netlify:**
```bash
npm run build
npx netlify deploy --dir=dist --prod
```

## Решение проблем

| Проблема | Решение |
|---|---|
| Пустой экран | F12 → Console → ищи ошибку импорта |
| Фигурки не видно | Проверь камеру: `camera.position.set(0, 5, 8)` |
| Клики не работают | CSS2DRenderer контейнер должен быть `pointer-events: none` |
| Белый экран после деплоя | Настрой `base` в `vite.config.js` |
| Нет теней | Включи: renderer → light → mesh (`castShadow`/`receiveShadow`) |
| Персонажи стоят вместо сидят | Проверь `leftLegUpper.rotation.x = -Math.PI/2` |

## Кастомизация

- **Другая фраза:** Поменяй `phrase` в `CharacterConfig.js`
- **Добавить человека:** Добавь объект в массив `CHARACTERS`, увеличь радиус стола
- **Другие цвета:** Поменяй `shirtColor` (hex)
- **Bloom-эффект:** Добавь `UnrealBloomPass` из `three/addons/postprocessing`
