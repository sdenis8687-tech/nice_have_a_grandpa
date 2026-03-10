import { createCharacterBody } from './CharacterBody.js';
import { degToRad } from '../utils/helpers.js';

export function createCharacter(config) {
  const character = createCharacterBody(config);
  const chairRadius = 3.7;
  const angleRad = degToRad(config.seatAngle);
  const x = Math.sin(angleRad) * chairRadius;
  const z = Math.cos(angleRad) * chairRadius;
  character.position.set(x, 0, z);
  const faceAngle = Math.atan2(-x, -z);
  character.rotation.y = faceAngle;
  return character;
}
