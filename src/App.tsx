/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { FrostverseEngine } from './game/engine';
import {
  CharacterConfig,
  GameScreen,
  GameViewMode,
  WeatherMode,
  PlayerResources,
  VillageStatus,
  Mission,
  VideoRecordData,
} from './game/types';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { BuildMenu, BUILDING_CATALOG } from './components/BuildMenu';
import { MiniGamesModal } from './components/MiniGamesModal';
import { MissionsModal } from './components/MissionsModal';
import { CustomizerModal } from './components/CustomizerModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { VlogOverlay } from './components/VlogOverlay';
import { RecordingModal } from './components/RecordingModal';
import { sound } from './game/audio';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FrostverseEngine | null>(null);

  // Game Screen State
  const [screen, setScreen] = useState<GameScreen>('TITLE');

  // Character Configuration
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>({
    name: 'Frostborn',
    parkaColor: '#2563eb',
    beanieColor: '#ef4444',
    scarfColor: '#fbbf24',
    bootsColor: '#334155',
    pet: 'penguin',
    titleBadge: 'Frost Pioneer',
  });

  // Resources & Progression
  const [resources, setResources] = useState<PlayerResources>({
    coins: 250,
    frostSparkles: 80,
    pineLumber: 45,
    glacialStone: 30,
    starShards: 3,
  });

  // Village Status
  const [village, setVillage] = useState<VillageStatus>({
    tier: 1,
    tierName: 'Snowdrift Hamlet',
    population: 12,
    happiness: 95,
    unlockedTerritories: 1,
    buildingsCount: 3,
  });

  // Camera & Weather
  const [viewMode, setViewMode] = useState<GameViewMode>('ISOMETRIC');
  const [weatherMode, setWeatherMode] = useState<WeatherMode>('SNOW_FALL');
  const [skateCombo, setSkateCombo] = useState<number>(0);

  // Active Modals & Creator Tools
  const [isBuildOpen, setIsBuildOpen] = useState(false);
  const [isMiniGamesOpen, setIsMiniGamesOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [isVlogOpen, setIsVlogOpen] = useState(false);
  const [activeGhostId, setActiveGhostId] = useState<string | null>(null);

  // Video recording & Snapshot
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<VideoRecordData | null>(null);
  const [snapshotPreview, setSnapshotPreview] = useState<string | null>(null);

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Missions & Quests
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'm1',
      title: 'Snowflake Harvester',
      desc: 'Gather 50 fluffy snowflakes from winter snowdrifts',
      target: 50,
      current: 12,
      rewardCoins: 120,
      rewardSparkles: 40,
      rewardShards: 0,
      completed: false,
      claimed: false,
      category: 'daily',
    },
    {
      id: 'm2',
      title: 'Master of the Ice Rink',
      desc: 'Achieve a 5x speed combo gliding on the crystal frozen lake',
      target: 5,
      current: 0,
      rewardCoins: 200,
      rewardSparkles: 60,
      rewardShards: 1,
      completed: false,
      claimed: false,
      category: 'daily',
    },
    {
      id: 'm3',
      title: 'Cozy Builder',
      desc: 'Construct a new building or house in your village',
      target: 1,
      current: 0,
      rewardCoins: 300,
      rewardSparkles: 80,
      rewardShards: 1,
      completed: false,
      claimed: false,
      category: 'village',
    },
    {
      id: 'm4',
      title: 'Creator Spotlight',
      desc: 'Record a video clip or take a photo in Vlogging Mode',
      target: 1,
      current: 0,
      rewardCoins: 150,
      rewardSparkles: 50,
      rewardShards: 1,
      completed: false,
      claimed: false,
      category: 'creator',
    },
  ]);

  // Check and upgrade village tier
  const evaluateVillageTier = useCallback((newCount: number, newPop: number) => {
    setVillage((v) => {
      let tier = 1;
      let tierName = 'Snowdrift Hamlet';

      if (newCount >= 8 || newPop >= 40) {
        tier = 4;
        tierName = 'Frost Metropolis';
      } else if (newCount >= 5 || newPop >= 25) {
        tier = 3;
        tierName = 'Aurora Haven';
      } else if (newCount >= 2 || newPop >= 15) {
        tier = 2;
        tierName = 'Frostwood Township';
      }

      if (tier > v.tier) {
        sound.playFanfare();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
        showToast(`🎉 Village Leveled Up to Tier ${tier}: ${tierName}!`);
      }

      return {
        ...v,
        tier,
        tierName,
        population: newPop,
        buildingsCount: newCount,
      };
    });
  }, [showToast]);

  // Engine Callbacks
  const engineCallbacks = useRef({
    onCollectResource: (type: 'snow' | 'berry' | 'lumber' | 'crystal', amount: number) => {
      setResources((r) => {
        if (type === 'snow') {
          // Progress mission
          setMissions((prev) =>
            prev.map((m) =>
              m.id === 'm1'
                ? {
                    ...m,
                    current: Math.min(m.target, m.current + amount),
                    completed: m.current + amount >= m.target,
                  }
                : m
            )
          );
          return { ...r, frostSparkles: r.frostSparkles + amount };
        }
        if (type === 'berry') return { ...r, coins: r.coins + amount * 3 };
        if (type === 'lumber') return { ...r, pineLumber: r.pineLumber + amount };
        return { ...r, starShards: r.starShards + 1 };
      });
      showToast(`+${amount} ${type === 'snow' ? 'Snowflakes ❄️' : type === 'berry' ? 'Frostberries 🫐' : type === 'lumber' ? 'Lumber 🪵' : 'Star Shard ⭐'}`);
    },
    onAltarLit: (idx: number) => {
      showToast(`✨ Ancient Frost Altar ${idx + 1} Ignited! The Aurora Grows Brighter!`);
      sound.playFanfare();
    },
    onSkateComboUpdate: (combo: number) => {
      setSkateCombo(combo);
      if (combo >= 5) {
        setMissions((prev) =>
          prev.map((m) =>
            m.id === 'm2'
              ? { ...m, current: Math.max(m.current, combo), completed: true }
              : m
          )
        );
      }
    },
    onRaceCheckpoint: (index: number, total: number) => {
      showToast(`Gate ${index}/${total} Cleared! 🚩`);
    },
    onRaceFinish: (timeSeconds: number) => {
      sound.playFanfare();
      confetti({ particleCount: 70, spread: 60 });
      showToast(`🏆 Race Completed in ${timeSeconds.toFixed(1)}s! +250 Coins!`);
      setResources((r) => ({ ...r, coins: r.coins + 250, frostSparkles: r.frostSparkles + 80 }));
    },
    onCompanionMessage: (companionName: string, text: string) => {
      showToast(`${companionName}: "${text}"`);
    },
    onRecordingComplete: (data: VideoRecordData) => {
      setIsRecording(false);
      setRecordedVideo(data);
      // Progress creator mission
      setMissions((prev) =>
        prev.map((m) => (m.id === 'm4' ? { ...m, current: 1, completed: true } : m))
      );
    },
  });

  // Initialize Three.js Engine once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new FrostverseEngine(
      canvasMountRef.current,
      characterConfig,
      engineCallbacks.current
    );
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Update character configuration in engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateCharacterConfig(characterConfig);
    }
  }, [characterConfig]);

  // Periodic village income from shops and houses
  useEffect(() => {
    const incomeTimer = setInterval(() => {
      if (screen === 'PLAYING') {
        const income = 15 + village.buildingsCount * 8;
        setResources((r) => ({ ...r, coins: r.coins + income }));
      }
    }, 20000); // every 20s
    return () => clearInterval(incomeTimer);
  }, [screen, village.buildingsCount]);

  // Keyboard controls listener
  useEffect(() => {
    const keysPressed: { [key: string]: boolean } = {};

    const updateFromKeys = () => {
      let x = 0;
      let y = 0;
      if (keysPressed['KeyW'] || keysPressed['ArrowUp']) y += 1;
      if (keysPressed['KeyS'] || keysPressed['ArrowDown']) y -= 1;
      if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) x -= 1;
      if (keysPressed['KeyD'] || keysPressed['ArrowRight']) x += 1;

      if (engineRef.current) {
        engineRef.current.setInputVector(x, y);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      keysPressed[e.code] = true;
      updateFromKeys();

      if (e.code === 'Space') {
        e.preventDefault();
        if (screen === 'TITLE') {
          setScreen('PLAYING');
          sound.startAmbientMusic();
          sound.playFanfare();
        } else {
          engineRef.current?.jump();
        }
      } else if (e.code === 'KeyB') {
        setIsBuildOpen((b) => !b);
      } else if (e.code === 'KeyV') {
        setIsVlogOpen((v) => !v);
        if (!isVlogOpen) engineRef.current?.setViewMode('VLOG');
        else engineRef.current?.setViewMode('ISOMETRIC');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete keysPressed[e.code];
      updateFromKeys();
    };

    const handleBlur = () => {
      for (const k in keysPressed) delete keysPressed[k];
      updateFromKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [screen, isVlogOpen]);

  // Joystick Input Handler
  const handleJoystickMove = (x: number, y: number) => {
    engineRef.current?.setInputVector(x, y);
  };

  // Jump Action
  const handleJump = () => {
    engineRef.current?.jump();
  };

  // Snowball Action
  const handleThrowSnowball = () => {
    engineRef.current?.throwSnowball();
  };

  // Building Confirmation
  const handleConfirmPlace = () => {
    if (!engineRef.current || !activeGhostId) return;

    const catalogItem = BUILDING_CATALOG.find((c) => c.id === activeGhostId);
    if (!catalogItem) return;

    // Deduct resources
    setResources((r) => ({
      ...r,
      coins: r.coins - catalogItem.costCoins,
      frostSparkles: r.frostSparkles - catalogItem.costSparkles,
      pineLumber: r.pineLumber - catalogItem.costLumber,
      glacialStone: r.glacialStone - catalogItem.costStone,
    }));

    const placed = engineRef.current.placeCurrentGhost();
    if (placed) {
      engineRef.current.setGhostBuilding(null);
      setActiveGhostId(null);

      const nextCount = village.buildingsCount + 1;
      const nextPop = village.population + catalogItem.populationBonus;
      evaluateVillageTier(nextCount, nextPop);

      // Progress building mission
      setMissions((prev) =>
        prev.map((m) => (m.id === 'm3' ? { ...m, current: 1, completed: true } : m))
      );

      showToast(`Built ${catalogItem.name}! 🏡`);
    } else {
      showToast('⚠️ Cannot build on the central ice lake! Pick snowy ground.');
    }
  };

  // Toggle Camera View Mode
  const handleToggleViewMode = () => {
    const modes: GameViewMode[] = ['ISOMETRIC', 'FOLLOW', 'DRONE', 'CINEMATIC_ORBIT'];
    const nextIdx = (modes.indexOf(viewMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setViewMode(nextMode);
    engineRef.current?.setViewMode(nextMode);
  };

  // Toggle Weather Preset
  const handleToggleWeather = () => {
    const weathers: WeatherMode[] = ['SNOW_FALL', 'AURORA_NIGHT', 'CLEAR_DAWN'];
    const nextIdx = (weathers.indexOf(weatherMode) + 1) % weathers.length;
    const nextWeather = weathers[nextIdx];
    setWeatherMode(nextWeather);
    engineRef.current?.setWeatherMode(nextWeather);
    showToast(`Weather set to: ${nextWeather.replace('_', ' ')} ❄️`);
  };

  // Creator Snapshot Capture
  const handleTakeSnapshot = () => {
    if (!engineRef.current) return;
    const dataUrl = engineRef.current.takeSnapshot();
    setSnapshotPreview(dataUrl);
    showToast('📸 Snapshot captured!');
    // Progress creator mission
    setMissions((prev) =>
      prev.map((m) => (m.id === 'm4' ? { ...m, current: 1, completed: true } : m))
    );
  };

  // Toggle Video Recording
  const handleToggleRecord = () => {
    if (!engineRef.current) return;
    if (isRecording) {
      engineRef.current.stopRecording();
      setIsRecording(false);
    } else {
      const started = engineRef.current.startRecording();
      if (started) {
        setIsRecording(true);
        showToast('🔴 Recording started! Walk around and show off your village!');
      } else {
        showToast('⚠️ Video recording not supported on this browser.');
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#070b16]">
      {/* Isolated Three.js WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 touch-none" />

      {/* Title Screen vs In-Game HUD */}
      {screen === 'TITLE' ? (
        <TitleScreen onStartGame={() => setScreen('PLAYING')} />
      ) : (
        <>
          {/* Main Low-Occlusion HUD Overlay */}
          {!isVlogOpen && (
            <HUD
              resources={resources}
              village={village}
              viewMode={viewMode}
              weatherMode={weatherMode}
              skateCombo={skateCombo}
              onJoystickMove={handleJoystickMove}
              onJump={handleJump}
              onThrowSnowball={handleThrowSnowball}
              onOpenBuild={() => setIsBuildOpen(true)}
              onOpenMiniGames={() => setIsMiniGamesOpen(true)}
              onOpenQuests={() => setIsQuestsOpen(true)}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
              onOpenCreatorStudio={() => {
                setIsVlogOpen(true);
                setViewMode('VLOG');
                engineRef.current?.setViewMode('VLOG');
              }}
              onToggleWeather={handleToggleWeather}
              onToggleViewMode={handleToggleViewMode}
            />
          )}

          {/* Vlogging / Creator Camera Mode HUD */}
          {isVlogOpen && (
            <VlogOverlay
              viewMode={viewMode}
              onViewModeChange={(mode) => {
                setViewMode(mode);
                engineRef.current?.setViewMode(mode);
              }}
              isRecording={isRecording}
              onToggleRecord={handleToggleRecord}
              onTakeSnapshot={handleTakeSnapshot}
              onCloseVlog={() => {
                setIsVlogOpen(false);
                setViewMode('ISOMETRIC');
                engineRef.current?.setViewMode('ISOMETRIC');
              }}
            />
          )}
        </>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 frost-card-glow px-4 py-2 rounded-full text-xs font-bold text-sky-100 shadow-2xl flex items-center space-x-2 animate-float pointer-events-none">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Snapshot Preview Modal */}
      {snapshotPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 pointer-events-auto">
          <div className="frost-card p-4 rounded-2xl max-w-md w-full flex flex-col items-center">
            <h3 className="font-bold text-sky-200 text-sm mb-3">Snapshot Captured!</h3>
            <img
              src={snapshotPreview}
              alt="Frostverse Snapshot"
              className="w-full rounded-xl border border-sky-400/40 shadow-lg"
            />
            <div className="flex space-x-2 mt-4 w-full">
              <a
                href={snapshotPreview}
                download={`frostverse-snapshot-${Date.now()}.png`}
                className="flex-1 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs text-center hover:bg-sky-500 shadow"
              >
                Download PNG
              </a>
              <button
                onClick={() => setSnapshotPreview(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Recorded Preview Modal */}
      {recordedVideo && (
        <RecordingModal
          data={recordedVideo}
          onClose={() => setRecordedVideo(null)}
        />
      )}

      {/* Village Build Menu Modal */}
      {isBuildOpen && (
        <BuildMenu
          resources={resources}
          village={village}
          activeGhostId={activeGhostId}
          onSelectGhost={(catalogId) => {
            setActiveGhostId(catalogId);
            engineRef.current?.setGhostBuilding(catalogId);
          }}
          onRotateGhost={() => engineRef.current?.rotateGhostBuilding()}
          onConfirmPlace={handleConfirmPlace}
          onClose={() => setIsBuildOpen(false)}
        />
      )}

      {/* Mini-Games & Puzzles Modal */}
      {isMiniGamesOpen && (
        <MiniGamesModal
          onClose={() => setIsMiniGamesOpen(false)}
          onReward={(coins, sparkles, shards) => {
            setResources((r) => ({
              ...r,
              coins: r.coins + coins,
              frostSparkles: r.frostSparkles + sparkles,
              starShards: r.starShards + shards,
            }));
            showToast(`🎉 Reward Claimed: +${coins} 🪙, +${sparkles} ❄️!`);
          }}
          onStartSlalom3D={() => {
            engineRef.current?.startSlalomRace();
            showToast('🏁 Slalom Race started! Glide through the glowing green ice gates!');
          }}
        />
      )}

      {/* Missions & Seasonal Event Modal */}
      {isQuestsOpen && (
        <MissionsModal
          missions={missions}
          onClaimMission={(id) => {
            const m = missions.find((item) => item.id === id);
            if (m && !m.claimed) {
              setResources((r) => ({
                ...r,
                coins: r.coins + m.rewardCoins,
                frostSparkles: r.frostSparkles + m.rewardSparkles,
                starShards: r.starShards + m.rewardShards,
              }));
              setMissions((prev) =>
                prev.map((item) => (item.id === id ? { ...item, claimed: true } : item))
              );
              showToast(`🎁 Quest Claimed: +${m.rewardCoins} Coins, +${m.rewardSparkles} Sparkles!`);
            }
          }}
          onClose={() => setIsQuestsOpen(false)}
        />
      )}

      {/* Character Customizer Wardrobe Modal */}
      {isCustomizerOpen && (
        <CustomizerModal
          config={characterConfig}
          onChange={(newConf) => setCharacterConfig(newConf)}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}

      {/* Multiplayer & Friends Modal */}
      {isMultiplayerOpen && (
        <MultiplayerModal
          onClose={() => setIsMultiplayerOpen(false)}
          onSendChatMessage={(msg) => {
            showToast(`Chat sent: "${msg}"`);
          }}
          onTriggerEmote={(emote) => {
            showToast(`You performed: ${emote}!`);
          }}
          onVisitFriendVillage={(friendName) => {
            showToast(`Traveling to ${friendName}'s Winter Sanctuary... 🏔️`);
            sound.playFanfare();
          }}
        />
      )}
    </div>
  );
}
