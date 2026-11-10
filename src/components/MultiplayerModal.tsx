/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Globe, Key, Send, Smile, MapPin, Sparkles, X, Check } from 'lucide-react';
import { CompanionPlayer } from '../game/types';
import { sound } from '../game/audio';

interface MultiplayerModalProps {
  onClose: () => void;
  onSendChatMessage: (message: string) => void;
  onTriggerEmote: (emote: string) => void;
  onVisitFriendVillage: (friendName: string) => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  onClose,
  onSendChatMessage,
  onTriggerEmote,
  onVisitFriendVillage,
}) => {
  const [activeTab, setActiveTab] = useState<'lobby' | 'friends' | 'chat'>('friends');
  const [roomCode, setRoomCode] = useState('FROST-9281');
  const [inputCode, setInputCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{ user: string; text: string; time: string }[]>([
    { user: 'Lumi', text: 'Welcome to North Star server! Let’s build near the fire pit!', time: '14:20' },
    { user: 'Frosty_Dan', text: 'I just placed the Hot Cocoa shop! Free mugs for everyone ☕', time: '14:22' },
    { user: 'NordicFox', text: 'Who wants to race on the frozen lake? ⛸️', time: '14:24' },
  ]);

  const FRIENDS = [
    { name: 'Lumi', status: 'Online • Aurora Haven', level: 14, icon: '🐧' },
    { name: 'NordicFox', status: 'Online • Frostwood Township', level: 12, icon: '🦊' },
    { name: 'Frosty_Dan', status: 'Online • Snowdrift Hamlet', level: 9, icon: '🦉' },
    { name: 'AuroraQueen', status: 'Online • Frost Metropolis', level: 25, icon: '👑' },
  ];

  const EMOTES = [
    { id: 'wave', label: 'Wave', icon: '👋' },
    { id: 'warm', label: 'Warm Hands', icon: '🔥' },
    { id: 'dance', label: 'Ice Spin', icon: '⛸️' },
    { id: 'snowball', label: 'Toss Snow', icon: '❄️' },
    { id: 'cheer', label: 'Cheer', icon: '🎉' },
    { id: 'heart', label: 'Love', icon: '💖' },
  ];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sound.playTap();
    const newMsg = {
      user: 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatLog((prev) => [...prev, newMsg]);
    onSendChatMessage(chatInput.trim());
    setChatInput('');

    // Simulated companion response
    setTimeout(() => {
      const companionResponses = [
        'Haha awesome! ❄️',
        'Looks super cozy!',
        'Meet you by the central frozen lake!',
        'Adding more lanterns to the village path right now!',
      ];
      const botMsg = {
        user: 'Lumi',
        text: companionResponses[Math.floor(Math.random() * companionResponses.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatLog((prev) => [...prev, botMsg]);
      sound.playChime(1.1);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-auto bg-black/60">
      <div className="frost-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-sky-400/30 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/20 bg-sky-950/40">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-300" />
            <div>
              <h2 className="text-lg font-bold text-sky-100 font-cinzel">Multiplayer & Friends</h2>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Connected: North Star Haven (18 Players)</span>
              </div>
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

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/80 p-1.5 border-b border-sky-500/20 gap-1 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('friends');
              sound.playTap();
            }}
            className={`flex-1 py-2 px-1 rounded-lg transition-all ${
              activeTab === 'friends' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Friends & Visits
          </button>
          <button
            onClick={() => {
              setActiveTab('lobby');
              sound.playTap();
            }}
            className={`flex-1 py-2 px-1 rounded-lg transition-all ${
              activeTab === 'lobby' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Private Rooms
          </button>
          <button
            onClick={() => {
              setActiveTab('chat');
              sound.playTap();
            }}
            className={`flex-1 py-2 px-1 rounded-lg transition-all ${
              activeTab === 'chat' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Village Chat
          </button>
        </div>

        {/* Tab 1: Friends & Visits */}
        {activeTab === 'friends' && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Quick Emote Bar */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">Synchronized Emote Wheel</div>
              <div className="grid grid-cols-6 gap-2">
                {EMOTES.map((em) => (
                  <button
                    key={em.id}
                    onClick={() => {
                      sound.playChime(1.2);
                      onTriggerEmote(em.label);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-center flex flex-col items-center active:scale-95 transition-all"
                  >
                    <span className="text-xl">{em.icon}</span>
                    <span className="text-[10px] text-slate-300 mt-1">{em.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Friends list */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">Online Friends ({FRIENDS.length})</div>
              <div className="space-y-2">
                {FRIENDS.map((f) => (
                  <div
                    key={f.name}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{f.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-sky-100 flex items-center space-x-1.5">
                          <span>{f.name}</span>
                          <span className="text-[10px] text-amber-400 font-mono-numbers">Lv.{f.level}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{f.status}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        sound.playFanfare();
                        onVisitFriendVillage(f.name);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600/80 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Visit Village</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Private Rooms */}
        {activeTab === 'lobby' && (
          <div className="p-4 space-y-4 flex-1">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-sky-500/20 text-xs">
              <div className="font-bold text-sky-200 mb-1">Your Private Room Code</div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex-1 px-3 py-2 bg-slate-950 font-mono font-bold text-amber-300 rounded-lg text-sm border border-slate-700 select-all">
                  {roomCode}
                </div>
                <button
                  onClick={() => {
                    sound.playTap();
                    navigator.clipboard.writeText(roomCode);
                  }}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold border border-slate-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-sky-500/20 text-xs">
              <div className="font-bold text-sky-200 mb-2">Join Friend's Room</div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter Room Code (e.g. FROST-1234)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white uppercase focus:outline-none focus:border-sky-400"
                />
                <button
                  onClick={() => {
                    if (inputCode.trim()) {
                      sound.playFanfare();
                      onVisitFriendVillage('Friend');
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Village Live Chat */}
        {activeTab === 'chat' && (
          <div className="flex flex-col flex-1 p-3 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
              {chatLog.map((msg, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center space-x-1.5">
                    <span className={`font-bold ${msg.user === 'You' ? 'text-cyan-400' : 'text-amber-300'}`}>
                      {msg.user}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <div className="text-slate-200 mt-0.5">{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex space-x-2 mt-3">
              <input
                type="text"
                placeholder="Say something to the village..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center hover:bg-sky-500"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
