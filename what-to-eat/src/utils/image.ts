// 使用 picsum.photos 作为可靠的占位图片服务
// 根据菜品名称生成固定的种子，确保同一菜品始终显示相同图片
function getPicsumUrl(seed: string, width: number = 400, height: number = 300): string {
  // 使用种子生成稳定的图片URL
  const hash = seed.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const id = Math.abs(hash) % 1000;
  return `https://picsum.photos/seed/${seed}${id}/${width}/${height}`;
}

// 菜品图片关键词映射 - 使用更具体的食物相关关键词
const DISH_IMAGE_KEYWORDS: Record<string, string> = {
  // 荤菜 - 使用肉类相关关键词
  '红烧肉': 'pork-braised',
  '糖醋排骨': 'pork-ribs',
  '可乐鸡翅': 'chicken-wings',
  '番茄炒蛋': 'tomato-egg',
  '鱼香肉丝': 'shredded-pork',
  '宫保鸡丁': 'kung-pao-chicken',
  '清蒸鲈鱼': 'steamed-fish',
  '黑椒牛柳': 'beef-stirfry',
  '蒜蓉粉丝虾': 'shrimp-garlic',
  '回锅肉': 'twice-cooked-pork',
  '啤酒鸭': 'duck-beer',
  '土豆炖牛腩': 'beef-stew',
  
  // 素菜 - 使用蔬菜相关关键词
  '地三鲜': 'vegetable-stirfry',
  '麻婆豆腐': 'mapo-tofu',
  '蒜蓉西兰花': 'broccoli-garlic',
  '干煸四季豆': 'green-beans',
  '凉拌黄瓜': 'cucumber-salad',
  '醋溜白菜': 'cabbage-sour',
  '红烧茄子': 'eggplant-braised',
  '干锅花菜': 'cauliflower-drypot',
  '清炒时蔬': 'vegetable-stirfry',
  '香菇油菜': 'mushroom-greens',
  '凉拌木耳': 'wood-ear-salad',
  
  // 甜品 - 使用甜点相关关键词
  '蛋挞': 'egg-tart',
  '芒果班戟': 'mango-pancake',
  '红豆沙': 'red-bean-soup',
  '双皮奶': 'milk-pudding',
  '提拉米苏': 'tiramisu-cake',
  '杨枝甘露': 'mango-dessert',
};

const FOOD_IMAGES: Record<string, string[]> = {
  // 健康食材
  '燕麦': [getPicsumUrl('oats')],
  '荞麦': [getPicsumUrl('buckwheat')],
  '糙米': [getPicsumUrl('brownrice')],
  '黑米': [getPicsumUrl('blackrice')],
  '藜麦': [getPicsumUrl('quinoa')],
  '红薯': [getPicsumUrl('sweetpotato')],
  '山药': [getPicsumUrl('yam')],
  '玉米': [getPicsumUrl('corn')],
  '全麦面包': [getPicsumUrl('bread')],
  '薏米': [getPicsumUrl('barley')],
  '鸡胸肉': [getPicsumUrl('chicken')],
  '三文鱼': [getPicsumUrl('salmon')],
  '鳕鱼': [getPicsumUrl('cod')],
  '豆腐': [getPicsumUrl('tofu')],
  '鸡蛋': [getPicsumUrl('egg')],
  '虾仁': [getPicsumUrl('shrimp')],
  '瘦牛肉': [getPicsumUrl('beef')],
  '牛奶': [getPicsumUrl('milk')],
  '黄豆': [getPicsumUrl('soybean')],
  '黑豆': [getPicsumUrl('blackbean')],
  '西兰花': [getPicsumUrl('broccoli')],
  '菠菜': [getPicsumUrl('spinach')],
  '芹菜': [getPicsumUrl('celery')],
  '苦瓜': [getPicsumUrl('bittermelon')],
  '冬瓜': [getPicsumUrl('wintermelon')],
  '番茄': [getPicsumUrl('tomato')],
  '黄瓜': [getPicsumUrl('cucumber')],
  '木耳': [getPicsumUrl('fungus')],
  '香菇': [getPicsumUrl('mushroom')],
  '海带': [getPicsumUrl('kelp')],
  '紫菜': [getPicsumUrl('seaweed')],
  '洋葱': [getPicsumUrl('onion')],
  '草莓': [getPicsumUrl('strawberry')],
  '蓝莓': [getPicsumUrl('blueberry')],
  '柚子': [getPicsumUrl('pomelo')],
  '苹果': [getPicsumUrl('apple')],
  '梨': [getPicsumUrl('pear')],
  '猕猴桃': [getPicsumUrl('kiwi')],
  '圣女果': [getPicsumUrl('cherrytomato')],
  '樱桃': [getPicsumUrl('cherry')],
  '坚果': [getPicsumUrl('nuts')],
  '橄榄油': [getPicsumUrl('oliveoil')],
  '醋': [getPicsumUrl('vinegar')],
  '肉桂': [getPicsumUrl('cinnamon')],
  
  // 中式菜品 - 荤菜
  '红烧肉': [getPicsumUrl('hongshaorou')],
  '糖醋排骨': [getPicsumUrl('tangcupaigu')],
  '可乐鸡翅': [getPicsumUrl('kelaojichi')],
  '番茄炒蛋': [getPicsumUrl('fanqiechaodan')],
  '鱼香肉丝': [getPicsumUrl('yuxiangrousi')],
  '宫保鸡丁': [getPicsumUrl('gongbaojiding')],
  '清蒸鲈鱼': [getPicsumUrl('qingzhengluyu')],
  '黑椒牛柳': [getPicsumUrl('heijiaoniuliu')],
  '蒜蓉粉丝虾': [getPicsumUrl('suanrongfengsixia')],
  '回锅肉': [getPicsumUrl('huiguorou')],
  '啤酒鸭': [getPicsumUrl('pijiuya')],
  '土豆炖牛腩': [getPicsumUrl('tudoudunniunan')],
  
  // 中式菜品 - 素菜
  '地三鲜': [getPicsumUrl('disanxian')],
  '麻婆豆腐': [getPicsumUrl('mapodoufu')],
  '蒜蓉西兰花': [getPicsumUrl('suanrongxilanhua')],
  '干煸四季豆': [getPicsumUrl('ganbiansijidou')],
  '凉拌黄瓜': [getPicsumUrl('liangbanhuanggua')],
  '醋溜白菜': [getPicsumUrl('culiubaicai')],
  '红烧茄子': [getPicsumUrl('hongshaoqiezi')],
  '干锅花菜': [getPicsumUrl('ganguohuacai')],
  '清炒时蔬': [getPicsumUrl('qingchaoshishu')],
  '香菇油菜': [getPicsumUrl('xiangguyoucai')],
  '凉拌木耳': [getPicsumUrl('liangbanmuer')],
  
  // 中式菜品 - 甜品
  '蛋挞': [getPicsumUrl('danta')],
  '芒果班戟': [getPicsumUrl('mangguobanji')],
  '红豆沙': [getPicsumUrl('hongdousha')],
  '双皮奶': [getPicsumUrl('shuangpinai')],
  '提拉米苏': [getPicsumUrl('tiramisu')],
  '杨枝甘露': [getPicsumUrl('yangzhiganlu')],
};

const FALLBACK_IMAGES = [
  getPicsumUrl('food1'),
  getPicsumUrl('food2'),
  getPicsumUrl('food3'),
  getPicsumUrl('food4'),
  getPicsumUrl('food5'),
  getPicsumUrl('food6'),
  getPicsumUrl('food7'),
  getPicsumUrl('food8'),
  getPicsumUrl('food9'),
  getPicsumUrl('food10'),
];

const imageCache: Record<string, string> = {};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export function getRecipeImage(recipeId: string, recipeName: string): string {
  // 使用菜品名称作为缓存键，确保相同菜品始终显示相同图片
  const cacheKey = `recipe-${recipeName}`;
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  // 使用特定的图片关键词，如果没有则使用菜品名
  const imageKeyword = DISH_IMAGE_KEYWORDS[recipeName] || recipeName;
  
  // 生成图片URL - 使用关键词确保同类菜品有相似风格的图片
  const imageUrl = getPicsumUrl(imageKeyword);

  imageCache[cacheKey] = imageUrl;
  return imageUrl;
}

export function getFoodImage(foodId: string, foodName: string): string {
  const cacheKey = `food-${foodId}-${foodName}`;
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  const images = FOOD_IMAGES[foodName];
  let imageUrl: string;

  if (images && images.length > 0) {
    const index = Math.abs(hashCode(foodId)) % images.length;
    imageUrl = images[index];
  } else {
    const index = Math.abs(hashCode(foodId)) % FALLBACK_IMAGES.length;
    imageUrl = FALLBACK_IMAGES[index];
  }

  imageCache[cacheKey] = imageUrl;
  return imageUrl;
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}
