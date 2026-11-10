/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CharacterConfig,
  GameViewMode,
  WeatherMode,
  PlacedBuilding,
  HarvestNode,
  CompanionPlayer,
  VideoRecordData,
} from './types';
import {
  CharacterRig,
  createCharacterModel,
  createPineTree,
  createBuildingModel,
  createFrostAltar,
  MAT_SNOW,
  MAT_ICE,
  MAT_CYAN_GLOW,
} from './procedural';
import { sound } from './audio';

export interface EngineCallbacks {
  onCollectResource: (type: 'snow' | 'berry' | 'lumber' | 'crystal', amount: number) => void;
  onAltarLit: (altarIndex: number) => void;
  onSkateComboUpdate: (combo: number) => void;
  onRaceCheckpoint: (index: number, total: number) => void;
  onRaceFinish: (timeSeconds: number) => void;
  onCompanionMessage: (companionName: string, text: string) => void;
  onRecordingComplete: (data: VideoRecordData) => void;
}

export class FrostverseEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;

  // Three.js core
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock: THREE.Clock = new THREE.Clock();
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private isDestroyed: boolean = false;

  // Lighting
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;

  // Player & Companions
  private playerRig!: CharacterRig;
  private playerPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private playerVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private playerRotY: number = 0;
  private isSkating: boolean = false;
  private skateCombo: number = 0;
  private lastSkateComboTime: number = 0;
  private companions: { rig: CharacterRig; data: CompanionPlayer; targetPos: THREE.Vector3 }[] = [];

  // Weather & Particles
  private snowParticles!: THREE.Points;
  private auroraMesh!: THREE.Mesh;
  private weatherMode: WeatherMode = 'SNOW_FALL';

  // Input states
  private inputVector: { x: number; y: number } = { x: 0, y: 0 };
  private isJumping: boolean = false;
  private jumpVelocity: number = 0;
  private isGrounded: boolean = true;

  // Camera settings
  private viewMode: GameViewMode = 'ISOMETRIC';
  private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private vlogAngle: number = 0;

  // Buildings & World
  private buildingGroup: THREE.Group = new THREE.Group();
  private placedBuildingsMap: Map<string, THREE.Group> = new Map();
  private ghostBuildingGroup: THREE.Group = new THREE.Group();
  private activeGhostId: string | null = null;
  private ghostPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private ghostRotY: number = 0;

  // Resource Nodes
  private harvestNodes: { mesh: THREE.Group; data: HarvestNode }[] = [];

  // Slalom Race Gates
  private raceActive: boolean = false;
  private raceGates: THREE.Group[] = [];
  private currentGateIndex: number = 0;
  private raceStartTime: number = 0;

  // Snowballs
  private activeSnowballs: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

  // Video Recording
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private isRecording: boolean = false;

  constructor(container: HTMLElement, characterConfig: CharacterConfig, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.detectGpu();
    this.initScene();
    this.initLighting();
    this.initTerrain();
    this.initPlayer(characterConfig);
    this.initCompanions();
    this.initSnowParticles();
    this.initAuroraSky();
    this.initHarvestNodes();
    this.initAltars();
    this.initRaceGates();
    this.bindEvents();

    this.startLoop();
  }

  private detectGpu() {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) {
        this.isSoftwareGl = true;
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      this.isSoftwareGl = true;
    }
  }

  private initScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1428);
    this.scene.fog = new THREE.FogExp2(0x0d1f3d, 0.014);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    this.camera.position.set(0, 18, 22);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // Needed for snapshot & recording
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Studio Environment map per Three.js directives
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.scene.add(this.buildingGroup);
    this.scene.add(this.ghostBuildingGroup);
  }

  private initLighting() {
    // Warm sun key light (Morning / Dusk golden warmth)
    this.dirLight = new THREE.DirectionalLight(0xffecd2, 1.8);
    this.dirLight.position.set(25, 45, 20);
    this.dirLight.castShadow = !this.isSoftwareGl;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 120;
    const d = 35;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    // Cool blue sky & snow hemisphere fill
    this.hemiLight = new THREE.HemisphereLight(0xbbe1fa, 0x0f2744, 0.9);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0x243b61, 0.4);
    this.scene.add(this.ambientLight);
  }

  private initTerrain() {
    // 1. Rolling Snowy Main Ground
    const groundGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
    groundGeo.rotateX(-Math.PI / 2);

    // Elevate outer perimeter into natural cliffs & mountains
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);

      // Smooth central valley (dist < 35), then undulating hills, rising to mountains at edges
      if (distFromCenter < 12) {
        // Frozen lake basin: slightly depressed
        pos.setY(i, -0.15);
      } else if (distFromCenter < 40) {
        const hill = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 0.6;
        pos.setY(i, hill);
      } else {
        // Outer mountain range natural barriers
        const mountain = Math.pow((distFromCenter - 40) / 40, 2) * 14 + Math.sin(x * 0.2) * 2;
        pos.setY(i, mountain);
      }
    }
    groundGeo.computeVertexNormals();

    const groundMesh = new THREE.Mesh(groundGeo, MAT_SNOW);
    groundMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(groundMesh);

    // 2. Frozen Crystal Lake in the Center (slick ice)
    const lakeGeo = new THREE.CylinderGeometry(11.5, 11.5, 0.2, 32);
    const lakeMesh = new THREE.Mesh(lakeGeo, MAT_ICE);
    lakeMesh.position.set(0, -0.05, 0);
    lakeMesh.receiveShadow = true;
    this.scene.add(lakeMesh);

    // Decorative ice edge rim
    const lakeRim = new THREE.Mesh(
      new THREE.TorusGeometry(11.5, 0.35, 8, 32),
      MAT_SNOW
    );
    lakeRim.rotation.x = Math.PI / 2;
    lakeRim.position.y = 0.05;
    this.scene.add(lakeRim);

    // 3. Central Village Square: Roaring Bonfire
    const centralFire = createBuildingModel('fire_pit');
    centralFire.position.set(0, 0, -18);
    this.scene.add(centralFire);

    // 4. Pine Forest around perimeter
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2 + Math.random() * 0.2;
      const radius = 26 + Math.random() * 32;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Avoid center lake
      if (Math.sqrt(x * x + z * z) > 14) {
        const scale = 0.8 + Math.random() * 0.8;
        const tree = createPineTree(scale, i % 4 === 0);
        tree.position.set(x, this.getTerrainHeight(x, z), z);
        this.scene.add(tree);
      }
    }

    // Cozy Village Lantern Posts along paths
    const pathAngles = [0, 1.57, 3.14, 4.71];
    pathAngles.forEach((a) => {
      const p1 = createBuildingModel('lantern_post');
      p1.position.set(Math.cos(a) * 14, 0, Math.sin(a) * 14);
      p1.rotation.y = a;
      this.scene.add(p1);
    });

    // Default starting buildings (Starter Cozy Hamlet)
    const starterCabin = createBuildingModel('log_cabin');
    starterCabin.position.set(8, 0, -16);
    starterCabin.rotation.y = -0.4;
    this.scene.add(starterCabin);

    const starterCafe = createBuildingModel('bakery_cafe');
    starterCafe.position.set(-8, 0, -16);
    starterCafe.rotation.y = 0.4;
    this.scene.add(starterCafe);

    const starterSnowman = createBuildingModel('snowman');
    starterSnowman.position.set(0, 0, 14);
    this.scene.add(starterSnowman);
  }

  public getTerrainHeight(x: number, z: number): number {
    const dist = Math.sqrt(x * x + z * z);
    if (dist < 11.5) return -0.05; // on lake
    if (dist < 40) return Math.sin(x * 0.15) * Math.cos(z * 0.15) * 0.6;
    return Math.pow((dist - 40) / 40, 2) * 14 + Math.sin(x * 0.2) * 2;
  }

  private initPlayer(config: CharacterConfig) {
    this.playerRig = createCharacterModel(config);
    this.playerPos.set(0, 0, 5);
    this.playerRig.group.position.copy(this.playerPos);
    this.scene.add(this.playerRig.group);
  }

  private initCompanions() {
    const companionList: CompanionPlayer[] = [
      { id: '1', name: 'Lumi', parkaColor: '#06b6d4', beanieColor: '#f43f5e', pet: 'penguin', x: 4, z: 3, rotation: 0, isMoving: false, isSkating: true, villageName: 'Aurora Haven' },
      { id: '2', name: 'NordicFox', parkaColor: '#8b5cf6', beanieColor: '#fbbf24', pet: 'fox', x: -5, z: 2, rotation: 1.2, isMoving: true, isSkating: true, villageName: 'Frost Peaks' },
      { id: '3', name: 'Frosty_Dan', parkaColor: '#10b981', beanieColor: '#3b82f6', pet: 'owl', x: 2, z: -15, rotation: 3.1, isMoving: false, isSkating: false, villageName: 'Cozy Pines' },
      { id: '4', name: 'AuroraQueen', parkaColor: '#ec4899', beanieColor: '#ffffff', pet: 'fox', x: -12, z: 8, rotation: 2.1, isMoving: true, isSkating: false, villageName: 'Glacier Falls' },
    ];

    companionList.forEach((data) => {
      const rig = createCharacterModel({
        name: data.name,
        parkaColor: data.parkaColor,
        beanieColor: data.beanieColor,
        scarfColor: '#fef08a',
        bootsColor: '#1e293b',
        pet: data.pet as 'penguin' | 'fox' | 'owl',
        titleBadge: 'Explorer',
      });
      rig.group.position.set(data.x, this.getTerrainHeight(data.x, data.z), data.z);
      this.scene.add(rig.group);
      this.companions.push({
        rig,
        data,
        targetPos: new THREE.Vector3(data.x, 0, data.z),
      });
    });
  }

  private initSnowParticles() {
    const particleCount = this.isSoftwareGl ? 600 : 1800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      velocities[i * 3] = (Math.random() - 0.5) * 0.4;
      velocities[i * 3 + 1] = -(0.8 + Math.random() * 1.4);
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
    });

    this.snowParticles = new THREE.Points(geo, mat);
    this.scene.add(this.snowParticles);
  }

  private initAuroraSky() {
    // Ribbon-like magical Aurora Borealis curtain in northern sky
    const ribbonGeo = new THREE.CylinderGeometry(80, 80, 24, 48, 1, true, -Math.PI * 0.4, Math.PI * 0.8);
    const ribbonMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.auroraMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    this.auroraMesh.position.set(0, 28, -20);
    this.scene.add(this.auroraMesh);
  }

  private initHarvestNodes() {
    const nodeCoords = [
      { type: 'snowdrift', x: 6, z: 8 },
      { type: 'snowdrift', x: -7, z: 10 },
      { type: 'frostberry', x: 12, z: -8 },
      { type: 'frostberry', x: -14, z: -6 },
      { type: 'pinewood', x: 18, z: 6 },
      { type: 'pinewood', x: -18, z: 12 },
      { type: 'icecrystal', x: 8, z: 0 },
      { type: 'icecrystal', x: -8, z: -2 },
    ];

    nodeCoords.forEach((nc, idx) => {
      const group = new THREE.Group();
      if (nc.type === 'snowdrift') {
        const drift = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), MAT_SNOW);
        drift.scale.set(1.5, 0.4, 1.2);
        drift.position.y = 0.2;
        group.add(drift);
      } else if (nc.type === 'frostberry') {
        const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6), new THREE.MeshStandardMaterial({ color: 0x065f46 }));
        bush.position.y = 0.4;
        group.add(bush);
        // glowing berry
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        berry.position.set(0, 0.7, 0);
        group.add(berry);
      } else if (nc.type === 'pinewood') {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x78350f }));
        log.rotation.z = Math.PI / 2;
        log.position.y = 0.2;
        group.add(log);
      } else {
        // Ice crystal
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), MAT_CYAN_GLOW);
        crystal.position.y = 0.5;
        group.add(crystal);
      }

      group.position.set(nc.x, this.getTerrainHeight(nc.x, nc.z), nc.z);
      this.scene.add(group);

      this.harvestNodes.push({
        mesh: group,
        data: {
          id: `node_${idx}`,
          type: nc.type as 'snowdrift' | 'frostberry' | 'pinewood' | 'icecrystal',
          x: nc.x,
          z: nc.z,
          respawnTime: 0,
          available: true,
        },
      });
    });
  }

  private initAltars() {
    const altarPositions = [
      { id: 0, x: 0, z: -28 },  // North Altar
      { id: 1, x: 28, z: 0 },   // East Altar
      { id: 2, x: 0, z: 28 },   // South Altar
      { id: 3, x: -28, z: 0 },  // West Altar
    ];

    altarPositions.forEach((pos) => {
      const altar = createFrostAltar(pos.id);
      altar.position.set(pos.x, this.getTerrainHeight(pos.x, pos.z), pos.z);
      this.scene.add(altar);
    });
  }

  private initRaceGates() {
    // 5 Slalom arches around the frozen lake
    const gateAngles = [0.3, 1.5, 2.8, 4.1, 5.4];
    gateAngles.forEach((angle, idx) => {
      const gate = new THREE.Group();
      const radius = 10.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Glowing ice arch
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.12, 6, 16, Math.PI),
        MAT_CYAN_GLOW
      );
      arch.position.y = 0;
      gate.add(arch);

      // Gate banner number
      const banner = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd166 })
      );
      banner.position.y = 1.6;
      gate.add(banner);

      gate.position.set(x, 0, z);
      gate.rotation.y = angle + Math.PI / 2;
      gate.visible = false; // Enabled during race
      this.scene.add(gate);
      this.raceGates.push(gate);
    });
  }

  // ==========================================
  // INPUT & CONTROLS
  // ==========================================

  public setInputVector(x: number, y: number) {
    this.inputVector.x = x;
    this.inputVector.y = y;
  }

  public jump() {
    if (this.isGrounded) {
      this.isGrounded = false;
      this.isJumping = true;
      this.jumpVelocity = 7.5;
      sound.playFootstep(this.isSkating);
      sound.haptic(20);
    }
  }

  public throwSnowball() {
    sound.playSnowballThrow();

    const forward = new THREE.Vector3(
      Math.sin(this.playerRotY),
      0.3,
      Math.cos(this.playerRotY)
    ).normalize();

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      MAT_SNOW
    );
    ball.position.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
    this.scene.add(ball);

    this.activeSnowballs.push({
      mesh: ball,
      vel: forward.multiplyScalar(18),
      life: 2.0,
    });
  }

  public setViewMode(mode: GameViewMode) {
    this.viewMode = mode;
    sound.playTap();
  }

  public setWeatherMode(weather: WeatherMode) {
    this.weatherMode = weather;
    if (weather === 'CLEAR_DAWN') {
      this.scene.background = new THREE.Color(0x1a2e4c);
      this.dirLight.color.setHex(0xffdfba);
      this.dirLight.intensity = 2.2;
      this.snowParticles.visible = false;
      this.auroraMesh.visible = false;
    } else if (weather === 'AURORA_NIGHT') {
      this.scene.background = new THREE.Color(0x061124);
      this.dirLight.color.setHex(0x38bdf8);
      this.dirLight.intensity = 0.8;
      this.snowParticles.visible = true;
      this.auroraMesh.visible = true;
    } else {
      // SNOW_FALL & BLIZZARD
      this.scene.background = new THREE.Color(0x0a1428);
      this.dirLight.color.setHex(0xffecd2);
      this.dirLight.intensity = 1.6;
      this.snowParticles.visible = true;
      this.auroraMesh.visible = true;
    }
    sound.playTap();
  }

  // ==========================================
  // BUILDING SYSTEM
  // ==========================================

  public setGhostBuilding(catalogId: string | null) {
    this.activeGhostId = catalogId;
    while (this.ghostBuildingGroup.children.length > 0) {
      this.ghostBuildingGroup.remove(this.ghostBuildingGroup.children[0]);
    }

    if (catalogId) {
      const model = createBuildingModel(catalogId);
      // Tint ghost model semi-transparent
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: 0.6,
          });
        }
      });
      this.ghostBuildingGroup.add(model);
    }
  }

  public rotateGhostBuilding() {
    this.ghostRotY += Math.PI / 4;
    sound.playTap();
  }

  public placeCurrentGhost(): PlacedBuilding | null {
    if (!this.activeGhostId) return null;

    // Check collision with central lake
    if (this.ghostPos.length() < 12.5) {
      sound.haptic([50, 50]);
      return null;
    }

    const id = `b_${Date.now()}`;
    const placed: PlacedBuilding = {
      id,
      catalogId: this.activeGhostId,
      x: this.ghostPos.x,
      z: this.ghostPos.z,
      rotationY: this.ghostRotY,
      level: 1,
      lastCollectedAt: Date.now(),
    };

    const realModel = createBuildingModel(this.activeGhostId);
    realModel.position.copy(this.ghostPos);
    realModel.rotation.y = this.ghostRotY;
    this.buildingGroup.add(realModel);
    this.placedBuildingsMap.set(id, realModel);

    sound.playBuildPlace();
    return placed;
  }

  public upgradeBuilding(buildingId: string, newLevel: number, catalogId: string) {
    const existing = this.placedBuildingsMap.get(buildingId);
    if (existing) {
      const pos = existing.position.clone();
      const rot = existing.rotation.y;
      this.buildingGroup.remove(existing);

      const upgraded = createBuildingModel(catalogId, newLevel);
      upgraded.position.copy(pos);
      upgraded.rotation.y = rot;
      this.buildingGroup.add(upgraded);
      this.placedBuildingsMap.set(buildingId, upgraded);

      sound.playFanfare();
    }
  }

  public removeBuilding(buildingId: string) {
    const existing = this.placedBuildingsMap.get(buildingId);
    if (existing) {
      this.buildingGroup.remove(existing);
      this.placedBuildingsMap.delete(buildingId);
      sound.playTap();
    }
  }

  // ==========================================
  // MINI-GAMES TRIGGER
  // ==========================================

  public startSlalomRace() {
    this.raceActive = true;
    this.currentGateIndex = 0;
    this.raceStartTime = performance.now();
    this.raceGates.forEach((g, i) => {
      g.visible = true;
      (g.children[1] as THREE.Mesh).material = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x22c55e : 0xffd166,
      });
    });
    sound.playFanfare();
  }

  // ==========================================
  // CREATOR FEATURES: RECORDING & SCREENSHOT
  // ==========================================

  public takeSnapshot(): string {
    sound.playCameraShutter();
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public startRecording(): boolean {
    try {
      const stream = this.renderer.domElement.captureStream(30);
      this.recordedChunks = [];
      const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      let selectedMime = 'video/webm';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      this.mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMime });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: selectedMime });
        const blobUrl = URL.createObjectURL(blob);
        const durationMs = performance.now() - this.recordingStartTime;
        this.callbacks.onRecordingComplete({
          blobUrl,
          blob,
          durationMs,
          createdAt: new Date().toLocaleTimeString(),
        });
      };

      this.mediaRecorder.start(100);
      this.recordingStartTime = performance.now();
      this.isRecording = true;
      sound.playCameraShutter();
      return true;
    } catch {
      return false;
    }
  }

  public stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      sound.playCameraShutter();
    }
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  // ==========================================
  // MAIN ANIMATION LOOP
  // ==========================================

  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;

      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Clamp frame delta per Three.js skill

      this.updateSimulation(dt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDestroyed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateSimulation(dt: number) {
    const elapsed = this.clock.getElapsedTime();

    // 1. Terrain Height & Ice Lake detection
    const distToCenter = Math.sqrt(this.playerPos.x * this.playerPos.x + this.playerPos.z * this.playerPos.z);
    this.isSkating = distToCenter < 11.2;

    // Movement speed & friction
    const maxSpeed = this.isSkating ? 11.0 : 6.0;
    const friction = this.isSkating ? 0.98 : 0.82;
    const accel = this.isSkating ? 18.0 : 32.0;

    // Input to movement
    if (Math.abs(this.inputVector.x) > 0.05 || Math.abs(this.inputVector.y) > 0.05) {
      // In isometric mode, diagonal isometric transform
      const moveX = this.inputVector.x * 0.707 - this.inputVector.y * 0.707;
      const moveZ = this.inputVector.x * 0.707 + this.inputVector.y * 0.707;

      this.playerVel.x += moveX * accel * dt;
      this.playerVel.z += moveZ * accel * dt;

      // Rotate player to face movement direction
      const targetAngle = Math.atan2(moveX, moveZ);
      this.playerRotY = THREE.MathUtils.damp(this.playerRotY, targetAngle, 12, dt);
    }

    // Apply friction and speed cap
    this.playerVel.x *= friction;
    this.playerVel.z *= friction;
    const curSpeed = Math.sqrt(this.playerVel.x * this.playerVel.x + this.playerVel.z * this.playerVel.z);
    if (curSpeed > maxSpeed) {
      this.playerVel.multiplyScalar(maxSpeed / curSpeed);
    }

    // Apply movement
    this.playerPos.x += this.playerVel.x * dt;
    this.playerPos.z += this.playerVel.z * dt;

    // Boundary constraint
    const maxBound = 65;
    this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -maxBound, maxBound);
    this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -maxBound, maxBound);

    // Jump gravity physics
    if (!this.isGrounded) {
      this.jumpVelocity -= 22 * dt;
      this.playerPos.y += this.jumpVelocity * dt;
      const groundY = this.getTerrainHeight(this.playerPos.x, this.playerPos.z);
      if (this.playerPos.y <= groundY) {
        this.playerPos.y = groundY;
        this.isGrounded = true;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    } else {
      this.playerPos.y = this.getTerrainHeight(this.playerPos.x, this.playerPos.z);
    }

    // Update Player Rig
    this.playerRig.group.position.copy(this.playerPos);
    this.playerRig.group.rotation.y = this.playerRotY;

    // Walk / Skate Animation
    const isMoving = curSpeed > 0.4;
    const animSpeed = this.isSkating ? 6 : 10;
    const cycle = Math.sin(elapsed * animSpeed);

    if (isMoving) {
      this.playerRig.leftArm.rotation.x = cycle * 0.6;
      this.playerRig.rightArm.rotation.x = -cycle * 0.6;
      this.playerRig.leftLeg.rotation.x = -cycle * 0.7;
      this.playerRig.rightLeg.rotation.x = cycle * 0.7;

      // Fluttering scarf tail in wind
      this.playerRig.scarfTail.rotation.x = -0.5 + Math.sin(elapsed * 14) * 0.3;

      // Pet hopping alongside
      if (this.playerRig.petGroup) {
        this.playerRig.petGroup.position.y = Math.abs(Math.sin(elapsed * 12)) * 0.15;
      }

      // Footstep sound throttled
      if (Math.abs(cycle) > 0.95 && Math.random() < 0.25) {
        sound.playFootstep(this.isSkating);
      }
    } else {
      // Idle breathing
      this.playerRig.leftArm.rotation.x = 0;
      this.playerRig.rightArm.rotation.x = 0;
      this.playerRig.leftLeg.rotation.x = 0;
      this.playerRig.rightLeg.rotation.x = 0;
      this.playerRig.scarfTail.rotation.x = -0.2 + Math.sin(elapsed * 3) * 0.1;
      if (this.playerRig.petGroup) {
        this.playerRig.petGroup.position.y = 0;
      }
    }

    // Ice Skating Combos
    if (this.isSkating && curSpeed > 4.0) {
      if (performance.now() - this.lastSkateComboTime > 800) {
        this.skateCombo++;
        this.lastSkateComboTime = performance.now();
        this.callbacks.onSkateComboUpdate(this.skateCombo);
        sound.playChime(1.0 + Math.min(this.skateCombo * 0.08, 1.0));
      }
    } else if (performance.now() - this.lastSkateComboTime > 2500 && this.skateCombo > 0) {
      this.skateCombo = 0;
      this.callbacks.onSkateComboUpdate(0);
    }

    // 2. Slalom Race Checkpoint detection
    if (this.raceActive) {
      const currentGate = this.raceGates[this.currentGateIndex];
      const distToGate = this.playerPos.distanceTo(currentGate.position);
      if (distToGate < 2.5) {
        sound.playRaceCheckpoint();
        this.callbacks.onRaceCheckpoint(this.currentGateIndex + 1, this.raceGates.length);
        this.currentGateIndex++;

        if (this.currentGateIndex >= this.raceGates.length) {
          // Finished race!
          this.raceActive = false;
          const totalTime = (performance.now() - this.raceStartTime) / 1000;
          this.callbacks.onRaceFinish(totalTime);
          this.raceGates.forEach((g) => (g.visible = false));
        } else {
          // Highlight next gate
          (this.raceGates[this.currentGateIndex].children[1] as THREE.Mesh).material = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
          });
        }
      }
    }

    // 3. Harvest Node Collection
    this.harvestNodes.forEach((node) => {
      if (node.data.available) {
        const d = this.playerPos.distanceTo(new THREE.Vector3(node.data.x, 0, node.data.z));
        if (d < 2.2) {
          node.data.available = false;
          node.data.respawnTime = performance.now() + 15000;
          node.mesh.visible = false;
          sound.playHarvest();

          let amount = 5;
          if (node.data.type === 'snowdrift') amount = 12;
          this.callbacks.onCollectResource(
            node.data.type === 'snowdrift' ? 'snow' : node.data.type === 'frostberry' ? 'berry' : node.data.type === 'pinewood' ? 'lumber' : 'crystal',
            amount
          );
        }
      } else if (performance.now() > node.data.respawnTime) {
        node.data.available = true;
        node.mesh.visible = true;
      }
    });

    // 4. Ghost Building positioning in Build Mode
    if (this.activeGhostId) {
      // Snapped position in front of player
      const snapGrid = 2.0;
      const targetGhostX = Math.round((this.playerPos.x + Math.sin(this.playerRotY) * 4) / snapGrid) * snapGrid;
      const targetGhostZ = Math.round((this.playerPos.z + Math.cos(this.playerRotY) * 4) / snapGrid) * snapGrid;
      this.ghostPos.set(targetGhostX, this.getTerrainHeight(targetGhostX, targetGhostZ), targetGhostZ);
      this.ghostBuildingGroup.position.copy(this.ghostPos);
      this.ghostBuildingGroup.rotation.y = this.ghostRotY;
    }

    // 5. Update Snowballs
    for (let i = this.activeSnowballs.length - 1; i >= 0; i--) {
      const sb = this.activeSnowballs[i];
      sb.life -= dt;
      sb.vel.y -= 9.8 * dt;
      sb.mesh.position.addScaledVector(sb.vel, dt);

      // Hit ground
      if (sb.mesh.position.y <= this.getTerrainHeight(sb.mesh.position.x, sb.mesh.position.z)) {
        sound.playSnowballImpact();
        this.scene.remove(sb.mesh);
        this.activeSnowballs.splice(i, 1);
      } else if (sb.life <= 0) {
        this.scene.remove(sb.mesh);
        this.activeSnowballs.splice(i, 1);
      }
    }

    // 6. Companion Travelers AI
    this.companions.forEach((comp, idx) => {
      // Gentle patrol around their territory
      const dist = comp.rig.group.position.distanceTo(comp.targetPos);
      if (dist < 1.0) {
        // Pick new nearby target
        const r = 8 + Math.random() * 12;
        const a = Math.random() * Math.PI * 2;
        comp.targetPos.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      } else {
        const dir = comp.targetPos.clone().sub(comp.rig.group.position).normalize();
        comp.rig.group.position.x += dir.x * 2.5 * dt;
        comp.rig.group.position.z += dir.z * 2.5 * dt;
        comp.rig.group.position.y = this.getTerrainHeight(comp.rig.group.position.x, comp.rig.group.position.z);
        comp.rig.group.rotation.y = THREE.MathUtils.damp(comp.rig.group.rotation.y, Math.atan2(dir.x, dir.z), 6, dt);

        const compCycle = Math.sin(elapsed * 7 + idx);
        comp.rig.leftArm.rotation.x = compCycle * 0.5;
        comp.rig.rightArm.rotation.x = -compCycle * 0.5;
        comp.rig.leftLeg.rotation.x = -compCycle * 0.6;
        comp.rig.rightLeg.rotation.x = compCycle * 0.6;
      }
    });

    // 7. Snow Particles Falling
    const posAttr = this.snowParticles.geometry.attributes.position as THREE.BufferAttribute;
    const velAttr = this.snowParticles.geometry.attributes.velocity as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      let y = posAttr.getY(i) + velAttr.getY(i) * dt * 4;
      let x = posAttr.getX(i) + velAttr.getX(i) * dt;
      let z = posAttr.getZ(i) + velAttr.getZ(i) * dt;

      if (y < 0) {
        y = 35;
        x = this.playerPos.x + (Math.random() - 0.5) * 80;
        z = this.playerPos.z + (Math.random() - 0.5) * 80;
      }
      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;

    // 8. Aurora Borealis wave animation
    if (this.auroraMesh) {
      this.auroraMesh.rotation.y = Math.sin(elapsed * 0.15) * 0.2;
    }

    // 9. Camera Rig & Smoothing per Three.js directives
    this.updateCamera(dt, elapsed);
  }

  private updateCamera(dt: number, elapsed: number) {
    if (this.viewMode === 'ISOMETRIC') {
      // Classic cozy 45-degree isometric perspective
      const targetCamPos = new THREE.Vector3(
        this.playerPos.x + 14,
        this.playerPos.y + 18,
        this.playerPos.z + 18
      );
      this.camera.position.lerp(targetCamPos, 0.08);
      this.cameraTarget.lerp(this.playerPos, 0.1);
      this.camera.lookAt(this.cameraTarget);
    } else if (this.viewMode === 'FOLLOW') {
      // Cinematic 3rd-person follow camera
      const backOffset = new THREE.Vector3(
        -Math.sin(this.playerRotY) * 7,
        3.5,
        -Math.cos(this.playerRotY) * 7
      );
      const targetCamPos = this.playerPos.clone().add(backOffset);
      this.camera.position.lerp(targetCamPos, 0.09);
      this.cameraTarget.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
      this.camera.lookAt(this.cameraTarget);
    } else if (this.viewMode === 'VLOG') {
      // Front-facing selfie camera (held on vlog stick)
      const vlogOffset = new THREE.Vector3(
        Math.sin(this.playerRotY) * 2.8,
        1.6 + Math.sin(elapsed * 2) * 0.04, // handheld slight sway
        Math.cos(this.playerRotY) * 2.8
      );
      const targetCamPos = this.playerPos.clone().add(vlogOffset);
      this.camera.position.lerp(targetCamPos, 0.15);
      // Look back directly at the player's face
      const faceTarget = this.playerPos.clone().add(new THREE.Vector3(0, 1.3, 0));
      this.camera.lookAt(faceTarget);
    } else if (this.viewMode === 'DRONE') {
      // High-angle overhead cinematic survey
      const targetCamPos = new THREE.Vector3(
        this.playerPos.x,
        36,
        this.playerPos.z + 12
      );
      this.camera.position.lerp(targetCamPos, 0.05);
      this.camera.lookAt(this.playerPos);
    } else if (this.viewMode === 'CINEMATIC_ORBIT') {
      // Gentle 360 rotating pan around the town/player
      this.vlogAngle += dt * 0.35;
      const radius = 24;
      const targetCamPos = new THREE.Vector3(
        this.playerPos.x + Math.cos(this.vlogAngle) * radius,
        15 + Math.sin(elapsed * 0.5) * 3,
        this.playerPos.z + Math.sin(this.vlogAngle) * radius
      );
      this.camera.position.lerp(targetCamPos, 0.05);
      this.camera.lookAt(this.playerPos);
    }
  }

  // Window resize handler
  private bindEvents() {
    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public updateCharacterConfig(config: CharacterConfig) {
    this.scene.remove(this.playerRig.group);
    this.playerRig = createCharacterModel(config);
    this.playerRig.group.position.copy(this.playerPos);
    this.playerRig.group.rotation.y = this.playerRotY;
    this.scene.add(this.playerRig.group);
  }

  public destroy() {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch {
        // Ignored
      }
    }
    this.renderer.dispose();
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
}
