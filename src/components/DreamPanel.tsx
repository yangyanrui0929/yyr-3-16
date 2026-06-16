import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { DREAM_WISH_INFO, BUILDING_STATS, DreamWish } from '../utils/constants';
import { getDreamProgress, getTotalRewardPreview } from '../utils/dreamManager';
import {
  Sparkles,
  Check,
  X,
  Clock,
  Lightbulb,
  Gift,
  AlertTriangle,
  Ban,
} from 'lucide-react';

export const DreamPanel: React.FC = () => {
  const {
    dreamState,
    dayTime,
    openDreamModal,
    storedPower,
    maxStorage,
  } = useGameStore();

  const isNight = dayTime >= 50;
  const progress = getDreamProgress(dreamState.wishes);
  const totalReward = getTotalRewardPreview(dreamState.wishes);
  const storagePercent = maxStorage > 0 ? (storedPower / maxStorage) * 100 : 0;

  const hasActiveDreams = dreamState.active && dreamState.wishes.length > 0;
  const hasCompletedDreams =
    !dreamState.active && dreamState.wishes.length > 0 && dreamState.totalWishes > 0;
  const hasLastNightRewards =
    dreamState.lastNightSpecialRewards && dreamState.lastNightSpecialRewards.length > 0;

  if (!hasActiveDreams && !hasCompletedDreams) {
    return (
      <DreamHintPanel
        isNight={isNight}
        inspirationPoints={dreamState.inspirationPoints}
        lastNightRewards={dreamState.lastNightSpecialRewards || []}
        lastNightInspiration={dreamState.lastNightInspiration || 0}
      />
    );
  }

  return (
    <div
      className={`rounded-2xl p-4 shadow-xl border backdrop-blur-md ${
        isNight
          ? 'bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-indigo-500/50 text-white'
          : 'bg-white/90 border-white/50 text-gray-700'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isNight ? 'bg-indigo-500/30' : 'bg-purple-100'
            }`}
          >
            <Sparkles
              className={`w-4 h-4 ${
                isNight ? 'text-indigo-300' : 'text-purple-500'
              } ${dreamState.active ? 'animate-pulse' : ''}`}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold">
              {dreamState.active ? '🌙 梦境进行中' : '✨ 昨夜梦境'}
            </h3>
            {hasCompletedDreams && (
              <p className={`text-xs ${isNight ? 'text-indigo-300' : 'text-gray-500'}`}>
                {dreamState.fulfilledWishes}/{dreamState.totalWishes} 愿望达成
              </p>
            )}
          </div>
        </div>
        <button
          onClick={openDreamModal}
          className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${
            isNight
              ? 'bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200'
              : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
          }`}
        >
          详情
        </button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className={isNight ? 'text-indigo-300' : 'text-gray-500'}>
            完成进度
          </span>
          <span className="font-bold">{Math.round(progress)}%</span>
        </div>
        <div
          className={`w-full h-2 rounded-full overflow-hidden ${
            isNight ? 'bg-indigo-950' : 'bg-gray-200'
          }`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background:
                progress >= 80
                  ? 'linear-gradient(90deg, #34D399, #10B981)'
                  : progress >= 50
                  ? 'linear-gradient(90deg, #818CF8, #6366F1)'
                  : 'linear-gradient(90deg, #FBBF24, #F59E0B)',
            }}
          />
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {dreamState.wishes.slice(0, 3).map((wish) => (
          <WishMiniItem key={wish.id} wish={wish} isNight={isNight} />
        ))}
        {dreamState.wishes.length > 3 && (
          <p className={`text-xs text-center ${isNight ? 'text-indigo-400' : 'text-gray-500'}`}>
            还有 {dreamState.wishes.length - 3} 个愿望...
          </p>
        )}
      </div>

      {hasLastNightRewards && !dreamState.active && (
        <div
          className={`mb-3 p-2 rounded-xl space-y-1 ${
            isNight ? 'bg-yellow-500/15 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className="flex items-center gap-1">
            <Gift className={`w-3.5 h-3.5 ${isNight ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className={`text-xs font-bold ${isNight ? 'text-yellow-300' : 'text-yellow-700'}`}>
              昨夜奖励
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dreamState.lastNightSpecialRewards.map((r, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isNight ? 'bg-yellow-500/30 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                }`}
                title={r.name}
              >
                {r.emoji} {r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className={`flex items-center justify-between pt-3 border-t ${
          isNight ? 'border-indigo-700/50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Lightbulb className={`w-4 h-4 ${isNight ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <span className="text-xs">灵感</span>
          <span className="text-sm font-bold">{dreamState.inspirationPoints}</span>
          {dreamState.lastNightInspiration > 0 && !dreamState.active && (
            <span className="text-[10px] text-green-500">+{dreamState.lastNightInspiration}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Gift className={`w-4 h-4 ${isNight ? 'text-pink-400' : 'text-pink-500'}`} />
          <span className="text-xs">奖励</span>
          <span className="text-sm font-bold text-pink-500">+{totalReward}</span>
        </div>
      </div>

      {dreamState.active && (
        <div className="mt-3">
          <BatteryHalfStatus
            storagePercent={storagePercent}
            isNight={isNight}
            wishes={dreamState.wishes}
          />
        </div>
      )}
    </div>
  );
};

function WishMiniItem({ wish, isNight }: { wish: DreamWish; isNight: boolean }) {
  const info = DREAM_WISH_INFO[wish.type];
  const buildingStats = BUILDING_STATS[wish.targetType];

  const getStatusIcon = () => {
    if (wish.invalidTarget)
      return <Ban className="w-3.5 h-3.5 text-orange-500" />;
    if (wish.status === 'fulfilled')
      return <Check className="w-3.5 h-3.5 text-green-500" />;
    if (wish.status === 'failed')
      return <X className="w-3.5 h-3.5 text-red-500" />;
    if (wish.currentlyMet)
      return <Check className="w-3.5 h-3.5 text-green-500" />;
    return (
      <Clock
        className={`w-3.5 h-3.5 ${
          isNight ? 'text-indigo-400' : 'text-gray-400'
        } animate-pulse`}
      />
    );
  };

  const getBgClass = () => {
    if (wish.invalidTarget) {
      return isNight
        ? 'bg-orange-500/20 border border-orange-500/30'
        : 'bg-orange-50 border border-orange-200';
    }
    if (wish.status === 'fulfilled') {
      return isNight
        ? 'bg-green-500/20 border border-green-500/30'
        : 'bg-green-50 border border-green-200';
    }
    if (wish.status === 'failed') {
      return isNight
        ? 'bg-red-500/20 border border-red-500/30'
        : 'bg-red-50 border border-red-200';
    }
    if (wish.currentlyMet) {
      return isNight
        ? 'bg-green-500/20 border border-green-500/30'
        : 'bg-green-50 border border-green-200';
    }
    return isNight
      ? 'bg-indigo-800/30 border border-indigo-600/30'
      : 'bg-gray-50 border border-gray-100';
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded-xl ${getBgClass()}`}>
      <span className="text-lg">{wish.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold truncate">{info.name}</span>
          <span className="text-xs opacity-70">{buildingStats.emoji}</span>
          {wish.specialReward && (
            <span className="text-[10px]" title={`特殊奖励: ${wish.specialReward.name}`}>
              {wish.specialReward.emoji}
            </span>
          )}
        </div>
        <p className={`text-[10px] truncate ${isNight ? 'text-indigo-300' : 'text-gray-500'}`}>
          {wish.invalidTarget ? (
            <span className="text-orange-500">⚠️ 目标建筑被替换</span>
          ) : (
            <>
              ({wish.targetCell.x},{wish.targetCell.y})
              {wish.currentlyMet && (
                <span className="text-green-500 ml-1">✓ 满足中</span>
              )}
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span
          className={`text-[10px] font-bold ${
            isNight ? 'text-yellow-400' : 'text-yellow-600'
          }`}
        >
          +{wish.inspirationReward}
        </span>
        {getStatusIcon()}
      </div>
    </div>
  );
}

function BatteryHalfStatus({
  storagePercent,
  isNight,
  wishes,
}: {
  storagePercent: number;
  isNight: boolean;
  wishes: DreamWish[];
}) {
  const hasHalfBatteryWish = wishes.some((w) => w.type === 'half_battery');
  if (!hasHalfBatteryWish) return null;

  const isInRange = storagePercent >= 40 && storagePercent <= 60;

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
        isInRange
          ? isNight
            ? 'bg-green-500/20'
            : 'bg-green-50'
          : isNight
          ? 'bg-yellow-500/20'
          : 'bg-yellow-50'
      }`}
    >
      <AlertTriangle
        className={`w-3.5 h-3.5 flex-shrink-0 ${
          isInRange
            ? 'text-green-500'
            : isNight
            ? 'text-yellow-400'
            : 'text-yellow-600'
        }`}
      />
      <div className="flex-1">
        <span className={isNight ? 'text-indigo-200' : 'text-gray-700'}>
          蓄电池状态: <b>{Math.round(storagePercent)}%</b>
        </span>
        <span
          className={`ml-1 ${
            isInRange
              ? 'text-green-500'
              : isNight
              ? 'text-yellow-400'
              : 'text-yellow-600'
          }`}
        >
          {isInRange
            ? '✓ 半满区间'
            : storagePercent < 40
            ? '需充电至40%'
            : '需放电至60%'}
        </span>
      </div>
    </div>
  );
}

function DreamHintPanel({
  isNight,
  inspirationPoints,
  lastNightRewards,
  lastNightInspiration,
}: {
  isNight: boolean;
  inspirationPoints: number;
  lastNightRewards: Array<{ name: string; emoji: string }>;
  lastNightInspiration: number;
}) {
  const hasRewards = lastNightRewards.length > 0;
  return (
    <div
      className={`rounded-2xl p-4 shadow-xl border backdrop-blur-md ${
        isNight
          ? 'bg-gradient-to-br from-indigo-900/80 to-slate-800/80 border-indigo-600/30 text-white'
          : 'bg-white/90 border-white/50 text-gray-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isNight ? 'bg-indigo-500/30' : 'bg-purple-100'
          }`}
        >
          <Sparkles
            className={`w-4 h-4 ${isNight ? 'text-indigo-300' : 'text-purple-500'}`}
          />
        </div>
        <div>
          <h3 className="text-sm font-bold">梦境供电模式</h3>
          <p className={`text-xs ${isNight ? 'text-indigo-300' : 'text-gray-500'}`}>
            满意度≥70%时夜间生成
          </p>
        </div>
      </div>

      {hasRewards && (
        <div
          className={`mb-3 p-2 rounded-xl space-y-1 ${
            isNight ? 'bg-yellow-500/15 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className="flex items-center gap-1">
            <Gift className={`w-3.5 h-3.5 ${isNight ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className={`text-xs font-bold ${isNight ? 'text-yellow-300' : 'text-yellow-700'}`}>
              昨夜奖励
              {lastNightInspiration > 0 && (
                <span className="ml-1 text-green-500">+{lastNightInspiration}灵感</span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lastNightRewards.map((r, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isNight
                    ? 'bg-yellow-500/30 text-yellow-200'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
                title={r.name}
              >
                {r.emoji} {r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={`space-y-2 text-xs ${isNight ? 'text-indigo-200' : 'text-gray-600'}`}>
        <div className="flex items-start gap-2">
          <span>💙</span>
          <p>蓝色安眠电流：住房整夜通电</p>
        </div>
        <div className="flex items-start gap-2">
          <span>🤫</span>
          <p>夜间断电静音：工坊保持断电</p>
        </div>
        <div className="flex items-start gap-2">
          <span>⚖️</span>
          <p>蓄电池半满：电量40%-60%</p>
        </div>
      </div>

      <div
        className={`mt-3 pt-3 border-t flex items-center justify-between ${
          isNight ? 'border-indigo-700/50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Lightbulb
            className={`w-4 h-4 ${isNight ? 'text-yellow-400' : 'text-yellow-500'}`}
          />
          <span className="text-xs">累计灵感</span>
        </div>
        <span className="text-sm font-bold">{inspirationPoints}</span>
      </div>
    </div>
  );
}
