/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Hammer,
  Sparkles,
  Users,
  Video,
  User,
  Volume2,
  VolumeX,
  Compass,
  Trophy,
  ChevronDown,
  ChevronUp,
  CloudSnow,
  Sun,
  Moon,
  Camera,
  Play,
  RotateCw,
} from 'lucide-react';
import { TouchJoystick } from './TouchJoystick';
import {
  PlayerResources,
  VillageStatus,
  GameViewMode,
  WeatherMode,
} from '../game/types';
import { sound } from '../game/audio';

interface HUDProps {
  resources: PlayerResources;
  village: VillageStatus;
  viewMode: GameViewMode;
  weatherMode: WeatherMode;
  skateCombo: number;
  onJoystickMove: (x: number, y: number) => void;
  onJump: () => void;
  onThrowSnowball: () => void;
  onOpenBuild: () => void;
  onOpenMiniGames: () => void;
  onOpenQuests: () => void;
  onOpenCustomizer: () => void;
  onOpenMultiplayer: () => void;
  onOpenCreatorStudio: () => void;
  onToggleWeather: () => void;
  onToggleViewMode: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  resources,
  village,
  viewMode,
  weatherMode,
  skateCombo,
  onJoystickMove,
  onJump,
  onThrowSnowball,
  onOpenBuild,
  onOpenMiniGames,
  onOpenQuests,
  onOpenCustomizer,
  onOpenMultiplayer,
  onOpenCreatorStudio,
  onToggleWeather,
  onToggleViewMode,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) {
      sound.startAmbientMusic();
      sound.playTap();
    }
  };

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* ==========================================
          TOP STATUS PERIMETER BAR
          ========================================== */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        {/* Left: Village Tier & Prestige */}
        <div className="frost-card px-3.5 py-2 rounded-2xl border border-sky-400/30 flex items-center space-x-3 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-md text-sm">
            T{village.tier}
          </div>
          <div>
            <div className="text-xs font-bold text-sky-100 flex items-center space-x-1.5">
              <span>{village.tierName}</span>
              <span className="text-[10px] text-amber-300 font-mono-numbers">
                👥 {village.population}
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-mono-numbers flex items-center space-x-2">
              <span className="text-pink-300">💖 {village.happiness}%</span>
              <span>•</span>
              <span className="text-emerald-300">Plots: {village.buildingsCount}</span>
            </div>
          </div>
        </div>

        {/* Center: Skate Combo Banner (active only when combo > 0) */}
        {skateCombo > 1 && (
          <div className="frost-card-glow px-4 py-1.5 rounded-full flex items-center space-x-2 text-cyan-200 text-xs font-bold animate-bounce shadow-xl">
            <span>⛸️ Ice Combo</span>
            <span className="text-amber-300 font-mono-numbers text-sm">x{skateCombo}!</span>
            <span className="text-[10px] text-cyan-300">+{(skateCombo * 10)}% Speed</span>
          </div>
        )}

        {/* Right: Currency & Quick Actions */}
        <div className="flex items-center space-x-2">
          {/* Resources Counter Chip */}
          <div className="frost-card px-3 py-1.5 rounded-2xl border border-sky-400/30 flex items-center space-x-2.5 text-xs font-mono-numbers shadow-lg">
            <span className="text-amber-300 flex items-center space-x-1">
              <span>🪙</span>
              <span>{resources.coins}</span>
            </span>
            <span className="text-sky-300 flex items-center space-x-1">
              <span>❄️</span>
              <span>{resources.frostSparkles}</span>
            </span>
            <span className="text-emerald-300 hidden sm:flex items-center space-x-1">
              <span>🪵</span>
              <span>{resources.pineLumber}</span>
            </span>
            <span className="text-purple-300 hidden sm:flex items-center space-x-1">
              <span>⭐</span>
              <span>{resources.starShards}</span>
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl frost-card text-slate-300 hover:text-white border border-sky-400/20 active:scale-95"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </div>

      {/* ==========================================
          MOBILE TOUCH CONTROLS
          ========================================== */}
      <div className="flex justify-between items-end w-full mb-16 pointer-events-none px-2">
        {/* Virtual Joystick (Bottom Left) */}
        <div className="pointer-events-auto">
          <TouchJoystick onMove={onJoystickMove} size={110} />
        </div>

        {/* Action Buttons (Bottom Right) */}
        <div className="pointer-events-auto flex flex-col items-end space-y-2.5">
          {/* Throw Snowball Button */}
          <button
            onClick={onThrowSnowball}
            className="w-12 h-12 rounded-full frost-card text-sky-200 border border-sky-400/40 flex items-center justify-center text-lg shadow-lg active:scale-90 hover:bg-slate-800"
            title="Throw Snowball"
          >
            ❄️
          </button>

          {/* Jump / Glide Action Button */}
          <button
            onClick={onJump}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xl active:scale-90 border-2 border-cyan-300/60"
            title="Jump / Glide"
          >
            JUMP
          </button>
        </div>
      </div>

      {/* ==========================================
          COLLAPSIBLE UNIFIED BOTTOM CONTROL DOCK
          (Preserves >85% Unobstructed Playfield)
          ========================================== */}
      <div className="pointer-events-auto fixed bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => {
            sound.playTap();
            setIsDockCollapsed((prev) => !prev);
          }}
          className="px-3 py-1 rounded-t-xl bg-slate-900/90 text-slate-300 hover:text-white border-t border-x border-sky-400/30 text-[10px] font-semibold flex items-center space-x-1 shadow-md"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
              <span>Hide Controls (H)</span>
            </>
          )}
        </button>

        {/* Sleek Dock */}
        {!isDockCollapsed && (
          <div className="frost-card px-3 py-2 rounded-2xl flex items-center space-x-1.5 sm:space-x-2 border border-sky-400/40 shadow-2xl max-w-[95vw] overflow-x-auto">
            {/* 1. Build & Village Dev */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenBuild();
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow active:scale-95 shrink-0"
            >
              <Hammer className="w-4 h-4 text-amber-300" />
              <span>Build</span>
            </button>

            {/* 2. Puzzles & Mini-Games */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenMiniGames();
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 active:scale-95 shrink-0"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Games</span>
            </button>

            {/* 3. Daily Quests & Season */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenQuests();
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Quests</span>
            </button>

            {/* 4. Wardrobe Customizer */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenCustomizer();
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 active:scale-95 shrink-0"
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>Wardrobe</span>
            </button>

            {/* 5. Multiplayer & Friends */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenMultiplayer();
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 active:scale-95 shrink-0"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Friends</span>
            </button>

            {/* 6. Creator Studio & Vlog Cam */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenCreatorStudio();
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow active:scale-95 shrink-0"
            >
              <Video className="w-4 h-4" />
              <span>Vlog / Record</span>
            </button>

            {/* 7. Camera Angle Switcher */}
            <button
              onClick={onToggleViewMode}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-slate-700 shrink-0"
              title={`Camera: ${viewMode}`}
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* 8. Weather Preset Switcher */}
            <button
              onClick={onToggleWeather}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 shrink-0"
              title={`Weather: ${weatherMode}`}
            >
              <CloudSnow className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
