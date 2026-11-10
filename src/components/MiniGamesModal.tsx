/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Flag, Compass, RotateCcw, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { sound } from '../game/audio';

interface MiniGamesModalProps {
  onClose: () => void;
  onReward: (coins: number, sparkles: number, shards: number) => void;
  onStartSlalom3D: () => void;
}

export const MiniGamesModal: React.FC<MiniGamesModalProps> = ({
  onClose,
  onReward,
  onStartSlalom3D,
}) => {
  const [activeTab, setActiveTab] = useState<'ICE_SLIDE' | 'MEMORY' | 'RACE' | 'TREASURE'>('ICE_SLIDE');

  // ==========================================
  // 1. ICE SLIDING PUZZLE
  // ==========================================
  // 7x7 Grid: 0 = slick ice, 1 = rock obstacle, 2 = goal star
  const ICE_PUZZLES = [
    {
      level: 1,
      start: [0, 0],
      goal: [5, 5],
      rocks: [[1, 0], [4, 1], [2, 3], [5, 2], [3, 5], [1, 4]],
    },
    {
      level: 2,
      start: [1, 1],
      goal: [6, 2],
      rocks: [[3, 1], [1, 5], [5, 3], [4, 6], [2, 4], [6, 5]],
    },
  ];

  const [puzzleLevel, setPuzzleLevel] = useState(0);
  const currentPuzzle = ICE_PUZZLES[puzzleLevel];
  const [runnerPos, setRunnerPos] = useState<[number, number]>(currentPuzzle.start as [number, number]);
  const [movesCount, setMovesCount] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  const resetPuzzle = () => {
    setRunnerPos(ICE_PUZZLES[puzzleLevel].start as [number, number]);
    setMovesCount(0);
    setPuzzleSolved(false);
    sound.playTap();
  };

  const isRock = (r: number, c: number) => {
    return currentPuzzle.rocks.some(([rockR, rockC]) => rockR === r && rockC === c);
  };

  const slideRunner = (dr: number, dc: number) => {
    if (puzzleSolved) return;

    let [r, c] = runnerPos;
    let moved = false;

    // Slide until hitting boundary or rock
    while (true) {
      const nextR = r + dr;
      const nextC = c + dc;
      if (nextR < 0 || nextR >= 7 || nextC < 0 || nextC >= 7) break;
      if (isRock(nextR, nextC)) break;

      r = nextR;
      c = nextC;
      moved = true;
    }

    if (moved) {
      setRunnerPos([r, c]);
      setMovesCount((m) => m + 1);
      sound.playPuzzleMove();

      if (r === currentPuzzle.goal[0] && c === currentPuzzle.goal[1]) {
        setPuzzleSolved(true);
        sound.playPuzzleWin();
        onReward(150, 40, 1);
      }
    }
  };

  // ==========================================
  // 2. FROST GLYPH MEMORY MATCH
  // ==========================================
  const GLYPHS = ['❄️', '⭐', '🌲', '🦊', '🏔️', '🔔'];
  const [memoryCards, setMemoryCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMatches, setMemoryMatches] = useState(0);

  const initMemoryGame = () => {
    const deck = [...GLYPHS, ...GLYPHS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        flipped: false,
        matched: false,
      }));
    setMemoryCards(deck);
    setFlippedIndices([]);
    setMemoryMatches(0);
    sound.playTap();
  };

  useEffect(() => {
    initMemoryGame();
  }, []);

  const handleCardClick = (idx: number) => {
    if (flippedIndices.length === 2 || memoryCards[idx].flipped || memoryCards[idx].matched) return;

    sound.playTap();
    const newCards = [...memoryCards];
    newCards[idx].flipped = true;
    const newFlipped = [...flippedIndices, idx];
    setMemoryCards(newCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (memoryCards[first].symbol === memoryCards[second].symbol) {
        setTimeout(() => {
          newCards[first].matched = true;
          newCards[second].matched = true;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);
          setMemoryMatches((m) => {
            const next = m + 1;
            if (next === GLYPHS.length) {
              sound.playPuzzleWin();
              onReward(200, 60, 2);
            } else {
              sound.playChime(1.2);
            }
            return next;
          });
        }, 350);
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);
        }, 750);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-auto bg-black/60">
      <div className="frost-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-sky-400/30 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/20 bg-sky-950/40">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-sky-300" />
            <h2 className="text-lg font-bold text-sky-100 font-cinzel">Winter Challenges & Puzzles</h2>
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

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/80 p-1.5 border-b border-sky-500/20 gap-1 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('ICE_SLIDE');
              sound.playTap();
            }}
            className={`flex-1 py-2 px-1 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'ICE_SLIDE'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Ice Slide</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('MEMORY');
              sound.playTap();
            }}
            className={`flex-1 py-2 px-1 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'MEMORY'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Glyph Match</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('RACE');
              sound.playTap();
            }}
            className={`flex-1 py-2 px-1 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'RACE'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>3D Slalom</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('TREASURE');
              sound.playTap();
            }}
            className={`flex-1 py-2 px-1 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'TREASURE'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Treasure</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* TAB 1: ICE SLIDING PUZZLE */}
          {activeTab === 'ICE_SLIDE' && (
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3">
                <span className="text-xs text-sky-300 font-semibold">
                  Level {puzzleLevel + 1} • Moves: {movesCount}
                </span>
                <button
                  onClick={resetPuzzle}
                  className="text-xs flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>

              {/* 7x7 Grid */}
              <div className="grid grid-cols-7 gap-1 p-2 bg-sky-950/70 border border-sky-400/40 rounded-xl shadow-inner max-w-xs w-full aspect-square">
                {Array.from({ length: 49 }).map((_, i) => {
                  const r = Math.floor(i / 7);
                  const c = i % 7;
                  const isPlayer = runnerPos[0] === r && runnerPos[1] === c;
                  const isGoal = currentPuzzle.goal[0] === r && currentPuzzle.goal[1] === c;
                  const rock = isRock(r, c);

                  return (
                    <div
                      key={i}
                      className={`relative flex items-center justify-center rounded transition-all duration-150 ${
                        rock
                          ? 'bg-slate-700/80 border border-slate-600'
                          : isGoal
                          ? 'bg-amber-400/30 border border-amber-400/60'
                          : 'bg-sky-900/30 border border-sky-700/20'
                      }`}
                    >
                      {rock && <span className="text-sm">🪨</span>}
                      {isGoal && !isPlayer && <span className="text-base animate-bounce">⭐</span>}
                      {isPlayer && (
                        <div className="w-6 h-6 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] flex items-center justify-center text-xs">
                          ⛷️
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Directional Pad */}
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <button
                  onClick={() => slideRunner(-1, 0)}
                  className="w-12 h-11 bg-slate-800 border border-sky-500/40 rounded-lg flex items-center justify-center text-sky-200 active:scale-95"
                >
                  ▲
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => slideRunner(0, -1)}
                    className="w-12 h-11 bg-slate-800 border border-sky-500/40 rounded-lg flex items-center justify-center text-sky-200 active:scale-95"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => slideRunner(1, 0)}
                    className="w-12 h-11 bg-slate-800 border border-sky-500/40 rounded-lg flex items-center justify-center text-sky-200 active:scale-95"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => slideRunner(0, 1)}
                    className="w-12 h-11 bg-slate-800 border border-sky-500/40 rounded-lg flex items-center justify-center text-sky-200 active:scale-95"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {puzzleSolved && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 flex flex-col items-center text-center">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Puzzle Solved! +150 Coins, +40 Sparkles</span>
                  </div>
                  {puzzleLevel < ICE_PUZZLES.length - 1 && (
                    <button
                      onClick={() => {
                        setPuzzleLevel((l) => l + 1);
                        setRunnerPos(ICE_PUZZLES[puzzleLevel + 1].start as [number, number]);
                        setMovesCount(0);
                        setPuzzleSolved(false);
                        sound.playTap();
                      }}
                      className="mt-2 text-xs px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                    >
                      Next Level
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GLYPH MEMORY MATCH */}
          {activeTab === 'MEMORY' && (
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3">
                <span className="text-xs text-sky-300 font-semibold">
                  Matches: {memoryMatches} / {GLYPHS.length}
                </span>
                <button
                  onClick={initMemoryGame}
                  className="text-xs flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reshuffle</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2.5 max-w-xs w-full">
                {memoryCards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`aspect-square rounded-xl border flex items-center justify-center text-2xl transition-all duration-200 ${
                      card.matched
                        ? 'bg-emerald-950/60 border-emerald-500/60 opacity-60'
                        : card.flipped
                        ? 'bg-sky-800 border-sky-400 shadow-md'
                        : 'bg-slate-800 border-slate-700 hover:border-sky-500/40'
                    }`}
                  >
                    {card.flipped || card.matched ? card.symbol : '❄️'}
                  </button>
                ))}
              </div>

              {memoryMatches === GLYPHS.length && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 flex flex-col items-center text-center">
                  <span className="text-emerald-300 font-bold text-sm">
                    ✨ Perfect Memory! Claimed +200 Coins, +60 Sparkles!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 3D SLALOM RACE */}
          {activeTab === 'RACE' && (
            <div className="flex flex-col items-center text-center py-2">
              <Trophy className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
              <h3 className="text-base font-bold text-slate-100 font-cinzel">Crystal Lake Slalom Cup</h3>
              <p className="text-xs text-slate-300 max-w-xs mt-1 mb-4">
                Slide at full speed through all 5 glowing ice arches around the frozen lake as fast as you can!
              </p>

              <div className="w-full bg-slate-900/60 rounded-xl p-3 border border-sky-500/20 mb-4 text-xs space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Time:</span>
                  <span className="text-amber-300 font-bold">Under 25s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reward:</span>
                  <span className="text-sky-300 font-bold">+250 Coins, +80 Sparkles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-emerald-300 font-bold">Central Frozen Lake</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  onClose();
                  onStartSlalom3D();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center space-x-2"
              >
                <Flag className="w-4 h-4" />
                <span>Start 3D Slalom Race Now</span>
              </button>
            </div>
          )}

          {/* TAB 4: TREASURE HUNT */}
          {activeTab === 'TREASURE' && (
            <div className="flex flex-col items-center text-center py-2">
              <Compass className="w-12 h-12 text-sky-400 mb-2" />
              <h3 className="text-base font-bold text-slate-100 font-cinzel">Frost Treasure Expeditions</h3>
              <p className="text-xs text-slate-300 max-w-xs mt-1 mb-4">
                Buried relic chests are hidden beneath the snowbanks! Use your explorer shovel near ancient landmarks to unearth them.
              </p>

              <div className="w-full space-y-2 mb-4">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-sky-500/20 text-left text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sky-200">1. Northern Altar Stash</div>
                    <div className="text-[11px] text-slate-400">Behind the Ancient North Altar</div>
                  </div>
                  <span className="text-amber-400 font-bold">+100 🪙</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-sky-500/20 text-left text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sky-200">2. Pine Grove Cache</div>
                    <div className="text-[11px] text-slate-400">Deep inside the eastern pine forest</div>
                  </div>
                  <span className="text-amber-400 font-bold">+150 🪙</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-sky-500/20 text-left text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sky-200">3. Sunken Lake Relic</div>
                    <div className="text-[11px] text-slate-400">Near the central frozen lake rim</div>
                  </div>
                  <span className="text-amber-400 font-bold">+200 🪙</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playHarvest();
                  onReward(250, 80, 2);
                  sound.playFanfare();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-lg hover:from-amber-400"
              >
                Scan & Dig Nearby Snowbank
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
