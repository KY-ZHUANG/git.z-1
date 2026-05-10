export const CATEGORIES = [
  { id: 'all', name: '全部', icon: '🍽️' },
  { id: 'meat', name: '荤菜', icon: '🥩' },
  { id: 'vegetable', name: '素菜', icon: '🥬' },
  { id: 'dessert', name: '甜品', icon: '🍰' },
] as const;

export const DIFFICULTY_LABELS = {
  easy: { text: '简单', color: '#4CAF50' },
  medium: { text: '中等', color: '#FF9800' },
  hard: { text: '困难', color: '#F44336' },
} as const;

export const TAGS = [
  '快手菜',
  '下饭菜',
  '宴客菜',
  '家常菜',
  '减脂餐',
  '宝宝爱吃',
  '懒人必备',
] as const;

export const FOOD_CATEGORIES = [
  { id: 'all', name: '全部', icon: '🍽️' },
  { id: 'grain', name: '主食', icon: '🌾' },
  { id: 'protein', name: '蛋白质', icon: '🥚' },
  { id: 'vegetable', name: '蔬菜', icon: '🥦' },
  { id: 'fruit', name: '水果', icon: '🍎' },
  { id: 'other', name: '其他', icon: '🥜' },
] as const;

export const GI_LEVELS = {
  low: { text: '低GI', color: '#4CAF50', range: '<55' },
  medium: { text: '中GI', color: '#FF9800', range: '55-70' },
  high: { text: '高GI', color: '#F44336', range: '>70' },
  unknown: { text: '未知', color: '#9E9E9E', range: '-' },
} as const;

export const STORAGE_KEYS = {
  RECIPES: 'whatToEat_recipes',
  FAVORITES: 'whatToEat_favorites',
  HISTORY: 'whatToEat_history',
  HEALTHY_FOODS: 'whatToEat_healthyFoods',
  SETTINGS: 'whatToEat_settings',
  LAST_VISIT: 'whatToEat_lastVisit',
  RECENT_BROWSE: 'whatToEat_recentBrowse',
} as const;

export const LOADING_MESSAGES = [
  '正在翻阅祖传食谱...',
  '询问奶奶的建议...',
  '计算今日运势与口味的匹配度...',
  '正在召唤美食精灵...',
  '搜索厨房的秘密配方...',
  '开启美食雷达扫描中...',
] as const;
