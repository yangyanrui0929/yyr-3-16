import React from 'react';
import { GridCell, BUILDING_STATS, WIRE_CONNECTIONS, DreamWishType } from '../utils/constants';
import { useGameStore } from '../store/useGameStore';

interface BuildingProps {
  cell: GridCell;
}

export const Building: React.FC<BuildingProps> = ({ cell }) => {
  if (cell.type === 'empty') return null;

  if (cell.type === 'wire') {
    return <WireVisual rotation={cell.rotation} powered={cell.powered} faulty={cell.faulty} />;
  }

  const dreamState = useGameStore((state) => state.dreamState);
  const dayTime = useGameStore((state) => state.dayTime);
  const isNight = dayTime >= 50;

  const dreamInfo = dreamState.active
    ? dreamState.wishes.find(
        (w) => w.targetCell.x === cell.x && w.targetCell.y === cell.y
      )
    : null;

  const stats = BUILDING_STATS[cell.type];
  const isRotating = cell.type === 'windmill' && cell.powered && !cell.faulty;

  const getDreamGlow = () => {
    if (!dreamInfo || !isNight) return null;
    if (dreamInfo.invalidTarget) {
      return {
        color: 'rgba(249, 115, 22, 0.6)',
        label: '⚠️',
        isActive: false,
      };
    }
    const isMet = dreamInfo.currentlyMet || dreamInfo.fulfilled;
    const glowMap: Record<DreamWishType, { color: string; label: string }> = {
      blue_current: {
        color: isMet
          ? 'rgba(59, 130, 246, 0.8)'
          : 'rgba(59, 130, 246, 0.4)',
        label: '💙',
      },
      silent_night: {
        color: isMet
          ? 'rgba(139, 92, 246, 0.8)'
          : 'rgba(139, 92, 246, 0.4)',
        label: '🤫',
      },
      half_battery: {
        color: isMet
          ? 'rgba(16, 185, 129, 0.8)'
          : 'rgba(16, 185, 129, 0.4)',
        label: '⚖️',
      },
    };
    return { ...glowMap[dreamInfo.type], isActive: isMet };
  };

  const dreamGlow = getDreamGlow();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {dreamGlow && isNight && (
        <>
          <div
            className="absolute inset-0 rounded-xl animate-pulse"
            style={{
              boxShadow: `0 0 20px ${dreamGlow.color}, inset 0 0 15px ${dreamGlow.color}`,
              border: `2px solid ${dreamGlow.color}`,
            }}
          />
          <div
            className={`absolute -top-2 -left-1 text-sm ${
              dreamGlow.isActive ? 'animate-bounce' : 'animate-pulse'
            }`}
          >
            {dreamGlow.label}
          </div>
        </>
      )}
      <div
        className={`text-3xl transition-all duration-200 relative z-10 ${
          cell.powered && !cell.faulty ? 'scale-100 drop-shadow-lg' : 'opacity-60 scale-95'
        } ${isRotating ? 'animate-[spin_3s_linear_infinite]' : ''}`}
        style={{
          filter: cell.faulty
            ? 'hue-rotate(-50deg) saturate(2)'
            : dreamInfo?.invalidTarget
            ? 'grayscale(70%) opacity-70'
            : dreamInfo?.type === 'blue_current' && cell.powered
            ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.8)) brightness(1.1)'
            : dreamInfo?.type === 'silent_night' && !cell.powered
            ? 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))'
            : cell.powered
            ? 'none'
            : 'grayscale(50%)',
        }}
      >
        {stats.emoji}
      </div>
      {cell.faulty && (
        <div className="absolute -top-1 -right-1 text-sm animate-pulse z-20">⚠️</div>
      )}
      {dreamInfo?.currentlyMet && isNight && !dreamInfo.invalidTarget && (
        <div className="absolute -bottom-1 -right-1 text-sm z-20 animate-bounce">✨</div>
      )}
      {cell.type === 'battery' && !cell.faulty && (
        <div className="absolute bottom-0 left-1 right-1 h-1.5 bg-gray-300 rounded-full overflow-hidden z-10">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(100, cell.powered ? 80 : 30)}%` }}
          />
        </div>
      )}
    </div>
  );
};

interface WireVisualProps {
  rotation: number;
  powered: boolean;
  faulty: boolean;
}

const WireVisual: React.FC<WireVisualProps> = ({ rotation, powered, faulty }) => {
  const connections = WIRE_CONNECTIONS[rotation % 6] || [true, false, true, false];
  const [top, right, bottom, left] = connections;

  const baseColor = faulty
    ? '#EF4444'
    : powered
    ? '#3B82F6'
    : '#9CA3AF';
  const glowColor = faulty
    ? 'rgba(239, 68, 68, 0.6)'
    : powered
    ? 'rgba(59, 130, 246, 0.5)'
    : 'transparent';

  const lineStyle: React.CSSProperties = {
    backgroundColor: baseColor,
    boxShadow: powered || faulty ? `0 0 8px ${glowColor}` : 'none',
    transition: 'all 0.3s ease',
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {top && (
        <div
          className="absolute left-1/2 top-0 w-1.5 h-1/2 -translate-x-1/2 rounded-full"
          style={lineStyle}
        />
      )}
      {right && (
        <div
          className="absolute right-0 top-1/2 w-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={lineStyle}
        />
      )}
      {bottom && (
        <div
          className="absolute left-1/2 bottom-0 w-1.5 h-1/2 -translate-x-1/2 rounded-full"
          style={lineStyle}
        />
      )}
      {left && (
        <div
          className="absolute left-0 top-1/2 w-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={lineStyle}
        />
      )}
      <div
        className={`absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          powered && !faulty ? 'animate-pulse' : ''
        }`}
        style={{
          backgroundColor: baseColor,
          boxShadow: powered || faulty ? `0 0 10px ${glowColor}` : 'none',
        }}
      />
      {faulty && (
        <div className="absolute -top-1 -right-1 text-xs animate-pulse">⚠️</div>
      )}
    </div>
  );
};
