import type { HealthyFood, WeeklyPlan, NutritionTip } from '../types';
import { generateId } from '../utils/storage';
import { getRecipeImage } from '../utils/image';

const createHealthyFood = (
  name: string,
  category: 'grain' | 'protein' | 'vegetable' | 'fruit' | 'other',
  gi: number | undefined,
  calories: number,
  protein: number,
  carbs: number,
  fiber: number | undefined,
  benefits: string[],
  suitable: string[],
  tips: string
): HealthyFood => {
  const id = generateId();
  let giLevel: 'low' | 'medium' | 'high' = 'medium';
  if (gi !== undefined) {
    giLevel = gi < 55 ? 'low' : gi <= 70 ? 'medium' : 'high';
  }

  return {
    id,
    name,
    category,
    image: getRecipeImage(id, name),
    gi,
    giLevel,
    calories,
    protein,
    carbs,
    fiber,
    benefits,
    suitable,
    tips,
  };
};

export const healthyFoods: HealthyFood[] = [
  createHealthyFood('燕麦', 'grain', 55, 389, 10, 67, 10, ['降低胆固醇', '延缓血糖上升', '增加饱腹感'], ['糖尿病', '高血脂', '减脂', '通用'], '替代精制米面，建议每天50-100g'),
  createHealthyFood('荞麦', 'grain', 54, 324, 9, 71, 7, ['改善胰岛素抵抗', '降低血糖', '富含芦丁'], ['糖尿病', '高血压', '通用'], '可做荞麦面或荞麦粥'),
  createHealthyFood('糙米', 'grain', 50, 368, 8, 77, 3, ['延缓餐后血糖', '富含B族维生素', '增加膳食纤维'], ['糖尿病', '减脂', '通用'], '糙米饭口感较粗，可提前浸泡'),
  createHealthyFood('黑米', 'grain', 55, 341, 9, 72, 3, ['花青素丰富', '抗氧化', '延缓血糖上升'], ['糖尿病', '抗衰老', '通用'], '黑米饭需要提前浸泡'),
  createHealthyFood('藜麦', 'grain', 53, 368, 14, 64, 7, ['完全蛋白', '低GI', '富含矿物质'], ['糖尿病', '素食者', '减脂', '通用'], '藜麦煮前需浸泡10分钟'),
  createHealthyFood('红薯', 'grain', 54, 99, 2, 24, 3, ['富含胡萝卜素', '膳食纤维丰富', '饱腹感强'], ['糖尿病', '减脂', '便秘', '通用'], '建议蒸煮食用，每次100-150g'),
  createHealthyFood('山药', 'grain', 52, 56, 2, 12, 1, ['健脾益肺', '黏液蛋白', '延缓血糖上升'], ['糖尿病', '脾胃虚弱', '通用'], '可蒸食、炒菜或做汤'),
  createHealthyFood('玉米', 'grain', 55, 112, 4, 22, 2, ['膳食纤维丰富', 'B族维生素', '饱腹感好'], ['糖尿病', '减脂', '便秘', '通用'], '建议吃整根玉米'),
  createHealthyFood('全麦面包', 'grain', 50, 240, 12, 41, 6, ['复合碳水', '膳食纤维', '升糖慢'], ['糖尿病', '减脂', '通用'], '选择配料表第一位是全麦粉的产品'),
  createHealthyFood('薏米', 'grain', 53, 361, 12, 65, 2, ['利水渗湿', '健脾', '低GI'], ['糖尿病', '湿气重', '通用'], '可与红豆搭配煮粥'),
  createHealthyFood('鸡胸肉', 'protein', undefined, 133, 31, 0, 0, ['高蛋白低脂', '饱腹感强', '易于烹饪'], ['减脂', '增肌', '糖尿病', '通用'], '每天50-100g，可水煮、蒸或烤'),
  createHealthyFood('三文鱼', 'protein', undefined, 139, 20, 0, 0, ['Omega-3丰富', '保护心血管', '优质蛋白'], ['糖尿病', '高血压', '心脑血管疾病'], '每周2-3次，每次100g左右'),
  createHealthyFood('鳕鱼', 'protein', undefined, 82, 18, 0, 0, ['高蛋白低脂', '易于消化', 'DHA丰富'], ['糖尿病', '减脂', '老人', '儿童'], '肉质细嫩，适合清蒸'),
  createHealthyFood('豆腐', 'protein', undefined, 81, 8, 3, 1, ['植物蛋白', '钙质丰富', '调节血脂'], ['糖尿病', '高血压', '素食者', '通用'], '每天50-100g，可炒、炖、凉拌'),
  createHealthyFood('鸡蛋', 'protein', undefined, 144, 13, 1, 0, ['完全蛋白', '营养全面', '饱腹感好'], ['糖尿病', '减脂', '增肌', '通用'], '每天1个全蛋'),
  createHealthyFood('虾仁', 'protein', undefined, 48, 10, 0, 0, ['低脂高蛋白', '钙质丰富', '易于消化'], ['糖尿病', '减脂'], '每次50-80g'),
  createHealthyFood('瘦牛肉', 'protein', undefined, 125, 22, 0, 0, ['铁锌丰富', '优质蛋白', 'B12来源'], ['糖尿病', '贫血', '增肌', '通用'], '每周2-3次，每次80-100g'),
  createHealthyFood('牛奶', 'protein', 27, 54, 3, 4, 0, ['钙质丰富', '优质蛋白', '升糖慢'], ['糖尿病', '骨质疏松', '通用'], '每天250ml'),
  createHealthyFood('黄豆', 'protein', 18, 359, 35, 34, 15, ['植物雌激素', '优质蛋白', '降胆固醇'], ['糖尿病', '更年期', '素食者'], '可打豆浆、炖汤或发芽后食用'),
  createHealthyFood('黑豆', 'protein', 20, 381, 36, 33, 10, ['花青素丰富', '优质蛋白', '补肾益精'], ['糖尿病', '肾虚', '抗衰老'], '每天30g左右'),
  createHealthyFood('西兰花', 'vegetable', 15, 27, 3, 4, 2, ['维生素C丰富', '防癌蔬菜', '膳食纤维'], ['糖尿病', '减脂', '防癌', '通用'], '每天200-300g'),
  createHealthyFood('菠菜', 'vegetable', 15, 20, 2, 2, 2, ['铁质丰富', '叶酸来源', '保护视力'], ['糖尿病', '贫血', '孕妇', '通用'], '含草酸需焯水'),
  createHealthyFood('芹菜', 'vegetable', 15, 14, 1, 2, 1, ['降血压', '利尿消肿', '高纤维'], ['糖尿病', '高血压', '水肿'], '茎叶均可食用'),
  createHealthyFood('苦瓜', 'vegetable', 24, 17, 1, 3, 2, ['天然胰岛素', '降血糖', '清热解毒'], ['糖尿病', '上火', '减脂'], '切片焯水可减轻苦味'),
  createHealthyFood('冬瓜', 'vegetable', 15, 10, 1, 2, 1, ['利水消肿', '低热量', '膳食纤维'], ['糖尿病', '水肿', '减脂'], '几乎不含糖'),
  createHealthyFood('番茄', 'vegetable', 15, 15, 1, 3, 1, ['番茄红素', '维生素C', '抗氧化'], ['糖尿病', '抗氧化', '减脂', '通用'], '可生吃或熟吃'),
  createHealthyFood('黄瓜', 'vegetable', 15, 15, 1, 2, 1, ['水分充足', '低热量', '清热解渴'], ['糖尿病', '减脂', '便秘'], '可生吃或凉拌'),
  createHealthyFood('木耳', 'vegetable', 26, 21, 1, 4, 3, ['补血活血', '降低血脂', '清肺'], ['糖尿病', '高血脂', '贫血'], '需提前泡发'),
  createHealthyFood('香菇', 'vegetable', 28, 19, 2, 4, 3, ['香菇多糖', '增强免疫', '降低血脂'], ['糖尿病', '免疫力低下', '通用'], '避免油炸'),
  createHealthyFood('海带', 'vegetable', 17, 12, 1, 2, 1, ['碘丰富', '降血压', '预防甲亢'], ['糖尿病', '甲状腺', '减脂'], '可做汤或凉拌'),
  createHealthyFood('紫菜', 'vegetable', 18, 35, 3, 5, 2, ['碘丰富', '铁质', '紫菜多糖'], ['糖尿病', '甲状腺', '补铁'], '可做汤或做寿司'),
  createHealthyFood('洋葱', 'vegetable', 30, 39, 1, 9, 2, ['降血糖', '降血脂', '抗菌'], ['糖尿病', '感冒', '高血脂'], '生吃或熟吃均可'),
  createHealthyFood('草莓', 'fruit', 29, 30, 1, 7, 2, ['维生素C冠军', '花青素', '保护心脏'], ['糖尿病', '抗氧化', '减脂'], '每天100-150g'),
  createHealthyFood('蓝莓', 'fruit', 34, 57, 1, 12, 2, ['花青素之王', '护眼', '抗氧化'], ['糖尿病', '眼疲劳', '抗衰老'], '每天50-100g'),
  createHealthyFood('柚子', 'fruit', 25, 41, 1, 9, 1, ['类胰岛素物质', '维生素C', '降低血脂'], ['糖尿病', '减脂', '高血压'], '每天2-3瓣'),
  createHealthyFood('苹果', 'fruit', 36, 52, 0, 13, 2, ['果胶丰富', '膳食纤维', '稳定血糖'], ['糖尿病', '便秘', '减脂'], '带皮吃效果更好'),
  createHealthyFood('梨', 'fruit', 38, 44, 0, 10, 2, ['润肺止咳', '水分充足', '膳食纤维'], ['糖尿病', '咳嗽', '便秘'], '选择不太甜的品种'),
  createHealthyFood('猕猴桃', 'fruit', 35, 56, 1, 11, 2, ['维生素C极高', '叶酸丰富', '助消化'], ['糖尿病', '免疫力低下', '孕产妇'], '每天1-2个'),
  createHealthyFood('圣女果', 'fruit', 30, 25, 1, 5, 1, ['番茄红素', '低糖', '维生素C'], ['糖尿病', '减脂', '抗氧化'], '每天15-20颗'),
  createHealthyFood('樱桃', 'fruit', 22, 46, 1, 10, 1, ['花青素', '补血', '降尿酸'], ['糖尿病', '痛风', '贫血'], '每天10-15颗'),
  createHealthyFood('坚果', 'other', 15, 600, 20, 20, 10, ['健康脂肪', '蛋白质', '微量元素'], ['糖尿病', '心脑血管', '健脑'], '每天10g左右'),
  createHealthyFood('橄榄油', 'other', undefined, 884, 0, 0, 0, ['单不饱和脂肪', '保护心血管', '抗炎'], ['糖尿病', '心脑血管', '减脂'], '每天20-30g'),
  createHealthyFood('醋', 'other', undefined, 31, 0, 1, 0, ['延缓血糖上升', '助消化', '软化血管'], ['糖尿病', '高血脂', '消化不良'], '餐前喝一小勺醋水'),
  createHealthyFood('肉桂', 'other', undefined, 247, 4, 80, 14, ['类胰岛素作用', '降血糖', '抗炎'], ['糖尿病', '抗氧化'], '每天1/2茶匙'),
];

export const nutritionTips: NutritionTip[] = [
  { id: 'tip1', title: '食物多样，养成合理膳食习惯', content: '每天摄入12种以上食物，每周25种以上。包括谷薯类、蔬菜水果、动物性食物等。', icon: '🥗', source: '国家卫生健康委员会《成人糖尿病食养指南(2023年版)》', type: 'principle' },
  { id: 'tip2', title: '能量适宜，控制体重', content: '建议糖尿病患者通过改善膳食结构，控制总热量，使BMI保持在18.5-23.9之间。', icon: '⚖️', source: '国家卫生健康委员会《成人糖尿病食养指南(2023年版)》', type: 'principle' },
  { id: 'tip3', title: '主食定量，优选低GI食物', content: '碳水化合物应占总能量的45%-60%，优选全谷物和低血糖生成指数(GI<55)的食物。', icon: '🌾', source: '国家卫生健康委员会《成人糖尿病食养指南(2023年版)》', type: 'principle' },
  { id: 'tip4', title: '什么是GI（血糖生成指数）？', content: 'GI是衡量食物引起血糖升高程度的指标。低GI食物(≤55)消化慢，血糖上升平缓。', icon: '📊', type: 'tip' },
  { id: 'tip5', title: '少油少盐，控制烹调方式', content: '每日烹调油摄入量不超过25-30g，食盐用量不超过5g。多采用蒸、煮、炖、拌等烹调方式。', icon: '🫗', source: '国家卫生健康委员会《成人糖尿病食养指南(2023年版)》', type: 'principle' },
  { id: 'tip6', title: 'BMI计算器', content: 'BMI（体质指数）=体重(kg)÷身高(m)²。正常范围：18.5-23.9。', icon: '📱', type: 'tool' },
];

export const weeklyPlan: WeeklyPlan = {
  week: 'sample',
  days: [
    { day: '周一', breakfast: { name: '燕麦牛奶 + 水煮蛋 + 小番茄', foods: [{ name: '燕麦片', amount: '40g' }, { name: '牛奶', amount: '200ml' }, { name: '鸡蛋', amount: '1个' }, { name: '小番茄', amount: '10颗' }], calories: 380, nutrition: { protein: 18, carbs: 45, fat: 12, fiber: 5 }, tags: ['快手', '低GI', '高蛋白'] }, lunch: { name: '糙米饭 + 清蒸鲈鱼 + 蒜蓉西兰花', foods: [{ name: '糙米', amount: '100g' }, { name: '鲈鱼', amount: '150g' }, { name: '西兰花', amount: '200g' }], calories: 520, nutrition: { protein: 35, carbs: 55, fat: 14, fiber: 6 }, tags: ['低脂', '高蛋白', '家常'] }, dinner: { name: '荞麦面 + 凉拌黄瓜 + 番茄蛋汤', foods: [{ name: '荞麦面', amount: '80g' }, { name: '黄瓜', amount: '200g' }, { name: '番茄', amount: '1个' }], calories: 420, nutrition: { protein: 15, carbs: 60, fat: 10, fiber: 5 }, tags: ['低GI', '清淡', '快手'] }, snack: { name: '坚果 + 柚子', foods: [{ name: '混合坚果', amount: '10g' }, { name: '柚子', amount: '100g' }], calories: 100, nutrition: { protein: 2, carbs: 12, fat: 5, fiber: 2 }, tags: ['加餐', '健康'] } },
    { day: '周二', breakfast: { name: '全麦面包 + 煎蛋 + 黄瓜', foods: [{ name: '全麦面包', amount: '2片' }, { name: '鸡蛋', amount: '2个' }, { name: '黄瓜', amount: '半根' }], calories: 350, nutrition: { protein: 18, carbs: 35, fat: 14, fiber: 4 }, tags: ['快手', '高蛋白'] }, lunch: { name: '藜麦饭 + 虾仁豆腐 + 凉拌木耳', foods: [{ name: '藜麦', amount: '80g' }, { name: '虾仁', amount: '80g' }, { name: '豆腐', amount: '100g' }], calories: 480, nutrition: { protein: 32, carbs: 50, fat: 12, fiber: 5 }, tags: ['高蛋白', '低脂'] }, dinner: { name: '红薯 + 鸡胸肉沙拉 + 紫菜蛋花汤', foods: [{ name: '红薯', amount: '150g' }, { name: '鸡胸肉', amount: '100g' }, { name: '生菜', amount: '100g' }], calories: 450, nutrition: { protein: 30, carbs: 48, fat: 10, fiber: 6 }, tags: ['减脂', '高纤维'] } },
    { day: '周三', breakfast: { name: '红豆薏米粥 + 茶叶蛋', foods: [{ name: '红豆', amount: '30g' }, { name: '薏米', amount: '20g' }, { name: '鸡蛋', amount: '1个' }], calories: 320, nutrition: { protein: 12, carbs: 50, fat: 6, fiber: 4 }, tags: ['祛湿', '养生'] }, lunch: { name: '黑米饭 + 清炒时蔬 + 番茄牛肉', foods: [{ name: '黑米', amount: '100g' }, { name: '时令青菜', amount: '200g' }, { name: '瘦牛肉', amount: '100g' }], calories: 550, nutrition: { protein: 32, carbs: 60, fat: 14, fiber: 5 }, tags: ['补铁', '家常'] }, dinner: { name: '山药排骨汤 + 凉拌菠菜', foods: [{ name: '山药', amount: '100g' }, { name: '排骨', amount: '50g' }, { name: '菠菜', amount: '150g' }], calories: 380, nutrition: { protein: 18, carbs: 25, fat: 20, fiber: 4 }, tags: ['滋补', '养胃'] } },
    { day: '周四', breakfast: { name: '蔬菜鸡蛋饼 + 牛奶', foods: [{ name: '面粉', amount: '50g' }, { name: '鸡蛋', amount: '2个' }, { name: '菠菜', amount: '50g' }], calories: 400, nutrition: { protein: 20, carbs: 40, fat: 15, fiber: 3 }, tags: ['快手', '家常'] }, lunch: { name: '玉米 + 香煎鳕鱼 + 西兰花', foods: [{ name: '玉米', amount: '1根' }, { name: '鳕鱼', amount: '150g' }, { name: '西兰花', amount: '200g' }], calories: 450, nutrition: { protein: 35, carbs: 40, fat: 12, fiber: 5 }, tags: ['低脂', '高蛋白', 'Omega-3'] }, dinner: { name: '蔬菜汤面 + 卤牛肉', foods: [{ name: '荞麦面', amount: '80g' }, { name: '青菜', amount: '100g' }, { name: '瘦牛肉', amount: '80g' }], calories: 420, nutrition: { protein: 28, carbs: 48, fat: 10, fiber: 4 }, tags: ['低GI', '饱腹'] }, snack: { name: '蓝莓 + 酸奶', foods: [{ name: '蓝莓', amount: '50g' }, { name: '酸奶', amount: '100g' }], calories: 100, nutrition: { protein: 4, carbs: 15, fat: 2, fiber: 1 }, tags: ['抗氧化', '益生菌'] } },
    { day: '周五', breakfast: { name: '燕麦香蕉奶昔 + 坚果', foods: [{ name: '燕麦片', amount: '30g' }, { name: '香蕉', amount: '1根' }, { name: '牛奶', amount: '200ml' }], calories: 380, nutrition: { protein: 14, carbs: 55, fat: 12, fiber: 5 }, tags: ['快手', '高纤维'] }, lunch: { name: '糙米饭 + 红烧豆腐 + 凉拌芹菜', foods: [{ name: '糙米', amount: '100g' }, { name: '北豆腐', amount: '150g' }, { name: '芹菜', amount: '200g' }], calories: 480, nutrition: { protein: 22, carbs: 65, fat: 10, fiber: 6 }, tags: ['植物蛋白', '高纤维'] }, dinner: { name: '三鲜水饺 + 醋溜白菜', foods: [{ name: '饺子皮', amount: '100g' }, { name: '虾仁', amount: '50g' }, { name: '白菜', amount: '150g' }], calories: 450, nutrition: { protein: 25, carbs: 55, fat: 12, fiber: 4 }, tags: ['家常', '好消化'] } },
    { day: '周六', breakfast: { name: '全麦煎饼 + 豆腐脑', foods: [{ name: '全麦面粉', amount: '50g' }, { name: '豆腐', amount: '200g' }], calories: 350, nutrition: { protein: 18, carbs: 42, fat: 10, fiber: 4 }, tags: ['植物蛋白', '快手'] }, lunch: { name: '荞麦冷面 + 鸡胸肉 + 黄瓜丝', foods: [{ name: '荞麦面', amount: '100g' }, { name: '鸡胸肉', amount: '100g' }, { name: '黄瓜', amount: '100g' }], calories: 420, nutrition: { protein: 32, carbs: 50, fat: 8, fiber: 4 }, tags: ['清爽', '高蛋白', '低脂'] }, dinner: { name: '山药炖鸡 + 清炒油麦菜', foods: [{ name: '鸡腿肉', amount: '100g' }, { name: '山药', amount: '100g' }, { name: '油麦菜', amount: '150g' }], calories: 400, nutrition: { protein: 28, carbs: 30, fat: 15, fiber: 4 }, tags: ['滋补', '家常'] } },
    { day: '周日', breakfast: { name: '鸡蛋三明治 + 圣女果 + 牛奶', foods: [{ name: '全麦面包', amount: '2片' }, { name: '鸡蛋', amount: '1个' }, { name: '生菜', amount: '30g' }], calories: 350, nutrition: { protein: 16, carbs: 38, fat: 12, fiber: 4 }, tags: ['快手', '高蛋白'] }, lunch: { name: '糙米饭 + 清蒸鲈鱼 + 干煸四季豆', foods: [{ name: '糙米', amount: '100g' }, { name: '鲈鱼', amount: '150g' }, { name: '四季豆', amount: '200g' }], calories: 500, nutrition: { protein: 35, carbs: 55, fat: 12, fiber: 6 }, tags: ['高蛋白', '家常'] }, dinner: { name: '菌菇汤 + 虾仁炒西兰花', foods: [{ name: '香菇', amount: '50g' }, { name: '木耳', amount: '30g' }, { name: '虾仁', amount: '80g' }], calories: 380, nutrition: { protein: 28, carbs: 25, fat: 15, fiber: 5 }, tags: ['提高免疫', '低脂'] }, snack: { name: '猕猴桃', foods: [{ name: '猕猴桃', amount: '2个' }], calories: 100, nutrition: { protein: 1, carbs: 20, fat: 1, fiber: 3 }, tags: ['维生素C之王', '加餐'] } },
  ],
};

export default healthyFoods;
