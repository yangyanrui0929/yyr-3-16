import React from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  DREAM_WISH_INFO,
  BUILDING_STATS,
  DreamWish,
  HALF_BATTERY_LOW,
  HALF_BATTERY_HIGH,
} from '../utils/constants';
import { getDreamProgress, getTotalRewardPreview } from '../utils/dreamManager';
import {
  X,
  Sparkles,
  Check,
  XCircle,
  Clock,
  Lightbulb,
  Gift,
  Home,
  Factory,
  Battery,
  Zap,
  Moon,
  Sun,
  Award,
  AlertTriangle,
} from 'lucide-react';

export const DreamModal: React.FC = () => {
  const {
    showDreamModal,
    closeDreamModal,
    dreamState,
    dayTime,
    storedPower,
    maxStorage,
    satisfaction,
    grid,
    poweredCells,
  } = useGameStore();

  if (!showDreamModal) return null;

  const isNight = dayTime >= 50;
  const progress = getDreamProgress(dreamState.wishes);
  const totalReward = getTotalRewardPreview(dreamState.wishes);
  const storagePercent = maxStorage > 0 ? (storedPower / maxStorage) * 100 : 0;

  const getWishesByType = () => {
    const grouped: Record<string, DreamWish[]> = {
      blue_current: [],
      silent_night: [],
      half_battery: [],
    };
    dreamState.wishes.forEach((w) => {
      grouped[w.type].push(w);
    });
    return grouped;
  };

  const wishesByType = getWishesByType();
  const fulfilledWishes = dreamState.wishes.filter((w) => w.fulfilled).length;
  const failedWishes = dreamState.wishes.filter((w) => w.status === 'failed').length;
  const pendingWishes = dreamState.wishes.length - fulfilledWishes - failedWishes;

  const getGlobalConditionStatus = () => {
    const halfBatteryWishes = wishesByType.half_battery;
    if (halfBatteryWishes.length === 0) return null;
    const isInRange = storagePercent >= HALF_BATTERY_LOW * 100 && storagePercent <= HALF_BATTERY_HIGH * 100;
    return {
      active: true,
      isInRange,
      percent: storagePercent,
      count: halfBatteryWishes.length,
    };
  };

  const halfBatteryStatus = getGlobalConditionStatus();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closeDreamModal}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-[scaleIn_0.3s_ease-out] ${
          isNight
            ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border border-indigo-500/40'
            : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`p-6 relative ${
            isNight
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          }`}
        >
          <button
            onClick={closeDreamModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">🌙 梦境供电中心</h2>
              <p className="text-sm opacity-90 mt-1">
                {dreamState.active
                  ? '夜晚正在进行，满足居民的梦境愿望吧！'
                  : dreamState.totalWishes > 0
                  ? '昨夜梦境结算报告'
                  : '暂无梦境活动，提高满意度以解锁梦境模式'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<Lightbulb className="w-5 h-5" />}
              label="累计灵感"
              value={dreamState.inspirationPoints.toString()}
              color="yellow"
              isNight={isNight}
            />
            <StatCard
              icon={<Award className="w-5 h-5" />}
              label="完成度"
              value={`${Math.round(progress)}%`}
              color="green"
              isNight={isNight}
            />
            <StatCard
              icon={<Gift className="w-5 h-5" />}
              label="奖励预览"
              value={`+${totalReward}`}
              color="pink"
              isNight={isNight}
            />
            <StatCard
              icon={isNight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              label="满意度"
              value={`${Math.round(satisfaction)}%`}
              color="purple"
              isNight={isNight}
            />
          </div>

          {dreamState.active && halfBatteryStatus && (
            <div
              className={`rounded-xl p-4 border ${
                halfBatteryStatus.isInRange
                  ? isNight
                    ? 'bg-green-500/15 border-green-500/40'
                    : 'bg-green-50 border-green-200'
                  : isNight
                  ? 'bg-yellow-500/15 border-yellow-500/40'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle
                  className={`w-5 h-5 ${
                    halfBatteryStatus.isInRange
                      ? 'text-green-500'
                      : isNight
                      ? 'text-yellow-400'
                      : 'text-yellow-600'
                  }`}
                />
                <h3
                  className={`font-bold ${
                    isNight ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  全局条件：蓄电池半满状态
                </h3>
                <span
                  className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                    halfBatteryStatus.isInRange
                      ? 'bg-green-500 text-white'
                      : isNight
                      ? 'bg-yellow-500/30 text-yellow-300'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {halfBatteryStatus.count} 个愿望依赖
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isNight ? 'text-indigo-200' : 'text-gray-600'}>
                    当前电量
                  </span>
                  <span className="font-bold">
                    {Math.round(halfBatteryStatus.percent)}%
                  </span>
                </div>
                <div
                  className={`w-full h-3 rounded-full overflow-hidden ${
                    isNight ? 'bg-slate-800' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className="absolute h-3 bg-green-500/30 rounded-full"
                    style={{
                      left: `${HALF_BATTERY_LOW * 100}%`,
                      width: `${(HALF_BATTERY_HIGH - HALF_BATTERY_LOW) * 100}%`,
                    }}
                  />
                  <div
                    className="relative h-full"
                    style={{ width: `${halfBatteryStatus.percent}%` }}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        halfBatteryStatus.isInRange
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                      }`}
                    />
                  </div>
                </div>
                <p
                  className={`text-xs ${
                    halfBatteryStatus.isInRange
                      ? 'text-green-500'
                      : isNight
                      ? 'text-yellow-400'
                      : 'text-yellow-600'
                  }`}
                >
                  {halfBatteryStatus.isInRange
                    ? '✓ 蓄电池已处于半满状态，条件满足！'
                    : halfBatteryStatus.percent < HALF_BATTERY_LOW * 100
                    ? `需要将电量提升至 ${HALF_BATTERY_LOW * 100}% 以上（当前偏低 ${Math.round(
                        HALF_BATTERY_LOW * 100 - halfBatteryStatus.percent
                      )}%）`
                    : `需要将电量降低至 ${HALF_BATTERY_HIGH * 100}% 以下（当前偏高 ${Math.round(
                        halfBatteryStatus.percent - HALF_BATTERY_HIGH * 100
                      )}%）`}
                </p>
              </div>
            </div>
          )}

          {dreamState.wishes.length > 0 ? (
            <>
              {wishesByType.blue_current.length > 0 && (
                <WishTypeSection
                  type="blue_current"
                  wishes={wishesByType.blue_current}
                  isNight={isNight}
                  grid={grid}
                  poweredCells={poweredCells}
                />
              )}
              {wishesByType.silent_night.length > 0 && (
                <WishTypeSection
                  type="silent_night"
                  wishes={wishesByType.silent_night}
                  isNight={isNight}
                  grid={grid}
                  poweredCells={poweredCells}
                />
              )}
              {wishesByType.half_battery.length > 0 && (
                <WishTypeSection
                  type="half_battery"
                  wishes={wishesByType.half_battery}
                  isNight={isNight}
                  grid={grid}
                  poweredCells={poweredCells}
                />
              )}
            </>
          ) : (
            <div
              className={`rounded-xl p-8 text-center ${
                isNight ? 'bg-slate-800/50' : 'bg-gray-50'
              }`}
            >
              <div className="text-6xl mb-4">💤</div>
              <h3
                className={`text-lg font-bold mb-2 ${
                  isNight ? 'text-white' : 'text-gray-800'
                }`}
              >
                暂无梦境
              </h3>
              <p className={isNight ? 'text-indigo-300' : 'text-gray-500'}>
                将居民满意度提升至 70% 以上，夜幕降临时居民便会产生美好的梦境愿望
              </p>
            </div>
          )}

          {dreamState.nextDayPenalty > 0 && (
            <div
              className={`rounded-xl p-4 border ${
                isNight
                  ? 'bg-red-500/15 border-red-500/40'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className={`font-semibold ${isNight ? 'text-white' : 'text-gray-800'}`}>
                    ⚠️ 昨夜梦境惩罚生效中
                  </p>
                  <p className={`text-sm ${isNight ? 'text-red-300' : 'text-red-600'}`}>
                    今日发电量降低 {Math.round(dreamState.nextDayPenalty * 100)}%
                    {dreamState.active ? '（次日白天生效）' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {dreamState.totalWishes > 0 && !dreamState.active && (
            <div
              className={`rounded-xl p-5 border ${
                isNight
                  ? 'bg-gradient-to-r from-green-500/15 to-blue-500/15 border-green-500/30'
                  : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
              }`}
            >
              <h3 className={`font-bold mb-3 ${isNight ? 'text-white' : 'text-gray-800'}`}>
                📊 昨夜梦境结算
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{fulfilledWishes}</div>
                  <div className={`text-xs ${isNight ? 'text-indigo-300' : 'text-gray-500'}`}>
                    达成
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{pendingWishes}</div>
                  <div className={`text-xs ${isNight ? 'text-indigo-300' : 'text-gray-500'}`}>
                    待处理
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{failedWishes}</div>
                  <div className={`text-xs ${isNight ? 'text-indigo-300' : 'text-gray-500'}`}>
                    失败
                  </div>
                </div>
              </div>
              {fulfilledWishes > 0 && (
                <div
                  className={`mt-4 pt-4 border-t flex items-center justify-between ${
                    isNight ? 'border-slate-700' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span className={isNight ? 'text-white' : 'text-gray-800'}>
                      获得灵感点
                    </span>
                  </div>
                  <span className="text-xl font-bold text-yellow-500">
                    +{dreamState.wishes
                      .filter((w) => w.fulfilled)
                      .reduce((s, w) => s + w.inspirationReward, 0)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`p-4 border-t ${
            isNight ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <button
            onClick={closeDreamModal}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] ${
              isNight
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
            }`}
          >
            {dreamState.active ? '继续游戏，努力达成梦境！' : '继续游戏'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  color,
  isNight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'yellow' | 'green' | 'pink' | 'purple';
  isNight: boolean;
}) {
  const colorMap = {
    yellow: {
      bg: isNight ? 'bg-yellow-500/20' : 'bg-yellow-50',
      icon: 'text-yellow-500',
      text: isNight ? 'text-yellow-400' : 'text-yellow-600',
    },
    green: {
      bg: isNight ? 'bg-green-500/20' : 'bg-green-50',
      icon: 'text-green-500',
      text: isNight ? 'text-green-400' : 'text-green-600',
    },
    pink: {
      bg: isNight ? 'bg-pink-500/20' : 'bg-pink-50',
      icon: 'text-pink-500',
      text: isNight ? 'text-pink-400' : 'text-pink-600',
    },
    purple: {
      bg: isNight ? 'bg-purple-500/20' : 'bg-purple-50',
      icon: 'text-purple-500',
      text: isNight ? 'text-purple-400' : 'text-purple-600',
    },
  };
  const c = colorMap[color];

  return (
    <div
      className={`rounded-xl p-3 ${c.bg} border ${
        isNight ? 'border-white/10' : 'border-transparent'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`${c.icon}`}>{icon}</div>
        <span className={`text-xs ${isNight ? 'text-indigo-300' : 'text-gray-500'}`}>
          {label}
        </span>
      </div>
      <div className={`text-xl font-bold ${c.text}`}>{value}</div>
    </div>
  );
}

function WishTypeSection({
  type,
  wishes,
  isNight,
  grid,
  poweredCells,
}: {
  type: 'blue_current' | 'silent_night' | 'half_battery';
  wishes: DreamWish[];
  isNight: boolean;
  grid: any[][];
  poweredCells: Set<string>;
}) {
  const info = DREAM_WISH_INFO[type];
  const buildingStats = BUILDING_STATS[info.targetBuildingType];

  const getIconForType = () => {
    switch (type) {
      case 'blue_current':
        return <Home className="w-5 h-5" />;
      case 'silent_night':
        return <Factory className="w-5 h-5" />;
      case 'half_battery':
        return <Battery className="w-5 h-5" />;
    }
  };

  const getConditionDescription = () => {
    switch (type) {
      case 'blue_current':
        return '条件：住房整夜保持通电状态';
      case 'silent_night':
        return '条件：工坊保持断电状态（可断开电线）';
      case 'half_battery':
        return '条件：蓄电池电量保持 40%-60%';
    }
  };

  const fulfilled = wishes.filter((w) => w.fulfilled).length;
  const totalReward = wishes.reduce((s, w) => s + w.inspirationReward, 0);

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isNight ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-white'
      }`}
    >
      <div
        className={`p-3 border-b flex items-center justify-between ${
          isNight ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{info.emoji}</span>
          <div>
            <h3
              className={`font-bold flex items-center gap-2 ${
                isNight ? 'text-white' : 'text-gray-800'
              }`}
            >
              {info.name}
              <span className="text-lg">{buildingStats.emoji}</span>
              {getIconForType()}
            </h3>
            <p className={`text-xs ${isNight ? 'text-indigo-300' : 'text-gray-500'}`}>
              {getConditionDescription()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${isNight ? 'text-white' : 'text-gray-800'}`}>
            {fulfilled}/{wishes.length}
          </div>
          <div className={`text-xs ${isNight ? 'text-yellow-400' : 'text-yellow-600'}`}>
            +{totalReward} 灵感
          </div>
        </div>
      </div>
      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        {wishes.map((wish) => (
          <WishDetailItem
            key={wish.id}
            wish={wish}
            isNight={isNight}
            grid={grid}
            poweredCells={poweredCells}
          />
        ))}
      </div>
    </div>
  );
}

function WishDetailItem({
  wish,
  isNight,
  grid,
  poweredCells,
}: {
  wish: DreamWish;
  isNight: boolean;
  grid: any[][];
  poweredCells: Set<string>;
}) {
  const cell = grid[wish.targetCell.y]?.[wish.targetCell.x];
  const isPowered = poweredCells.has(`${wish.targetCell.x},${wish.targetCell.y}`);

  const getStatusBadge = () => {
    if (wish.fulfilled) {
      return (
        <span className="flex items-center gap-1 text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
          <Check className="w-3 h-3" />
          已达成
        </span>
      );
    }
    if (wish.status === 'failed') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" />
          失败
        </span>
      );
    }
    return (
      <span
        className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
          isNight ? 'bg-indigo-500/30 text-indigo-200' : 'bg-blue-100 text-blue-700'
        }`}
      >
        <Clock className="w-3 h-3" />
        等待中
      </span>
    );
  };

  const getLiveStatus = () => {
    if (!cell || cell.type !== wish.targetType) {
      return { text: '建筑已被移除', ok: false, color: 'text-red-500' };
    }
    if (cell.faulty) {
      return { text: '建筑故障', ok: false, color: 'text-orange-500' };
    }
    switch (wish.type) {
      case 'blue_current':
        return isPowered
          ? { text: '通电中 ✓', ok: true, color: 'text-green-500' }
          : { text: '未通电 ✗', ok: false, color: 'text-red-500' };
      case 'silent_night':
        return !isPowered
          ? { text: '已断电静音 ✓', ok: true, color: 'text-green-500' }
          : { text: '仍在工作 ✗', ok: false, color: 'text-red-500' };
      case 'half_battery':
        return {
          text: '依赖全局蓄电池状态',
          ok: wish.fulfilled,
          color: wish.fulfilled ? 'text-green-500' : 'text-yellow-500',
        };
    }
  };

  const liveStatus = getLiveStatus();

  return (
    <div
      className={`rounded-lg p-3 border transition-all ${
        wish.fulfilled
          ? isNight
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-green-50 border-green-200'
          : wish.status === 'failed'
          ? isNight
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-red-50 border-red-200'
          : isNight
          ? 'bg-slate-700/30 border-slate-600/50'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <Zap className={`w-3.5 h-3.5 ${liveStatus.color}`} />
            <span
              className={`text-sm font-semibold ${
                isNight ? 'text-white' : 'text-gray-800'
              }`}
            >
              位置 ({wish.targetCell.x}, {wish.targetCell.y})
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${liveStatus.color} font-medium`}>
            {liveStatus.text}
          </p>
        </div>
        {getStatusBadge()}
      </div>
      <div
        className={`flex items-center justify-between pt-2 border-t ${
          isNight ? 'border-slate-600/50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center gap-1">
          <Lightbulb className={`w-3 h-3 ${isNight ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <span className={`text-xs ${isNight ? 'text-indigo-300' : 'text-gray-500'}`}>
            奖励
          </span>
        </div>
        <span className={`text-sm font-bold ${isNight ? 'text-yellow-400' : 'text-yellow-600'}`}>
          +{wish.inspirationReward}
        </span>
      </div>
    </div>
  );
}
