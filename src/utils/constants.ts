export type CellType = 'empty' | 'windmill' | 'house' | 'factory' | 'battery' | 'wire';

export type ToolType = CellType | 'remove';

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  rotation: number;
  powered: boolean;
  faulty: boolean;
}

export type DreamWishType = 'blue_current' | 'silent_night' | 'half_battery';

export type DreamWishStatus = 'pending' | 'fulfilled' | 'failed';

export interface DreamWish {
  id: string;
  type: DreamWishType;
  targetCell: { x: number; y: number };
  targetType: CellType;
  status: DreamWishStatus;
  fulfilled: boolean;
  currentlyMet: boolean;
  invalidTarget: boolean;
  inspirationReward: number;
  specialReward?: { name: string; emoji: string };
  description: string;
  emoji: string;
}

export interface DreamState {
  active: boolean;
  wishes: DreamWish[];
  inspirationPoints: number;
  nextDayPenalty: number;
  lastEvaluatedDayTime: number;
  totalWishes: number;
  fulfilledWishes: number;
  lastNightInspiration: number;
  lastNightSpecialRewards: Array<{ name: string; emoji: string }>;
  activePenaltyDay: number;
}

export const DREAM_WISH_INFO: Record<DreamWishType, {
  name: string;
  description: string;
  emoji: string;
  inspirationBase: number;
  targetBuildingType: CellType;
  specialRewards: Array<{ name: string; emoji: string }>;
}> = {
  blue_current: {
    name: '蓝色安眠电流',
    description: '希望住房接入稳定的蓝色安眠电流，整夜保持通电',
    emoji: '💙',
    inspirationBase: 15,
    targetBuildingType: 'house',
    specialRewards: [
      { name: '甜梦礼包', emoji: '🎁' },
      { name: '安眠护符', emoji: '🌙' },
      { name: '星光碎片', emoji: '⭐' },
    ],
  },
  silent_night: {
    name: '夜间断电静音',
    description: '工坊希望夜间断电，保持宁静以便工人休养',
    emoji: '🤫',
    inspirationBase: 20,
    targetBuildingType: 'factory',
    specialRewards: [
      { name: '工匠之魂', emoji: '🔨' },
      { name: '静谧铃铛', emoji: '🔔' },
      { name: '休憩锦旗', emoji: '🏳️' },
    ],
  },
  half_battery: {
    name: '蓄电池半满',
    description: '蓄电池希望保持半满状态（40%-60%），平衡充放电循环',
    emoji: '⚖️',
    inspirationBase: 18,
    targetBuildingType: 'battery',
    specialRewards: [
      { name: '能量水晶', emoji: '💎' },
      { name: '电池护芯', emoji: '🛡️' },
      { name: '永续之光', emoji: '✨' },
    ],
  },
};

export const DREAM_SATISFACTION_THRESHOLD = 70;
export const HALF_BATTERY_LOW = 0.4;
export const HALF_BATTERY_HIGH = 0.6;
export const PENALTY_PER_FAILED_DREAM = 0.05;

export const GRID_SIZE = 8;

export const BUILDING_STATS = {
  windmill: { dayGen: 5, nightGen: 1, consumption: 0, name: '风车', emoji: '🌀' },
  house: { dayGen: 0, nightGen: 0, consumption: 2, name: '住房', emoji: '🏠' },
  factory: { dayGen: 0, nightGen: 0, consumption: 4, name: '工坊', emoji: '🏭' },
  battery: { dayGen: 0, nightGen: 0, consumption: 0, storage: 20, name: '蓄电池', emoji: '🔋' },
  wire: { dayGen: 0, nightGen: 0, consumption: 0, name: '电线', emoji: '⚡' },
} as const;

export const WIRE_CONNECTIONS: Record<number, [boolean, boolean, boolean, boolean]> = {
  0: [true, false, true, false],
  1: [false, true, false, true],
  2: [true, true, false, false],
  3: [true, false, false, true],
  4: [false, true, true, false],
  5: [false, false, true, true],
};

export const DIR_OFFSETS: Array<[number, number]> = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

export const TOOLS: Array<{ type: ToolType; name: string; emoji: string; description: string }> = [
  { type: 'windmill', name: '风车', emoji: '🌀', description: '白天+5电，夜晚+1电' },
  { type: 'house', name: '住房', emoji: '🏠', description: '消耗2电，提供满意度' },
  { type: 'factory', name: '工坊', emoji: '🏭', description: '消耗4电，生产物资' },
  { type: 'battery', name: '蓄电池', emoji: '🔋', description: '存储20电量' },
  { type: 'wire', name: '电线', emoji: '⚡', description: '传导电力，右键/R旋转' },
  { type: 'remove', name: '拆除', emoji: '🗑️', description: '移除建筑或电线' },
];

export const DAY_LENGTH = 100;
export const DAY_THRESHOLD = 50;
export const TICK_INTERVAL = 300;
export const FAULT_CHANCE = 0.002;
