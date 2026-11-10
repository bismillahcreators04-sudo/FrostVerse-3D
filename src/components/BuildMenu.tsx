/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home, Store, Trees, Shovel, Hammer, X, RotateCw, Check, AlertCircle } from 'lucide-react';
import { BuildingCatalogItem, PlayerResources, VillageStatus } from '../game/types';
import { sound } from '../game/audio';

export const BUILDING_CATALOG: BuildingCatalogItem[] = [
  {
    id: 'log_cabin',
    name: 'Cozy Log Cabin',
    category: 'house',
    description: 'A warm wooden cabin with smoking chimney and glowing amber windows.',
    costCoins: 80,
    costSparkles: 25,
    costLumber: 15,
    costStone: 5,
    populationBonus: 4,
    happinessBonus: 8,
    incomePerMinute: 12,
    dimensions: [3.6, 3.2],
    color: '#92400e',
    tierRequired: 1,
  },
  {
    id: 'bakery_cafe',
    name: 'Frost Bakery & Cafe',
    category: 'shop',
    description: 'Serves piping hot cocoa and fresh cinnamon buns to warm up chilly villagers.',
    costCoins: 160,
    costSparkles: 40,
    costLumber: 25,
    costStone: 15,
    populationBonus: 2,
    happinessBonus: 20,
    incomePerMinute: 35,
    dimensions: [4.0, 3.2],
    color: '#b45309',
    tierRequired: 1,
  },
  {
    id: 'town_hall',
    name: 'Frost City Hall',
    category: 'infrastructure',
    description: 'Grand civic hall with clock tower and radiant aurora spire. Increases village prestige.',
    costCoins: 450,
    costSparkles: 120,
    costLumber: 60,
    costStone: 80,
    populationBonus: 15,
    happinessBonus: 40,
    incomePerMinute: 90,
    dimensions: [5.4, 4.4],
    color: '#3b82f6',
    tierRequired: 2,
  },
  {
    id: 'greenhouse',
    name: 'Winter Greenhouse',
    category: 'farming',
    description: 'Glass-domed farm cultivating glowing frostberries and hearty arctic winter vegetables.',
    costCoins: 120,
    costSparkles: 30,
    costLumber: 20,
    costStone: 10,
    populationBonus: 3,
    happinessBonus: 15,
    incomePerMinute: 25,
    dimensions: [3.6, 2.8],
    color: '#059669',
    tierRequired: 1,
  },
  {
    id: 'snowman',
    name: 'Cheerful Snowman',
    category: 'decor',
    description: 'A smiling snowman with carrot nose and top hat. Spreads holiday cheer.',
    costCoins: 30,
    costSparkles: 15,
    costLumber: 2,
    costStone: 0,
    populationBonus: 0,
    happinessBonus: 6,
    incomePerMinute: 2,
    dimensions: [1.2, 1.2],
    color: '#38bdf8',
    tierRequired: 1,
  },
  {
    id: 'fire_pit',
    name: 'Cozy Fire Pit',
    category: 'decor',
    description: 'A roaring stone fire pit with wooden sitting logs to melt the winter chill.',
    costCoins: 60,
    costSparkles: 20,
    costLumber: 10,
    costStone: 12,
    populationBonus: 0,
    happinessBonus: 18,
    incomePerMinute: 5,
    dimensions: [2.5, 2.5],
    color: '#ea580c',
    tierRequired: 1,
  },
  {
    id: 'lantern_post',
    name: 'Aurora Lantern Post',
    category: 'infrastructure',
    description: 'Wrought-iron street lamp casting warm golden radiance along village snow paths.',
    costCoins: 25,
    costSparkles: 10,
    costLumber: 4,
    costStone: 2,
    populationBonus: 0,
    happinessBonus: 5,
    incomePerMinute: 1,
    dimensions: [1.0, 1.0],
    color: '#eab308',
    tierRequired: 1,
  },
  {
    id: 'stone_road',
    name: 'Cobblestone Path',
    category: 'infrastructure',
    description: 'Clear snow-free stone paving allowing faster villager travel.',
    costCoins: 15,
    costSparkles: 5,
    costLumber: 0,
    costStone: 5,
    populationBonus: 0,
    happinessBonus: 2,
    incomePerMinute: 0,
    dimensions: [2.4, 2.4],
    color: '#64748b',
    tierRequired: 1,
  },
];

interface BuildMenuProps {
  resources: PlayerResources;
  village: VillageStatus;
  activeGhostId: string | null;
  onSelectGhost: (catalogId: string | null) => void;
  onRotateGhost: () => void;
  onConfirmPlace: () => void;
  onClose: () => void;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  resources,
  village,
  activeGhostId,
  onSelectGhost,
  onRotateGhost,
  onConfirmPlace,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'house' | 'shop' | 'infrastructure' | 'farming' | 'decor'>('all');

  const filteredItems = BUILDING_CATALOG.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const canAfford = (item: BuildingCatalogItem) => {
    return (
      resources.coins >= item.costCoins &&
      resources.frostSparkles >= item.costSparkles &&
      resources.pineLumber >= item.costLumber &&
      resources.glacialStone >= item.costStone &&
      village.tier >= item.tierRequired
    );
  };

  return (
    <>
      {/* Placed ghost active action bar (at bottom when placing) */}
      {activeGhostId && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 frost-card px-4 py-2.5 rounded-2xl flex items-center space-x-3 shadow-2xl border border-cyan-400/50">
          <button
            onClick={() => {
              sound.playTap();
              onRotateGhost();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center space-x-1 hover:bg-slate-700 active:scale-95"
          >
            <RotateCw className="w-4 h-4 text-sky-400" />
            <span>Rotate (90°)</span>
          </button>
          <button
            onClick={() => {
              onConfirmPlace();
            }}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold flex items-center space-x-1 shadow-md hover:from-emerald-400 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Place Building</span>
          </button>
          <button
            onClick={() => {
              sound.playTap();
              onSelectGhost(null);
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Catalog Modal */}
      {!activeGhostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-auto bg-black/60">
          <div className="frost-card w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-sky-400/30 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/20 bg-sky-950/40">
              <div className="flex items-center space-x-2">
                <Hammer className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-lg font-bold text-sky-100 font-cinzel">Village Builder & City Dev</h2>
                  <div className="text-[11px] text-sky-300">
                    Tier {village.tier}: {village.tierName} • Pop: {village.population} • Happiness: {village.happiness}%
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex bg-slate-900/80 p-1.5 border-b border-sky-500/20 gap-1 overflow-x-auto text-xs font-medium">
              {[
                { id: 'all', label: 'All' },
                { id: 'house', label: 'Houses' },
                { id: 'shop', label: 'Shops' },
                { id: 'infrastructure', label: 'Civic' },
                { id: 'farming', label: 'Farming' },
                { id: 'decor', label: 'Decor' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    sound.playTap();
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Items List */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {filteredItems.map((item) => {
                const affordable = canAfford(item);
                const isLocked = village.tier < item.tierRequired;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      isLocked
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : affordable
                        ? 'bg-slate-900/70 border-sky-500/30 hover:border-sky-400/60'
                        : 'bg-slate-900/50 border-slate-700/50 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-sky-100">{item.name}</h4>
                        {isLocked && (
                          <span className="text-[10px] bg-red-900/60 text-red-200 px-1.5 py-0.5 rounded border border-red-500/30">
                            Tier {item.tierRequired}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Stat Bonuses */}
                      <div className="flex gap-2 text-[10px] mt-2 font-mono-numbers">
                        {item.populationBonus > 0 && (
                          <span className="text-cyan-300">👥 +{item.populationBonus}</span>
                        )}
                        {item.happinessBonus > 0 && (
                          <span className="text-pink-300">💖 +{item.happinessBonus}%</span>
                        )}
                        {item.incomePerMinute > 0 && (
                          <span className="text-amber-300">🪙 +{item.incomePerMinute}/m</span>
                        )}
                      </div>

                      {/* Cost breakdown */}
                      <div className="flex flex-wrap gap-2 text-[11px] mt-2.5 pt-2 border-t border-slate-800 font-mono-numbers">
                        <span className={resources.coins >= item.costCoins ? 'text-amber-300' : 'text-red-400'}>
                          🪙 {item.costCoins}
                        </span>
                        <span className={resources.frostSparkles >= item.costSparkles ? 'text-sky-300' : 'text-red-400'}>
                          ❄️ {item.costSparkles}
                        </span>
                        {item.costLumber > 0 && (
                          <span className={resources.pineLumber >= item.costLumber ? 'text-emerald-300' : 'text-red-400'}>
                            🪵 {item.costLumber}
                          </span>
                        )}
                        {item.costStone > 0 && (
                          <span className={resources.glacialStone >= item.costStone ? 'text-slate-300' : 'text-red-400'}>
                            🪨 {item.costStone}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={!affordable || isLocked}
                      onClick={() => {
                        sound.playTap();
                        onSelectGhost(item.id);
                        onClose();
                      }}
                      className={`mt-3 w-full py-2 rounded-lg text-xs font-bold transition-all ${
                        isLocked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : affordable
                          ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isLocked ? `Requires Village Tier ${item.tierRequired}` : affordable ? 'Build Hologram' : 'Need Resources'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
