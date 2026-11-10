/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Calendar, Sparkles, CheckCircle2, Gift, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Mission } from '../game/types';
import { sound } from '../game/audio';

interface MissionsModalProps {
  missions: Mission[];
  onClaimMission: (id: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  onClaimMission,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'seasonal'>('daily');
  const [claimedDays, setClaimedDays] = useState<number[]>([1, 2]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#34d399', '#fde047', '#f43f5e'],
    });
  };

  const handleClaimLoginStreak = (day: number) => {
    if (claimedDays.includes(day)) return;
    sound.playFanfare();
    triggerConfetti();
    setClaimedDays((prev) => [...prev, day]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-auto bg-black/60">
      <div className="frost-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-sky-400/30 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/20 bg-sky-950/40">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-sky-100 font-cinzel">Missions & Seasonal Event</h2>
              <div className="text-[11px] text-sky-300">Aurora Solstice Festival • Season 1</div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-900/80 p-1.5 border-b border-sky-500/20 gap-1 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('daily');
              sound.playTap();
            }}
            className={`flex-1 py-2 px-1 rounded-lg transition-all ${
              activeTab === 'daily' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily Quests
          </button>
          <button
            onClick={() => {
              setActiveTab('seasonal');
              sound.playTap();
            }}
            className={`flex-1 py-2 px-1 rounded-lg transition-all ${
              activeTab === 'seasonal' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aurora Solstice Festival
          </button>
        </div>

        {/* Tab 1: Daily Quests */}
        {activeTab === 'daily' && (
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
            {missions.map((m) => {
              const progressPct = Math.min(100, Math.round((m.current / m.target) * 100));

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                    m.claimed
                      ? 'bg-slate-900/40 border-slate-800 opacity-60'
                      : m.completed
                      ? 'bg-emerald-950/40 border-emerald-500/40'
                      : 'bg-slate-900/70 border-slate-700/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-xs text-sky-100">{m.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                    </div>
                    {/* Rewards pill */}
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono-numbers">
                      {m.rewardCoins > 0 && <span className="text-amber-300">🪙 {m.rewardCoins}</span>}
                      {m.rewardSparkles > 0 && <span className="text-sky-300">❄️ {m.rewardSparkles}</span>}
                      {m.rewardShards > 0 && <span className="text-purple-300">⭐ {m.rewardShards}</span>}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono-numbers">
                      <span>Progress</span>
                      <span>
                        {m.current} / {m.target} ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Claim Button */}
                  {m.completed && !m.claimed && (
                    <button
                      onClick={() => {
                        sound.playFanfare();
                        triggerConfetti();
                        onClaimMission(m.id);
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                    >
                      Claim Rewards!
                    </button>
                  )}
                  {m.claimed && (
                    <div className="mt-2 text-center text-[11px] text-emerald-400 font-bold flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Seasonal Event */}
        {activeTab === 'seasonal' && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            <div className="p-3 bg-gradient-to-r from-sky-950/80 to-purple-950/80 rounded-xl border border-sky-400/30 text-xs">
              <div className="font-bold text-sky-200 text-sm mb-1 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Winter Solstice 7-Day Festival</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Log in daily to claim rare winter building blueprints, exclusive aurora outfits, and legendary Star Shards!
              </p>
            </div>

            {/* 7-Day Streak Calendar */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[
                { day: 1, reward: '100 🪙', claimed: claimedDays.includes(1) },
                { day: 2, reward: '50 ❄️', claimed: claimedDays.includes(2) },
                { day: 3, reward: '20 🪵', claimed: claimedDays.includes(3) },
                { day: 4, reward: '1 ⭐', claimed: claimedDays.includes(4) },
                { day: 5, reward: '200 🪙', claimed: claimedDays.includes(5) },
                { day: 6, reward: '80 ❄️', claimed: claimedDays.includes(6) },
                { day: 7, reward: 'Ice Swan 🦢', claimed: claimedDays.includes(7) },
              ].map((item) => (
                <button
                  key={item.day}
                  onClick={() => handleClaimLoginStreak(item.day)}
                  disabled={item.claimed || item.day > claimedDays.length + 1}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center justify-between text-xs transition-all ${
                    item.claimed
                      ? 'bg-slate-900/40 border-slate-800 opacity-60'
                      : item.day === claimedDays.length + 1
                      ? 'bg-sky-600/30 border-sky-400 ring-2 ring-sky-400/50 hover:bg-sky-600/50'
                      : 'bg-slate-900/60 border-slate-700/60 opacity-70'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-bold">Day {item.day}</span>
                  <span className="my-1 text-sm font-bold text-amber-300">{item.reward}</span>
                  <span className="text-[9px] text-sky-300">
                    {item.claimed ? 'Claimed' : item.day === claimedDays.length + 1 ? 'Tap to Claim' : 'Locked'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
