import * as THREE from 'three';
import { createNameLabel } from '../ui/NameLabel.js';
import { createSpeechBubble } from '../ui/SpeechBubble.js';

/** @param {import('./CharacterConfig.js').CHARACTERS[number]} config */
export function createCharacterBody(config) {
  const character = new THREE.Group();
  const heightScale = config.height;
  const widthScale = config.bodyBuild === 'stocky' ? 1.15 : config.bodyBuild === 'slim' ? 0.9 : 1;

  const skinMat = new THREE.MeshStandardMaterial({ color: config.skinColor, flatShading: true });
  const shirtMat = new THREE.MeshStandardMaterial({ color: config.shirtColor, flatShading: true });
  const hairMat = new THREE.MeshStandardMaterial({ color: config.hairColor, flatShading: true });

  const lowerBody = new THREE.Group();
  lowerBody.position.y = 0.4 * heightScale;
  character.add(lowerBody);

  const upperBody = new THREE.Group();
  upperBody.position.y = 0.4 * heightScale;
  character.add(upperBody);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28 * widthScale, 0.24 * heightScale, 0.18), shirtMat);
  torso.position.y = 0.12 * heightScale;
  torso.castShadow = true;
  upperBody.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), skinMat);
  neck.position.y = 0.27 * heightScale;
  upperBody.add(neck);

  const head = new THREE.Group();
  head.position.y = 0.45 * heightScale;
  upperBody.add(head);

  const skull = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 * heightScale, 0), skinMat);
  skull.castShadow = true;
  head.add(skull);

  const hairHeight = config.hairStyle === 'long' ? 0.17 : config.hairStyle === 'medium' ? 0.12 : 0.08;
  const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, hairHeight, 6), hairMat);
  hair.position.y = 0.09;
  head.add(hair);

  const eyeGeo = new THREE.SphereGeometry(0.02, 4, 3);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: true });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.05, 0.0, 0.15);
  eyeR.position.set(0.05, 0.0, 0.15);
  head.add(eyeL, eyeR);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.04, 4), skinMat);
  nose.position.set(0, -0.02, 0.17);
  nose.rotation.x = Math.PI / 2;
  head.add(nose);

  if (config.hasBeard) {
    const beard = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), new THREE.MeshStandardMaterial({ color: config.beardColor, flatShading: true }));
    beard.position.set(0, -0.12, 0.1);
    head.add(beard);
  }

  const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, flatShading: true });
  const thighLen = 0.22 * heightScale;
  const shinLen = 0.22 * heightScale;

  function createLeg(x) {
    const upper = new THREE.Group();
    upper.position.set(x * widthScale, 0, 0.02);
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, thighLen, 5), legMat);
    thigh.position.y = -thighLen / 2;
    upper.add(thigh);
    const lower = new THREE.Group();
    lower.position.y = -thighLen;
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, shinLen, 5), legMat);
    shin.position.y = -shinLen / 2;
    lower.add(shin);
    upper.add(lower);
    return { upper, lower };
  }

  const leftLeg = createLeg(-0.1);
  const rightLeg = createLeg(0.1);
  lowerBody.add(leftLeg.upper, rightLeg.upper);

  const armLen = 0.2 * heightScale;
  function createArm(x) {
    const pivot = new THREE.Group();
    pivot.position.set(x * widthScale, 0.24 * heightScale, 0);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, armLen, 5), shirtMat);
    upper.position.y = -armLen / 2;
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, armLen * 0.95, 5), skinMat);
    lower.position.y = -armLen - armLen * 0.45;
    pivot.add(upper, lower);
    return pivot;
  }

  const leftArmPivot = createArm(0.16);
  const rightArmPivot = createArm(-0.16);
  upperBody.add(leftArmPivot, rightArmPivot);

  leftLeg.upper.rotation.x = -Math.PI / 2;
  rightLeg.upper.rotation.x = -Math.PI / 2;
  leftLeg.lower.rotation.x = Math.PI / 2;
  rightLeg.lower.rotation.x = Math.PI / 2;
  leftArmPivot.rotation.x = -Math.PI / 4;
  rightArmPivot.rotation.x = -Math.PI / 4;

  const nameLabel = createNameLabel(config.name);
  nameLabel.position.y = 0.65 * heightScale;
  const speechBubble = createSpeechBubble(config.phrase);
  speechBubble.position.y = 0.95 * heightScale;
  head.add(nameLabel, speechBubble);

  character.userData.bones = {
    upperBody,
    lowerBody,
    leftLegUpper: leftLeg.upper,
    leftLegLower: leftLeg.lower,
    rightLegUpper: rightLeg.upper,
    rightLegLower: rightLeg.lower,
    leftArmPivot,
    rightArmPivot,
    head
  };
  character.userData.speechBubble = speechBubble;
  character.userData.seatY = 0;
  character.userData.characterId = config.id;

  return character;
}
