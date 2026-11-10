/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterConfig } from './types';

// ==========================================
// PROCEDURAL CANVAS TEXTURE GENERATORS
// ==========================================

export function createSnowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Soft cold blue-white base
  ctx.fillStyle = '#ebf4ff';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle crystal noise
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const brightness = Math.random() * 40;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + Math.random() * 0.25})`;
    ctx.fillRect(x, y, 1.5, 1.5);
    if (i % 8 === 0) {
      ctx.fillStyle = `rgba(180, 215, 255, ${0.1 + Math.random() * 0.15})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createIceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Deep cyan crystalline gradient
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#70c5f5');
  grad.addColorStop(0.5, '#4da8e8');
  grad.addColorStop(1, '#8de0ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Ice cracks and crystallization
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    let x = Math.random() * 256;
    let y = Math.random() * 256;
    ctx.moveTo(x, y);
    for (let step = 0; step < 4; step++) {
      x += (Math.random() - 0.5) * 60;
      y += (Math.random() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWoodPlankTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6d4529';
  ctx.fillRect(0, 0, 256, 256);

  // Horizontal plank seams
  ctx.fillStyle = '#452a17';
  for (let y = 0; y < 256; y += 32) {
    ctx.fillRect(0, y, 256, 3);
  }

  // Wood grain strokes
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = 'rgba(40, 20, 10, 0.12)';
    const y = Math.random() * 256;
    ctx.fillRect(Math.random() * 256, y, Math.random() * 60 + 20, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createCobblestoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, 256, 256);

  // Cobblestone stones
  for (let y = 8; y < 256; y += 32) {
    for (let x = (y % 64 === 0 ? 8 : 24); x < 256; x += 32) {
      const shade = 140 + Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgb(${shade}, ${shade + 10}, ${shade + 20})`;
      ctx.beginPath();
      ctx.roundRect(x - 12, y - 10, 24, 20, 6);
      ctx.fill();

      // Frosted top edge
      ctx.fillStyle = 'rgba(235, 245, 255, 0.35)';
      ctx.fillRect(x - 10, y - 10, 20, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Cached shared materials
const snowTex = createSnowTexture();
const iceTex = createIceTexture();
const woodTex = createWoodPlankTexture();
const stoneTex = createCobblestoneTexture();

export const MAT_SNOW = new THREE.MeshStandardMaterial({
  map: snowTex,
  color: 0xf0f7ff,
  roughness: 0.85,
  metalness: 0.05,
});

export const MAT_ICE = new THREE.MeshPhysicalMaterial({
  map: iceTex,
  color: 0x75d5ff,
  roughness: 0.08,
  metalness: 0.15,
  transmission: 0.45,
  transparent: true,
  opacity: 0.92,
  ior: 1.31,
});

export const MAT_WOOD = new THREE.MeshStandardMaterial({
  map: woodTex,
  roughness: 0.75,
  metalness: 0.1,
});

export const MAT_STONE = new THREE.MeshStandardMaterial({
  map: stoneTex,
  roughness: 0.9,
  metalness: 0.1,
});

export const MAT_GOLD_GLOW = new THREE.MeshStandardMaterial({
  color: 0xffd166,
  emissive: 0xffaa00,
  emissiveIntensity: 0.8,
  roughness: 0.3,
});

export const MAT_CYAN_GLOW = new THREE.MeshStandardMaterial({
  color: 0x67e8f9,
  emissive: 0x06b6d4,
  emissiveIntensity: 1.2,
  roughness: 0.2,
});

// ==========================================
// 3-12 PART PROCEDURAL MODELS
// ==========================================

export interface CharacterRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  scarfTail: THREE.Mesh;
  petGroup?: THREE.Group;
}

export function createCharacterModel(config: CharacterConfig): CharacterRig {
  const root = new THREE.Group();

  const parkaMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.parkaColor || '#2563eb'),
    roughness: 0.6,
    metalness: 0.1,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfcd34d,
    roughness: 0.7,
  });

  const beanieMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.beanieColor || '#ef4444'),
    roughness: 0.85,
  });

  const scarfMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.scarfColor || '#fbbf24'),
    roughness: 0.85,
  });

  const bootsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.bootsColor || '#334155'),
    roughness: 0.5,
  });

  const fluffySnowMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
  });

  // 1. Torso (Puffer Parka)
  const torsoGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.65, 12);
  const torso = new THREE.Mesh(torsoGeo, parkaMat);
  torso.position.y = 0.62;
  torso.castShadow = true;
  root.add(torso);

  // Fluffy parka bottom trim
  const bottomTrimGeo = new THREE.TorusGeometry(0.36, 0.05, 8, 16);
  const bottomTrim = new THREE.Mesh(bottomTrimGeo, fluffySnowMat);
  bottomTrim.rotation.x = Math.PI / 2;
  bottomTrim.position.y = 0.32;
  root.add(bottomTrim);

  // 2. Head
  const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.15;
  head.castShadow = true;
  root.add(head);

  // Cute eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
  leftEye.position.set(-0.09, 1.18, 0.25);
  const rightEye = leftEye.clone();
  rightEye.position.set(0.09, 1.18, 0.25);
  root.add(leftEye, rightEye);

  // Rosy cheeks
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.7 });
  const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), blushMat);
  leftCheek.position.set(-0.16, 1.12, 0.22);
  const rightCheek = leftCheek.clone();
  rightCheek.position.set(0.16, 1.12, 0.22);
  root.add(leftCheek, rightCheek);

  // 3. Beanie Hat
  const beanieGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const beanie = new THREE.Mesh(beanieGeo, beanieMat);
  beanie.position.y = 1.25;
  beanie.rotation.x = -0.1;
  root.add(beanie);

  // 4. Pom-Pom
  const pomGeo = new THREE.SphereGeometry(0.09, 12, 12);
  const pom = new THREE.Mesh(pomGeo, fluffySnowMat);
  pom.position.set(0, 1.55, -0.05);
  root.add(pom);

  // 5. Scarf collar
  const scarfGeo = new THREE.TorusGeometry(0.26, 0.08, 8, 16);
  const scarf = new THREE.Mesh(scarfGeo, scarfMat);
  scarf.position.y = 0.96;
  scarf.rotation.x = Math.PI / 2;
  root.add(scarf);

  // 6. Fluttering Scarf Tail
  const tailGeo = new THREE.BoxGeometry(0.12, 0.45, 0.04);
  tailGeo.translate(0, -0.22, 0); // pivot at top
  const scarfTail = new THREE.Mesh(tailGeo, scarfMat);
  scarfTail.position.set(0.14, 0.94, -0.22);
  root.add(scarfTail);

  // 7 & 8. Left & Right Arms
  const armGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.45, 8);
  armGeo.translate(0, -0.2, 0);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.38, 0.85, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, parkaMat);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  // Mitten
  const mittenGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const leftMitten = new THREE.Mesh(mittenGeo, beanieMat);
  leftMitten.position.y = -0.44;
  leftArm.add(leftMitten);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.38, 0.85, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, parkaMat);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  const rightMitten = new THREE.Mesh(mittenGeo, beanieMat);
  rightMitten.position.y = -0.44;
  rightArm.add(rightMitten);
  root.add(rightArm);

  // 9 & 10. Left & Right Legs with Warm Boots
  const legGeo = new THREE.CylinderGeometry(0.1, 0.11, 0.35, 8);
  legGeo.translate(0, -0.15, 0);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.35, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, parkaMat);
  leftLeg.add(leftLegMesh);
  const bootGeo = new THREE.BoxGeometry(0.18, 0.16, 0.28);
  bootGeo.translate(0, -0.06, 0.05);
  const leftBoot = new THREE.Mesh(bootGeo, bootsMat);
  leftBoot.position.y = -0.28;
  leftBoot.castShadow = true;
  leftLeg.add(leftBoot);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.35, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, parkaMat);
  rightLeg.add(rightLegMesh);
  const rightBoot = new THREE.Mesh(bootGeo, bootsMat);
  rightBoot.position.y = -0.28;
  rightBoot.castShadow = true;
  rightLeg.add(rightBoot);
  root.add(rightLeg);

  // 11. Explorer Backpack
  const packGeo = new THREE.BoxGeometry(0.32, 0.42, 0.2);
  const packMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
  const backpack = new THREE.Mesh(packGeo, packMat);
  backpack.position.set(0, 0.65, -0.26);
  backpack.castShadow = true;
  root.add(backpack);

  // 12. Backpack Lantern
  const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 }));
  lanternPost.position.set(0.18, 0.72, -0.32);
  const lanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1), MAT_GOLD_GLOW);
  lanternGlass.position.set(0.18, 0.62, -0.32);
  root.add(lanternPost, lanternGlass);

  // Optional Companion Pet
  let petGroup: THREE.Group | undefined;
  if (config.pet && config.pet !== 'none') {
    petGroup = new THREE.Group();
    if (config.pet === 'penguin') {
      // Cute chubby Penguin
      const pBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.32, 10), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
      pBody.position.y = 0.16;
      pBody.castShadow = true;
      const pBelly = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }));
      pBelly.scale.set(0.8, 1, 0.5);
      pBelly.position.set(0, 0.14, 0.08);
      const pBeak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 6), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
      pBeak.rotation.x = Math.PI / 2;
      pBeak.position.set(0, 0.22, 0.14);
      petGroup.add(pBody, pBelly, pBeak);
    } else if (config.pet === 'fox') {
      // Arctic Fox
      const fBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.35), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
      fBody.position.y = 0.15;
      fBody.castShadow = true;
      const fHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.18), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
      fHead.position.set(0, 0.26, 0.18);
      const fTail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
      fTail.rotation.x = -Math.PI / 4;
      fTail.position.set(0, 0.2, -0.22);
      petGroup.add(fBody, fHead, fTail);
    } else {
      // Snow Owl
      const oBody = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
      oBody.position.y = 0.2;
      oBody.castShadow = true;
      const oBeak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 4), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }));
      oBeak.rotation.x = Math.PI / 2;
      oBeak.position.set(0, 0.22, 0.13);
      petGroup.add(oBody, oBeak);
    }
    petGroup.position.set(0.55, 0, -0.4);
    root.add(petGroup);
  }

  // Bottom contact shadow
  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.45, 16),
    new THREE.MeshBasicMaterial({ color: 0x071126, transparent: true, opacity: 0.35, depthWrite: false })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.02;
  root.add(contactShadow);

  return {
    group: root,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    scarfTail,
    petGroup,
  };
}

// 3-tier Snow-covered Pine Tree
export function createPineTree(scale: number = 1.0, withFairyLights: boolean = false): THREE.Group {
  const tree = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 1.2 * scale, 8);
  const trunk = new THREE.Mesh(trunkGeo, MAT_WOOD);
  trunk.position.y = 0.6 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  const pineMat = new THREE.MeshStandardMaterial({
    color: 0x1e4b37,
    roughness: 0.85,
    metalness: 0.05,
  });

  const tiers = [
    { radius: 1.6 * scale, height: 1.4 * scale, y: 1.2 * scale },
    { radius: 1.2 * scale, height: 1.2 * scale, y: 2.1 * scale },
    { radius: 0.8 * scale, height: 1.0 * scale, y: 2.9 * scale },
  ];

  tiers.forEach((t) => {
    // Pine foliage cone
    const coneGeo = new THREE.ConeGeometry(t.radius, t.height, 8);
    const cone = new THREE.Mesh(coneGeo, pineMat);
    cone.position.y = t.y;
    cone.castShadow = true;
    tree.add(cone);

    // Snow blanket cap over foliage
    const snowCapGeo = new THREE.ConeGeometry(t.radius * 0.95, t.height * 0.45, 8);
    const snowCap = new THREE.Mesh(snowCapGeo, MAT_SNOW);
    snowCap.position.y = t.y + t.height * 0.32;
    tree.add(snowCap);
  });

  // Top snow tip
  const tipGeo = new THREE.SphereGeometry(0.15 * scale, 8, 8);
  const tip = new THREE.Mesh(tipGeo, MAT_SNOW);
  tip.position.y = 3.4 * scale;
  tree.add(tip);

  if (withFairyLights) {
    const colors = [0xef4444, 0x3b82f6, 0xfbbf24, 0x10b981, 0xa855f7];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 6;
      const heightFrac = i / 18;
      const r = (1.5 - heightFrac * 1.1) * scale;
      const lightMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.06 * scale, 6, 6),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
      );
      lightMesh.position.set(
        Math.cos(angle) * r,
        (1.2 + heightFrac * 2.1) * scale,
        Math.sin(angle) * r
      );
      tree.add(lightMesh);
    }
  }

  // Contact shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.6 * scale, 16),
    new THREE.MeshBasicMaterial({ color: 0x050c1e, transparent: true, opacity: 0.4, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  tree.add(shadow);

  return tree;
}

// Cozy Log Cabin / Buildings
export function createBuildingModel(catalogId: string, level: number = 1): THREE.Group {
  const building = new THREE.Group();

  if (catalogId === 'log_cabin') {
    // 1. Stone foundation
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 3.2), MAT_STONE);
    foundation.position.y = 0.2;
    foundation.castShadow = true;
    building.add(foundation);

    // 2. Timber walls
    const walls = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 2.8), MAT_WOOD);
    walls.position.y = 1.35;
    walls.castShadow = true;
    walls.receiveShadow = true;
    building.add(walls);

    // 3. Steep Snow-blanketed A-Roof
    const roofGeo = new THREE.ConeGeometry(2.5, 1.6, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, MAT_WOOD);
    roof.scale.set(1.0, 1.0, 0.85);
    roof.position.y = 2.95;
    roof.castShadow = true;
    building.add(roof);

    // Thick snow layer on roof
    const snowRoof = new THREE.Mesh(new THREE.ConeGeometry(2.56, 1.65, 4), MAT_SNOW);
    snowRoof.rotateY(Math.PI / 4);
    snowRoof.scale.set(1.02, 0.4, 0.87);
    snowRoof.position.y = 3.3;
    building.add(snowRoof);

    // 4. Stone Chimney
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.5), MAT_STONE);
    chimney.position.set(0.9, 2.6, 0.6);
    chimney.castShadow = true;
    building.add(chimney);

    // Chimney snow cap
    const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.65), MAT_SNOW);
    chimneyCap.position.set(0.9, 3.75, 0.6);
    building.add(chimneyCap);

    // 5. Warm Glowing Amber Windows
    const winGeo = new THREE.PlaneGeometry(0.65, 0.65);
    const frontWin1 = new THREE.Mesh(winGeo, MAT_GOLD_GLOW);
    frontWin1.position.set(-0.8, 1.5, 1.41);
    const frontWin2 = new THREE.Mesh(winGeo, MAT_GOLD_GLOW);
    frontWin2.position.set(0.8, 1.5, 1.41);
    building.add(frontWin1, frontWin2);

    // 6. Cozy Wooden Door with holiday wreath
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.2, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 })
    );
    door.position.set(0, 0.95, 1.42);
    const wreath = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.04, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 })
    );
    wreath.position.set(0, 1.15, 1.46);
    building.add(door, wreath);

    // Porch warm lantern
    const porchLight = new THREE.PointLight(0xffa500, 1.5, 6);
    porchLight.position.set(0, 1.8, 1.7);
    building.add(porchLight);
  } else if (catalogId === 'bakery_cafe') {
    // Cozy Bakery & Hot Cocoa Shop
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.4, 3.2), MAT_WOOD);
    base.position.y = 1.2;
    base.castShadow = true;
    building.add(base);

    // Striped red-and-white festive awning
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 1.0), awningMat);
    awning.position.set(0, 2.0, 2.0);
    awning.rotation.x = 0.2;
    building.add(awning);

    // Large storefront display windows
    const displayWin = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), MAT_GOLD_GLOW);
    displayWin.position.set(0, 1.2, 1.61);
    building.add(displayWin);

    // Hot Cocoa sign above door
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.45, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    sign.position.set(0, 2.6, 1.62);
    building.add(sign);

    // Steaming chimney
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.8, 8), MAT_STONE);
    chimney.position.set(1.4, 2.8, -0.6);
    building.add(chimney);

    // Warm cafe light
    const cafeLight = new THREE.PointLight(0xffbe5c, 1.8, 7);
    cafeLight.position.set(0, 1.8, 2.0);
    building.add(cafeLight);
  } else if (catalogId === 'town_hall') {
    // Majestic Frost City Hall with Clock & Aurora Spire
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.6, 4.4), MAT_STONE);
    foundation.position.y = 0.3;
    building.add(foundation);

    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 3.8), MAT_STONE);
    mainBody.position.y = 2.1;
    mainBody.castShadow = true;
    building.add(mainBody);

    // Clock tower
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.0, 2.0), MAT_STONE);
    tower.position.set(0, 4.6, 0.4);
    tower.castShadow = true;
    building.add(tower);

    // Glowing Clock face
    const clock = new THREE.Mesh(new THREE.CircleGeometry(0.6, 16), MAT_GOLD_GLOW);
    clock.position.set(0, 4.8, 1.42);
    building.add(clock);

    // Crystalline Spire
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.5, 6), MAT_CYAN_GLOW);
    spire.position.set(0, 7.0, 0.4);
    building.add(spire);

    // Pillared grand entrance
    for (let x = -1.6; x <= 1.6; x += 1.06) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.4, 8), MAT_STONE);
      pillar.position.set(x, 1.4, 2.1);
      building.add(pillar);
    }
  } else if (catalogId === 'greenhouse') {
    // Winter Frostberry Farm / Greenhouse
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 2.8), MAT_WOOD);
    base.position.y = 0.2;
    building.add(base);

    // Glass greenhouse dome
    const glassDome = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 3.0, 12, 1, false, 0, Math.PI),
      new THREE.MeshPhysicalMaterial({
        color: 0xa5f3fc,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.2,
      })
    );
    glassDome.rotation.z = Math.PI / 2;
    glassDome.position.set(0, 1.2, 0);
    building.add(glassDome);

    // Glowing winter frostberries inside
    for (let i = 0; i < 8; i++) {
      const berry = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      berry.position.set((i % 4 - 1.5) * 0.7, 0.4, (Math.floor(i / 4) - 0.5) * 0.8);
      building.add(berry);
    }
  } else if (catalogId === 'snowman') {
    return createSnowman();
  } else if (catalogId === 'fire_pit') {
    return createFirePit();
  } else if (catalogId === 'lantern_post') {
    return createLanternPost();
  } else if (catalogId === 'stone_road') {
    const road = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 2.4), MAT_STONE);
    road.position.y = 0.04;
    building.add(road);
  } else if (catalogId === 'bridge') {
    const bridge = new THREE.Group();
    const arch = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 1.8), MAT_WOOD);
    arch.position.y = 0.5;
    bridge.add(arch);
    const railLeft = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 0.12), MAT_WOOD);
    railLeft.position.set(0, 0.8, 0.85);
    const railRight = railLeft.clone();
    railRight.position.set(0, 0.8, -0.85);
    bridge.add(railLeft, railRight);
    building.add(bridge);
  } else {
    // Default Cozy A-Frame House
    const walls = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 2.6), MAT_WOOD);
    walls.position.y = 0.8;
    building.add(walls);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.8, 4), MAT_SNOW);
    roof.rotateY(Math.PI / 4);
    roof.position.y = 2.3;
    building.add(roof);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), MAT_GOLD_GLOW);
    win.position.set(0, 0.9, 1.31);
    building.add(win);
  }

  // Level badge star indicator if upgraded
  if (level > 1) {
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), MAT_CYAN_GLOW);
    star.position.set(0, 4.0, 0);
    building.add(star);
  }

  return building;
}

export function createSnowman(): THREE.Group {
  const snowman = new THREE.Group();

  const snowMat = MAT_SNOW;
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), snowMat);
  bottom.position.y = 0.6;
  bottom.castShadow = true;

  const middle = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 12), snowMat);
  middle.position.y = 1.45;
  middle.castShadow = true;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), snowMat);
  head.position.y = 2.1;
  head.castShadow = true;

  // Carrot nose
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.28, 6),
    new THREE.MeshStandardMaterial({ color: 0xea580c })
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 2.1, 0.42);

  // Coal eyes
  const coalMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), coalMat);
  eyeL.position.set(-0.1, 2.2, 0.3);
  const eyeR = eyeL.clone();
  eyeR.position.set(0.1, 2.2, 0.3);

  // Top hat
  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
  );
  hatBrim.position.y = 2.42;
  const hatTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
  );
  hatTop.position.y = 2.62;

  // Red ribbon
  const ribbon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.245, 0.245, 0.08, 12),
    new THREE.MeshStandardMaterial({ color: 0xdc2626 })
  );
  ribbon.position.y = 2.46;

  // Twig arms
  const twigMat = MAT_WOOD;
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), twigMat);
  armL.rotation.z = Math.PI / 3;
  armL.position.set(-0.6, 1.5, 0);
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), twigMat);
  armR.rotation.z = -Math.PI / 3;
  armR.position.set(0.6, 1.5, 0);

  snowman.add(bottom, middle, head, nose, eyeL, eyeR, hatBrim, hatTop, ribbon, armL, armR);
  return snowman;
}

export function createFirePit(): THREE.Group {
  const pit = new THREE.Group();

  // Stone ring
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25), MAT_STONE);
    stone.position.set(Math.cos(angle) * 1.1, 0.15, Math.sin(angle) * 1.1);
    pit.add(stone);
  }

  // Wood logs in teepee
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8, 6), MAT_WOOD);
    log.position.set(Math.cos(angle) * 0.25, 0.3, Math.sin(angle) * 0.25);
    log.rotation.z = 0.4;
    log.rotation.y = angle;
    pit.add(log);
  }

  // Glowing flames & embers
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 6), MAT_GOLD_GLOW);
  flame.position.y = 0.45;
  pit.add(flame);

  // Real point light
  const fireLight = new THREE.PointLight(0xff7700, 2.5, 9);
  fireLight.position.set(0, 0.6, 0);
  pit.add(fireLight);

  // 3 Sitting log benches
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + 0.5;
    const bench = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.4, 8), MAT_WOOD);
    bench.rotation.z = Math.PI / 2;
    bench.rotation.y = angle + Math.PI / 2;
    bench.position.set(Math.cos(angle) * 1.8, 0.2, Math.sin(angle) * 1.8);
    bench.castShadow = true;
    pit.add(bench);
  }

  return pit;
}

export function createLanternPost(): THREE.Group {
  const post = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 2.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
  );
  pole.position.y = 1.4;
  pole.castShadow = true;
  post.add(pole);

  // Hanging arm
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.06, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
  );
  arm.position.set(0.25, 2.7, 0);
  post.add(arm);

  // Lantern housing & glow
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.32, 6), MAT_GOLD_GLOW);
  glass.position.set(0.5, 2.45, 0);
  post.add(glass);

  // Snow on lantern cap
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.15, 6), MAT_SNOW);
  cap.position.set(0.5, 2.68, 0);
  post.add(cap);

  // Warm light
  const light = new THREE.PointLight(0xffb020, 1.2, 6);
  light.position.set(0.5, 2.4, 0);
  post.add(light);

  return post;
}

// Ancient Frost Altar
export function createFrostAltar(altarId: number): THREE.Group {
  const altar = new THREE.Group();

  // Tiered ancient stone pedestal
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.5, 8), MAT_STONE);
  base.position.y = 0.25;
  const topSlab = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.4, 8), MAT_STONE);
  topSlab.position.y = 0.65;
  altar.add(base, topSlab);

  // Floating crystalline ice rune
  const runeMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    transmission: 0.5,
  });
  const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.45), runeMat);
  rune.position.y = 1.6;
  rune.name = `altarRune_${altarId}`;
  altar.add(rune);

  const altarLight = new THREE.PointLight(0x38bdf8, 1.5, 5);
  altarLight.position.set(0, 1.6, 0);
  altar.add(altarLight);

  return altar;
}
