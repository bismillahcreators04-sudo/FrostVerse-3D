/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Share2, Youtube, Video, Check, Copy, X } from 'lucide-react';
import { VideoRecordData } from '../game/types';
import { sound } from '../game/audio';

interface RecordingModalProps {
  data: VideoRecordData;
  onClose: () => void;
}

export const RecordingModal: React.FC<RecordingModalProps> = ({ data, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<'youtube' | 'tiktok' | 'reels'>('youtube');

  const shareTitle = 'Cozy Winter Adventures in FROSTVERSE 3D! ❄️✨';
  const shareTags = '#Frostverse3D #Gaming #WinterAesthetic #CozyGames #ThreeJS #MobileGaming';
  const shareDesc = `${shareTitle}\n\nExploring my magical snowy village and gliding across crystal frozen lakes in FROSTVERSE 3D!\n\n${shareTags}`;

  const handleDownload = () => {
    sound.playTap();
    const a = document.createElement('a');
    a.href = data.blobUrl;
    a.download = `frostverse-gameplay-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyShare = () => {
    sound.playTap();
    navigator.clipboard.writeText(shareDesc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const durationSec = Math.round(data.durationMs / 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-auto bg-black/75">
      <div className="frost-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-sky-400/40 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-sky-500/20 bg-sky-950/40">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-sky-100 font-cinzel">Gameplay Video Recorded!</h2>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Preview */}
        <div className="p-4 flex flex-col items-center">
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 shadow-inner relative flex items-center justify-center">
            <video
              src={data.blobUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          <div className="w-full flex justify-between items-center text-xs text-slate-400 mt-2 font-mono-numbers">
            <span>Duration: {durationSec}s</span>
            <span>Recorded at: {data.createdAt}</span>
          </div>

          {/* Action Download Buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Save to Phone / PC</span>
            </button>

            <button
              onClick={handleCopyShare}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-sky-400/30 text-sky-200 font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Details!' : 'Copy Share Text'}</span>
            </button>
          </div>

          {/* Social Media Share Templates */}
          <div className="w-full mt-4 p-3 bg-slate-900/70 rounded-xl border border-sky-500/20 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300 flex items-center space-x-1">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube Shorts & Social Media</span>
              </span>
              <div className="flex space-x-1 text-[10px]">
                <button
                  onClick={() => setSharePlatform('youtube')}
                  className={`px-2 py-0.5 rounded ${sharePlatform === 'youtube' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Shorts
                </button>
                <button
                  onClick={() => setSharePlatform('tiktok')}
                  className={`px-2 py-0.5 rounded ${sharePlatform === 'tiktok' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  TikTok
                </button>
                <button
                  onClick={() => setSharePlatform('reels')}
                  className={`px-2 py-0.5 rounded ${sharePlatform === 'reels' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Reels
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-2 rounded-lg text-slate-300 text-[11px] font-mono leading-relaxed select-all">
              {shareDesc}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
