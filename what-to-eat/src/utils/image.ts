const FOOD_IMAGES: Record<string, string[]> = {
  // 健康食材
  '燕麦': ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop'],
  '荞麦': ['https://images.unsplash.com/photo-1585007600263-71228e40c8d1?w=400&h=300&fit=crop'],
  '糙米': ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop'],
  '黑米': ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop'],
  '藜麦': ['https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400&h=300&fit=crop'],
  '红薯': ['https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop'],
  '山药': ['https://images.unsplash.com/photo-1615484881653-bc01e0e0c2b?w=400&h=300&fit=crop'],
  '玉米': ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop'],
  '全麦面包': ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'],
  '薏米': ['https://images.unsplash.com/photo-1612257416648-ee7a6c6ecc5a?w=400&h=300&fit=crop'],
  '鸡胸肉': ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop'],
  '三文鱼': ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop'],
  '鳕鱼': ['https://images.unsplash.com/photo-1535404249378-88e9300c9f29?w=400&h=300&fit=crop'],
  '豆腐': ['https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop'],
  '鸡蛋': ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop'],
  '虾仁': ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop'],
  '瘦牛肉': ['https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop'],
  '牛奶': ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop'],
  '黄豆': ['https://images.unsplash.com/photo-1585670149969-5958a9290f59?w=400&h=300&fit=crop'],
  '黑豆': ['https://images.unsplash.com/photo-1595981234058-aea44d6e4e6e?w=400&h=300&fit=crop'],
  '西兰花': ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop'],
  '菠菜': ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop'],
  '芹菜': ['https://images.unsplash.com/photo-1518977676601-b53f82ber40a?w=400&h=300&fit=crop'],
  '苦瓜': ['https://images.unsplash.com/photo-1595966206326-d7e36b1a5e7a?w=400&h=300&fit=crop'],
  '冬瓜': ['https://images.unsplash.com/photo-1589834247991-4c53e9b6a7e6?w=400&h=300&fit=crop'],
  '番茄': ['https://images.unsplash.com/photo-1546470427-227c7b1f5f84?w=400&h=300&fit=crop'],
  '黄瓜': ['https://images.unsplash.com/photo-1562728928-4550a09855d4?w=400&h=300&fit=crop'],
  '木耳': ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop'],
  '香菇': ['https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&h=300&fit=crop'],
  '海带': ['https://images.unsplash.com/photo-1564675576897-6e93963d5b89?w=400&h=300&fit=crop'],
  '紫菜': ['https://images.unsplash.com/photo-1599618174734-7a4c2c3a8a9c?w=400&h=300&fit=crop'],
  '洋葱': ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop'],
  '草莓': ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop'],
  '蓝莓': ['https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=300&fit=crop'],
  '柚子': ['https://images.unsplash.com/photo-1545723820-539ba6aca1b3?w=400&h=300&fit=crop'],
  '苹果': ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=300&fit=crop'],
  '梨': ['https://images.unsplash.com/photo-1572584045272-0c8b868b4f38?w=400&h=300&fit=crop'],
  '猕猴桃': ['https://images.unsplash.com/photo-1561642004-2b8f491ab10e?w=400&h=300&fit=crop'],
  '圣女果': ['https://images.unsplash.com/photo-1597160558498-a8dcc5705438?w=400&h=300&fit=crop'],
  '樱桃': ['https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=400&h=300&fit=crop'],
  '坚果': ['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=300&fit=crop'],
  '橄榄油': ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop'],
  '醋': ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop'],
  '肉桂': ['https://images.unsplash.com/photo-1556689850-232c6f3a9e3c?w=400&h=300&fit=crop'],
  
  // 中式菜品 - 荤菜
  '红烧肉': ['https://images.unsplash.com/photo-1623689046286-adcf6bc93a5b?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop'],
  '糖醋排骨': ['https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400&h=300&fit=crop'],
  '可乐鸡翅': ['https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop'],
  '番茄炒蛋': ['https://images.unsplash.com/photo-1482049016gy2-d4be4f3a1e?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'],
  '鱼香肉丝': ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop'],
  '宫保鸡丁': ['https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop'],
  '清蒸鲈鱼': ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop'],
  '黑椒牛柳': ['https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop'],
  '蒜蓉粉丝虾': ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop'],
  '回锅肉': ['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop'],
  '啤酒鸭': ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'],
  '土豆炖牛腩': ['https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400&h=300&fit=crop'],
  
  // 中式菜品 - 素菜
  '地三鲜': ['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop'],
  '麻婆豆腐': ['https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=400&h=300&fit=crop'],
  '蒜蓉西兰花': ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop'],
  '干煸四季豆': ['https://images.unsplash.com/photo-1546083998-8ca0afa29a92?w=400&h=300&fit=crop'],
  '凉拌黄瓜': ['https://images.unsplash.com/photo-1562728928-4550a09855d4?w=400&h=300&fit=crop'],
  '醋溜白菜': ['https://images.unsplash.com/photo-1583280877266-40e98f3edd1a?w=400&h=300&fit=crop'],
  '红烧茄子': ['https://images.unsplash.com/photo-1571698578516-6ae17bba7049?w=400&h=300&fit=crop'],
  '干锅花菜': ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop'],
  '清炒时蔬': ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'],
  '香菇油菜': ['https://images.unsplash.com/photo-1604593665269-3f3d3b3e3e3e?w=400&h=300&fit=crop'],
  '凉拌木耳': ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop'],
  
  // 中式菜品 - 甜品
  '蛋挞': ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop'],
  '芒果班戟': ['https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=300&fit=crop'],
  '红豆沙': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
  '双皮奶': ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop'],
  '提拉米苏': ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop'],
  '杨枝甘露': ['https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop'],
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop',
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
  const cacheKey = `${recipeId}-${recipeName}`;
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  const images = FOOD_IMAGES[recipeName];
  let imageUrl: string;

  if (images && images.length > 0) {
    const index = Math.abs(hashCode(recipeId)) % images.length;
    imageUrl = images[index];
  } else {
    const index = Math.abs(hashCode(recipeId)) % FALLBACK_IMAGES.length;
    imageUrl = FALLBACK_IMAGES[index];
  }

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
