/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Compass, Users, Video } from 'lucide-react';
import { sound } from '../game/audio';

interface TitleScreenProps {
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between items-center p-6 text-center select-none bg-gradient-to-b from-transparent via-[#061022]/40 to-[#040814]/90 pointer-events-auto">
      {/* Top Tagline */}
      <div className="pt-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full frost-card-glow text-xs font-semibold text-cyan-200">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Winter Realm & Cozy City Builder</span>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center max-w-xl">
        <div className="relative mb-3">
          {/* Bespoke inline SVG icy title lockup */}
          <svg
            viewBox="0 0 600 120"
            className="w-full max-w-md sm:max-w-lg filter drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]"
          >
            <defs>
              <linearGradient id="iceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#7dd3fc" />
                <stop offset="80%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="75"
              textAnchor="middle"
              className="font-cinzel"
              fill="url(#iceGrad)"
              style={{
                fontSize: '64px',
                fontWeight: 900,
                letterSpacing: '6px',
              }}
            >
              FROSTVERSE
            </text>
            <text
              x="88%"
              y="55"
              className="font-cinzel"
              fill="url(#goldGrad)"
              style={{
                fontSize: '32px',
                fontWeight: 800,
                letterSpacing: '2px',
              }}
            >
              3D
            </text>
          </svg>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
          Explore magical snowy forests, build a cozy winter village, slide across frozen lakes, and share your adventures with creator studio tools.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px] text-sky-200">
          <span className="px-2.5 py-1 rounded-full frost-card flex items-center space-x-1 border border-sky-400/20">
            <Compass className="w-3 h-3 text-cyan-300" />
            <span>Open-World</span>
          </span>
          <span className="px-2.5 py-1 rounded-full frost-card flex items-center space-x-1 border border-sky-400/20">
            <Users className="w-3 h-3 text-emerald-300" />
            <span>Multiplayer</span>
          </span>
          <span className="px-2.5 py-1 rounded-full frost-card flex items-center space-x-1 border border-sky-400/20">
            <Video className="w-3 h-3 text-rose-300" />
            <span>Vlog Studio</span>
          </span>
        </div>

        {/* Primary Start CTA */}
        <button
          onClick={() => {
            sound.startAmbientMusic();
            sound.playFanfare();
            onStartGame();
          }}
          className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(14,165,233,0.5)] active:scale-95 transition-all flex items-center space-x-2 border border-cyan-200/40"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>ENTER FROST REALM</span>
        </button>
      </div>

      {/* Control Hint Line */}
      <div className="text-[11px] text-slate-400 font-mono-numbers">
        WASD / Touch Joystick Move • Space Jump / Glide • H Hide HUD • Creator Cam Built-in
      </div>
    </div>
  );
};
