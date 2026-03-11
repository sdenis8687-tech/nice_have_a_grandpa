export function createHUD() {
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = '<h1>Квиз за круглым столом</h1><p>Кликни на персонажа, чтобы он ответил</p>';
  hud.style.opacity = '0';
  hud.style.transition = 'opacity .6s ease';
  return hud;
}
