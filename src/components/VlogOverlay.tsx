/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Video, Camera, Sparkles, SwitchCamera, Eye, MessageSquare, Download, Share2, X } from 'lucide-react';
import { GameViewMode, VideoRecordData } from '../game/types';
import { sound } from '../game/audio';

interface VlogOverlayProps {
  viewMode: GameViewMode;
  onViewModeChange: (mode: GameViewMode) => void;
  isRecording: boolean;
  onToggleRecord: () => void;
  onTakeSnapshot: () => void;
  onCloseVlog: () => void;
}

export const VlogOverlay: React.FC<VlogOverlayProps> = ({
  viewMode,
  onViewModeChange,
  isRecording,
  onToggleRecord,
  onTakeSnapshot,
  onCloseVlog,
}) => {
  const [recSeconds, setRecSeconds] = useState(0);
  const [filterMode, setFilterMode] = useState<'normal' | 'aurora' | 'golden' | 'vintage'>('normal');

  // Simulated live comments stream
  const [comments, setComments] = useState<{ id: number; user: string; text: string }[]>([
    { id: 1, user: 'Lumi', text: 'That snow cabin looks so cozy! 😍' },
    { id: 2, user: 'NordicFox', text: 'Try doing a spin on the frozen lake!' },
    { id: 3, user: 'AuroraQueen', text: 'The northern lights tonight are unreal ✨' },
  ]);

  useEffect(() => {
    let timer: number;
    if (isRecording) {
      setRecSeconds(0);
      timer = window.setInterval(() => {
        setRecSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Periodic incoming live chat comments
  useEffect(() => {
    const chatSamples = [
      { user: 'FrostExplorer', text: 'Whoa that camera angle is cinematic!' },
      { user: 'SnowPaws', text: 'Your village looks amazing! 🏰' },
      { user: 'WinterVibe', text: 'Take a photo near the roaring bonfire! 🔥' },
      { user: 'IceAce', text: 'Hit that 10x ice skating combo!' },
      { user: 'ChillyPenguin', text: 'So satisfying to watch ❄️' },
    ];

    const chatInterval = setInterval(() => {
      const sample = chatSamples[Math.floor(Math.random() * chatSamples.length)];
      setComments((prev) => [...prev.slice(-3), { id: Date.now(), ...sample }]);
    }, 4500);

    return () => clearInterval(chatInterval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Camera Metadata Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-2">
          {/* Recording Badge */}
          {isRecording ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-white rec-pulse" />
              <span>REC {formatTime(recSeconds)}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-300 text-xs font-semibold border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>STANDBY</span>
            </div>
          )}

          <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono-numbers text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800">
            <span>4K 60FPS</span>
            <span>•</span>
            <span>ISO 160</span>
            <span>•</span>
            <span>F/1.8</span>
          </div>
        </div>

        {/* Live Audience Count & Close */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 text-xs font-bold border border-rose-500/30">
            <Eye className="w-3.5 h-3.5" />
            <span className="font-mono-numbers">3.4k watching</span>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onCloseVlog();
            }}
            className="p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewfinder crosshairs corners */}
      <div className="absolute inset-8 border border-white/10 pointer-events-none rounded-2xl flex flex-col justify-between p-2">
        <div className="flex justify-between">
          <div className="w-5 h-5 border-t-2 border-l-2 border-white/60" />
          <div className="w-5 h-5 border-t-2 border-r-2 border-white/60" />
        </div>
        <div className="flex justify-between">
          <div className="w-5 h-5 border-b-2 border-l-2 border-white/60" />
          <div className="w-5 h-5 border-b-2 border-r-2 border-white/60" />
        </div>
      </div>

      {/* Floating Live Comments (Left side) */}
      <div className="flex flex-col space-y-1.5 max-w-xs pointer-events-none mb-16 pl-2">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-black/45 backdrop-blur-none px-3 py-1.5 rounded-xl text-xs border border-white/10 text-white shadow"
          >
            <span className="font-bold text-sky-300 mr-1.5">{c.user}:</span>
            <span>{c.text}</span>
          </div>
        ))}
      </div>

      {/* Bottom Creator Control Bar */}
      <div className="pointer-events-auto flex items-center justify-between bg-slate-950/85 px-4 py-2.5 rounded-2xl border border-sky-400/30 max-w-lg mx-auto w-full shadow-2xl">
        {/* Camera Angle Toggle */}
        <button
          onClick={() => {
            sound.playTap();
            onViewModeChange(viewMode === 'VLOG' ? 'FOLLOW' : 'VLOG');
          }}
          className="p-2.5 rounded-xl bg-slate-800 text-sky-300 hover:text-white flex flex-col items-center text-[10px]"
        >
          <SwitchCamera className="w-5 h-5" />
          <span className="mt-0.5">{viewMode === 'VLOG' ? 'Selfie' : 'World'}</span>
        </button>

        {/* Shutter Snapshot Button */}
        <button
          onClick={onTakeSnapshot}
          className="p-3 rounded-full bg-slate-800 text-amber-300 border border-amber-400/30 hover:bg-slate-700 active:scale-90 shadow-md"
          title="Take Photo"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Master Video Record Button */}
        <button
          onClick={onToggleRecord}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
            isRecording
              ? 'bg-red-600 ring-4 ring-red-400/50'
              : 'bg-white hover:bg-slate-100 ring-4 ring-white/30'
          }`}
        >
          {isRecording ? (
            <div className="w-5 h-5 rounded-md bg-white" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-600" />
          )}
        </button>

        {/* Filter Presets */}
        <button
          onClick={() => {
            sound.playTap();
            const filters: ('normal' | 'aurora' | 'golden' | 'vintage')[] = ['normal', 'aurora', 'golden', 'vintage'];
            const next = filters[(filters.indexOf(filterMode) + 1) % filters.length];
            setFilterMode(next);
          }}
          className="p-2.5 rounded-xl bg-slate-800 text-emerald-300 hover:text-white flex flex-col items-center text-[10px]"
        >
          <Sparkles className="w-5 h-5" />
          <span className="mt-0.5 capitalize">{filterMode}</span>
        </button>
      </div>
    </div>
  );
};
