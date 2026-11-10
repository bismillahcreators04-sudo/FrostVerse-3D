/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface TouchJoystickProps {
  onMove: (x: number, y: number) => void;
  size?: number;
}

export const TouchJoystick: React.FC<TouchJoystickProps> = ({ onMove, size = 110 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = size / 2;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (touchIdRef.current !== null) return;

      const touch = e.changedTouches[0];
      touchIdRef.current = touch.identifier;
      setActive(true);
      updatePosition(touch.clientX, touch.clientY);
    },
    [size]
  );

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) {
      setKnobPos({ x: 0, y: 0 });
      onMove(0, 0);
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);

    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    setKnobPos({ x: nx, y: ny });

    // Normalize -1 to 1 (y inverted for standard 3D game coordinates)
    const normX = nx / maxRadius;
    const normY = -ny / maxRadius;
    onMove(normX, normY);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updatePosition(touch.clientX, touch.clientY);
        break;
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  }, [onMove]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ width: size, height: size }}
      className="relative rounded-full bg-slate-950/60 border-2 border-sky-400/30 flex items-center justify-center select-none touch-none shadow-xl pointer-events-auto"
    >
      {/* Center resting dot */}
      <div className="w-2 h-2 rounded-full bg-sky-400/40" />

      {/* Dynamic knob */}
      <div
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: active ? 'none' : 'transform 0.15s ease-out',
        }}
        className={`absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg border ${
          active
            ? 'bg-sky-500/80 border-sky-300 ring-2 ring-sky-400/50'
            : 'bg-slate-800/80 border-sky-400/40'
        }`}
      >
        <div className="w-4 h-4 rounded-full bg-sky-200/90" />
      </div>
    </div>
  );
};
