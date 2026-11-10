/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Sparkles, Check, X } from 'lucide-react';
import { CharacterConfig } from '../game/types';
import { sound } from '../game/audio';

interface CustomizerModalProps {
  config: CharacterConfig;
  onChange: (newConfig: CharacterConfig) => void;
  onClose: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const PARKA_COLORS = [
    { label: 'Glacier Blue', value: '#2563eb' },
    { label: 'Crimson Berry', value: '#dc2626' },
    { label: 'Forest Pine', value: '#15803d' },
    { label: 'Aurora Violet', value: '#7c3aed' },
    { label: 'Polar White', value: '#f8fafc' },
    { label: 'Midnight Black', value: '#1e293b' },
  ];

  const BEANIE_COLORS = [
    { label: 'Festive Red', value: '#ef4444' },
    { label: 'Sun Gold', value: '#f59e0b' },
    { label: 'Mint Frost', value: '#10b981' },
    { label: 'Ocean Cyan', value: '#06b6d4' },
    { label: 'Bubblegum', value: '#ec4899' },
  ];

  const SCARF_COLORS = [
    { label: 'Warm Mustard', value: '#fbbf24' },
    { label: 'Candy Cane', value: '#f43f5e' },
    { label: 'Emerald Knit', value: '#10b981' },
    { label: 'Royal Blue', value: '#3b82f6' },
  ];

  const PETS = [
    { id: 'penguin', name: 'Frosty Penguin', icon: '🐧' },
    { id: 'fox', name: 'Arctic Fox', icon: '🦊' },
    { id: 'owl', name: 'Snow Owl', icon: '🦉' },
    { id: 'none', name: 'No Pet', icon: '❌' },
  ];

  const TITLES = [
    'Frost Pioneer',
    'Aurora Master',
    'Winter Architect',
    'Ice Skating Ace',
    'Cozy Hearthkeeper',
  ];

  const update = (patch: Partial<CharacterConfig>) => {
    sound.playTap();
    onChange({ ...config, ...patch });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-auto bg-black/60">
      <div className="frost-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-sky-400/30 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/20 bg-sky-950/40">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-sky-300" />
            <h2 className="text-lg font-bold text-sky-100 font-cinzel">Character Wardrobe</h2>
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

        {/* Form sections */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Explorer Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Explorer Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => update({ name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
              maxLength={16}
            />
          </div>

          {/* Parka Colors */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Puffer Parka</label>
            <div className="flex flex-wrap gap-2">
              {PARKA_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => update({ parkaColor: c.value })}
                  style={{ backgroundColor: c.value }}
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                    config.parkaColor === c.value
                      ? 'border-white scale-110 shadow-lg ring-2 ring-sky-400'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                >
                  {config.parkaColor === c.value && (
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Beanie Colors */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Warm Beanie</label>
            <div className="flex flex-wrap gap-2">
              {BEANIE_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => update({ beanieColor: c.value })}
                  style={{ backgroundColor: c.value }}
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                    config.beanieColor === c.value
                      ? 'border-white scale-110 shadow-lg ring-2 ring-sky-400'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                >
                  {config.beanieColor === c.value && (
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Knitted Scarf */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Knitted Scarf</label>
            <div className="flex flex-wrap gap-2">
              {SCARF_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => update({ scarfColor: c.value })}
                  style={{ backgroundColor: c.value }}
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                    config.scarfColor === c.value
                      ? 'border-white scale-110 shadow-lg ring-2 ring-sky-400'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                >
                  {config.scarfColor === c.value && (
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pet Companion */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Pet Companion</label>
            <div className="grid grid-cols-2 gap-2">
              {PETS.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => update({ pet: pet.id as any })}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 text-xs transition-all ${
                    config.pet === pet.id
                      ? 'bg-sky-600/40 border-sky-400 text-white font-bold'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xl">{pet.icon}</span>
                  <span>{pet.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title Badge */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Title Badge</label>
            <select
              value={config.titleBadge}
              onChange={(e) => update({ titleBadge: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
            >
              {TITLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sky-500/20 bg-slate-950/40">
          <button
            onClick={() => {
              sound.playFanfare();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg hover:from-cyan-400"
          >
            Apply Wardrobe Look
          </button>
        </div>
      </div>
    </div>
  );
};
