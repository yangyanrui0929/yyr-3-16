import {
  GridCell,
  GRID_SIZE,
  DreamWish,
  DreamWishType,
  DreamState,
  DREAM_WISH_INFO,
  DREAM_SATISFACTION_THRESHOLD,
  HALF_BATTERY_LOW,
  HALF_BATTERY_HIGH,
  PENALTY_PER_FAILED_DREAM,
  DAY_THRESHOLD,
  CellType,
} from './constants';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function canGenerateDreams(satisfaction: number): boolean {
  return satisfaction >= DREAM_SATISFACTION_THRESHOLD;
}

function getRandomSpecialReward(type: DreamWishType) {
  const rewards = DREAM_WISH_INFO[type].specialRewards;
  if (Math.random() < 0.4) {
    return rewards[Math.floor(Math.random() * rewards.length)];
  }
  return undefined;
}

export function generateDreams(
  grid: GridCell[][],
  satisfaction: number
): DreamWish[] {
  if (!canGenerateDreams(satisfaction)) {
    return [];
  }

  const availableBuildings: { type: DreamWishType; x: number; y: number }[] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = grid[y][x];
      if (cell.faulty) continue;

      if (cell.type === 'house') {
        availableBuildings.push({ type: 'blue_current', x, y });
      } else if (cell.type === 'factory') {
        availableBuildings.push({ type: 'silent_night', x, y });
      } else if (cell.type === 'battery') {
        availableBuildings.push({ type: 'half_battery', x, y });
      }
    }
  }

  if (availableBuildings.length === 0) {
    return [];
  }

  const baseCount = Math.min(
    availableBuildings.length,
    Math.max(1, Math.floor(satisfaction / 30))
  );

  const shuffled = [...availableBuildings].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, baseCount);

  return selected.map((b) => {
    const info = DREAM_WISH_INFO[b.type];
    const bonusMultiplier = 1 + (satisfaction - DREAM_SATISFACTION_THRESHOLD) / 150;
    const reward = Math.round(info.inspirationBase * bonusMultiplier);
    const specialReward = getRandomSpecialReward(b.type);

    return {
      id: generateId(),
      type: b.type,
      targetCell: { x: b.x, y: b.y },
      targetType: info.targetBuildingType,
      status: 'pending' as const,
      fulfilled: false,
      currentlyMet: false,
      invalidTarget: false,
      inspirationReward: reward,
      specialReward,
      description: info.description,
      emoji: info.emoji,
    };
  });
}

export function evaluateDreamWishes(
  wishes: DreamWish[],
  grid: GridCell[][],
  storedPower: number,
  maxStorage: number,
  dayTime: number
): DreamWish[] {
  const isNight = dayTime >= DAY_THRESHOLD;
  if (!isNight) return wishes;

  const storageRatio = maxStorage > 0 ? storedPower / maxStorage : 0;

  return wishes.map((wish) => {
    const cell = grid[wish.targetCell.y]?.[wish.targetCell.x];
    if (!cell) {
      return {
        ...wish,
        currentlyMet: false,
        invalidTarget: true,
        fulfilled: false,
      };
    }

    const isCorrectType = cell.type === wish.targetType;
    if (!isCorrectType) {
      return {
        ...wish,
        currentlyMet: false,
        invalidTarget: true,
        fulfilled: false,
      };
    }

    if (cell.faulty) {
      return {
        ...wish,
        currentlyMet: false,
        invalidTarget: false,
        fulfilled: false,
      };
    }

    let conditionMet = false;

    switch (wish.type) {
      case 'blue_current':
        conditionMet = cell.powered;
        break;
      case 'silent_night':
        conditionMet = !cell.powered;
        break;
      case 'half_battery':
        conditionMet =
          storageRatio >= HALF_BATTERY_LOW && storageRatio <= HALF_BATTERY_HIGH;
        break;
    }

    return {
      ...wish,
      currentlyMet: conditionMet,
      invalidTarget: false,
      fulfilled: conditionMet,
    };
  });
}

export function finalizeDreamEvaluation(wishes: DreamWish[]): {
  updatedWishes: DreamWish[];
  totalInspiration: number;
  penalty: number;
  fulfilledCount: number;
  totalCount: number;
  earnedSpecialRewards: Array<{ name: string; emoji: string }>;
} {
  let totalInspiration = 0;
  let failedCount = 0;
  let fulfilledCount = 0;
  const earnedSpecialRewards: Array<{ name: string; emoji: string }> = [];

  const updatedWishes = wishes.map((wish) => {
    if (wish.fulfilled && !wish.invalidTarget) {
      totalInspiration += wish.inspirationReward;
      fulfilledCount++;
      if (wish.specialReward) {
        earnedSpecialRewards.push(wish.specialReward);
      }
      return { ...wish, status: 'fulfilled' as const };
    } else {
      failedCount++;
      return { ...wish, status: 'failed' as const, fulfilled: false };
    }
  });

  const penalty = failedCount * PENALTY_PER_FAILED_DREAM;

  return {
    updatedWishes,
    totalInspiration,
    penalty,
    fulfilledCount,
    totalCount: wishes.length,
    earnedSpecialRewards,
  };
}

export function createInitialDreamState(): DreamState {
  return {
    active: false,
    wishes: [],
    inspirationPoints: 0,
    nextDayPenalty: 0,
    lastEvaluatedDayTime: 0,
    totalWishes: 0,
    fulfilledWishes: 0,
    lastNightInspiration: 0,
    lastNightSpecialRewards: [],
    activePenaltyDay: -1,
  };
}

export function getDreamProgress(wishes: DreamWish[]): number {
  if (wishes.length === 0) return 0;
  const validWishes = wishes.filter((w) => !w.invalidTarget);
  if (validWishes.length === 0) return 0;
  const fulfilled = validWishes.filter((w) => w.currentlyMet).length;
  return (fulfilled / validWishes.length) * 100;
}

export function getTotalRewardPreview(wishes: DreamWish[]): number {
  return wishes.reduce((sum, w) => sum + w.inspirationReward, 0);
}
