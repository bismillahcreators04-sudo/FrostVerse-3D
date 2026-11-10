/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameViewMode = 'ISOMETRIC' | 'FOLLOW' | 'VLOG' | 'DRONE' | 'CINEMATIC_ORBIT';

export type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED';

export type WeatherMode = 'CLEAR_DAWN' | 'SNOW_FALL' | 'AURORA_NIGHT' | 'BLIZZARD_MAGIC';

export type ActiveMiniGame = 'NONE' | 'ICE_SLIDE' | 'GLYPH_MEMORY' | 'SLALOM_RACE' | 'TREASURE_HUNT';

export interface CharacterConfig {
  name: string;
  parkaColor: string;
  beanieColor: string;
  scarfColor: string;
  bootsColor: string;
  pet: 'penguin' | 'fox' | 'owl' | 'bear' | 'none';
  titleBadge: string;
}

export interface PlayerResources {
  coins: number;
  frostSparkles: number;
  pineLumber: number;
  glacialStone: number;
  starShards: number;
}

export interface VillageStatus {
  tier: number; // 1: Snowdrift Hamlet, 2: Frostwood Township, 3: Aurora Haven, 4: Frost Metropolis
  tierName: string;
  population: number;
  happiness: number; // 0 - 100
  unlockedTerritories: number; // 1 to 4
  buildingsCount: number;
}

export interface BuildingCatalogItem {
  id: string;
  name: string;
  category: 'house' | 'shop' | 'infrastructure' | 'farming' | 'decor';
  description: string;
  costCoins: number;
  costSparkles: number;
  costLumber: number;
  costStone: number;
  populationBonus: number;
  happinessBonus: number;
  incomePerMinute: number;
  dimensions: [number, number]; // width x, depth z
  color: string;
  tierRequired: number;
}

export interface PlacedBuilding {
  id: string;
  catalogId: string;
  x: number;
  z: number;
  rotationY: number;
  level: number;
  lastCollectedAt: number;
}

export interface HarvestNode {
  id: string;
  type: 'snowdrift' | 'frostberry' | 'pinewood' | 'icecrystal';
  x: number;
  z: number;
  respawnTime: number; // timestamp
  available: boolean;
}

export interface Mission {
  id: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardSparkles: number;
  rewardShards: number;
  completed: boolean;
  claimed: boolean;
  category: 'daily' | 'village' | 'creator';
}

export interface CompanionPlayer {
  id: string;
  name: string;
  parkaColor: string;
  beanieColor: string;
  pet: string;
  x: number;
  z: number;
  rotation: number;
  isMoving: boolean;
  isSkating: boolean;
  currentEmote?: string;
  villageName: string;
  chatBubble?: {
    text: string;
    expiresAt: number;
  };
}

export interface VideoRecordData {
  blobUrl: string;
  blob: Blob;
  durationMs: number;
  createdAt: string;
  thumbnailUrl?: string;
}
