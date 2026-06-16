import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChefHat, Ban, Settings2, RefreshCw, Check, Flame } from 'lucide-react';
import type { Recommendation, Recipe } from '../types';
import { RecommendationDisplay, InitialState, LoadingState } from '../components/recommendation/RecommendationCard';
import { formatDate } from '../utils/format';
import { loadRecipes, saveRecommendation, getRecommendationHistory, deleteRecommendation } from '../utils/storage';
import { LOADING_MESSAGES } from '../utils/constants';

// 食材同义词映射表
const INGREDIENT_SYNONYMS: Record<string, string[]> = {
  // 肉类
  '鸡肉': ['鸡胸肉', '鸡腿肉', '鸡翅', '鸡肉', '鸡丁', '鸡块', '鸡'],
  '猪肉': ['五花肉', '瘦肉', '猪肉', '里脊', '排骨', '肉末', '肉丝', '肉片', '猪蹄', '猪肝'],
  '牛肉': ['牛肉', '牛腩', '牛柳', '肥牛', '牛肉片', '牛肉丝', '牛肉末'],
  '羊肉': ['羊肉', '羊排', '羊腿', '肥羊'],
  '鱼肉': ['鱼肉', '鲈鱼', '鳕鱼', '三文鱼', '鲫鱼', '草鱼', '鲤鱼', '带鱼', '黄鱼', '鱼'],
  '虾': ['虾', '虾仁', '基围虾', '大虾', '龙虾'],
  '蛋': ['鸡蛋', '鸭蛋', '蛋', '蛋白', '蛋黄'],
  
  // 蔬菜类
  '青菜': ['青菜', '小白菜', '油菜', '生菜', '菠菜', '油麦菜', '空心菜'],
  '白菜': ['白菜', '大白菜', '小白菜'],
  '萝卜': ['萝卜', '白萝卜', '红萝卜', '胡萝卜'],
  '豆': ['豆腐', '豆干', '豆皮', '豆芽', '豆角', '毛豆', '黄豆', '黑豆'],
  '菇': ['香菇', '蘑菇', '金针菇', '平菇', '杏鲍菇', '木耳', '银耳'],
  '瓜': ['黄瓜', '冬瓜', '南瓜', '丝瓜', '苦瓜', '西瓜', '哈密瓜'],
  
  // 主食类
  '米': ['大米', '小米', '糯米', '米饭', '米粉'],
  '面': ['面条', '面粉', '面皮', '面'],
  
  // 调料类
  '椒': ['辣椒', '青椒', '红椒', '花椒', '胡椒', '尖椒', '彩椒'],
  '葱': ['葱', '大葱', '小葱', '洋葱', '葱花'],
  '姜': ['姜', '生姜', '姜片', '姜末'],
  '蒜': ['蒜', '大蒜', '蒜末', '蒜苗'],
};

// 检查两个食材是否匹配（支持同义词）
function isIngredientMatch(ingredientName: string, searchTerm: string): boolean {
  const ingLower = ingredientName.toLowerCase();
  const searchLower = searchTerm.toLowerCase();
  
  // 直接包含匹配
  if (ingLower.includes(searchLower) || searchLower.includes(ingLower)) {
    return true;
  }
  
  // 同义词匹配
  for (const [key, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
    // 如果搜索词是同义词组的关键字
    if (searchLower.includes(key.toLowerCase()) || key.toLowerCase().includes(searchLower)) {
      // 检查食材是否在同义词列表中
      if (synonyms.some(s => ingLower.includes(s.toLowerCase()))) {
        return true;
      }
    }
    // 如果食材在同义词列表中，搜索词是另一个同义词
    if (synonyms.some(s => ingLower.includes(s.toLowerCase()))) {
      if (synonyms.some(s => searchLower.includes(s.toLowerCase()) || s.toLowerCase().includes(searchLower))) {
        return true;
      }
    }
  }
  
  return false;
}

const RecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<'initial' | 'loading' | 'result'>('initial');
  const [currentRecommendation, setCurrentRecommendation] = useState<Recommendation | null>(null);
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [rerollCount, setRerollCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  
  // 筛选状态
  const [showFilters, setShowFilters] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [excludedFoods, setExcludedFoods] = useState<string[]>([]);
  const [recommendCount, setRecommendCount] = useState(3);
  const [targetCalories, setTargetCalories] = useState<number | undefined>(undefined);
  const [calorieTolerance, setCalorieTolerance] = useState(200); // 默认误差范围200卡
  const [tempIngredient, setTempIngredient] = useState('');
  const [tempExcluded, setTempExcluded] = useState('');
  
  // 保留状态
  const [keptRecipes, setKeptRecipes] = useState<Recipe[]>([]);
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setHistory(getRecommendationHistory());
  }, []);

  // 添加已有食材
  const addAvailableIngredient = () => {
    if (tempIngredient.trim() && !availableIngredients.includes(tempIngredient.trim())) {
      setAvailableIngredients([...availableIngredients, tempIngredient.trim()]);
      setTempIngredient('');
    }
  };

  // 移除已有食材
  const removeAvailableIngredient = (ingredient: string) => {
    setAvailableIngredients(availableIngredients.filter(i => i !== ingredient));
  };

  // 添加不想吃的食物
  const addExcludedFood = () => {
    if (tempExcluded.trim() && !excludedFoods.includes(tempExcluded.trim())) {
      setExcludedFoods([...excludedFoods, tempExcluded.trim()]);
      setTempExcluded('');
    }
  };

  // 移除不想吃的食物
  const removeExcludedFood = (food: string) => {
    setExcludedFoods(excludedFoods.filter(f => f !== food));
  };

  // 筛选菜谱
  const filterRecipes = useCallback((recipes: Recipe[]) => {
    return recipes.filter(recipe => {
      // 排除不想吃的食物
      const isExcluded = excludedFoods.some(excluded => 
        recipe.name.includes(excluded) || 
        recipe.ingredients.some(ing => ing.name.includes(excluded))
      );
      if (isExcluded) return false;

      // 如果有指定食材，优先推荐包含这些食材的菜
      // 但不强制要求，只是排序时会优先
      return true;
    });
  }, [excludedFoods]);

  // 计算菜谱与已有食材的匹配数量（支持同义词）
  const getMatchCount = useCallback((recipe: Recipe): number => {
    if (availableIngredients.length === 0) return 0;
    return recipe.ingredients.filter(ing => 
      availableIngredients.some(avail => isIngredientMatch(ing.name, avail))
    ).length;
  }, [availableIngredients]);

  // 根据食材匹配度排序，匹配度高的优先
  const sortByIngredientMatch = useCallback((recipes: Recipe[]) => {
    if (availableIngredients.length === 0) return recipes;
    
    // 计算每个菜谱的匹配分数
    const scoredRecipes = recipes.map(recipe => {
      const score = getMatchCount(recipe);
      return { recipe, score };
    });
    
    // 按匹配分数降序排序，分数相同的随机排序
    return scoredRecipes
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score; // 分数高的在前
        }
        return Math.random() - 0.5; // 分数相同则随机
      })
      .map(item => item.recipe);
  }, [availableIngredients, getMatchCount]);

  // 计算菜谱组合的卡路里总和
  const getTotalCalories = useCallback((recipes: Recipe[]): number => {
    return recipes.reduce((sum, r) => sum + (r.calories || 0), 0);
  }, []);

  // 根据目标卡路里筛选和排序菜谱组合
  const filterByCalories = useCallback((recipes: Recipe[]): Recipe[] => {
    if (!targetCalories || recipes.length === 0) return recipes;
    
    // 为每道菜计算一个"理想度"分数
    const scoredRecipes = recipes.map(recipe => {
      const currentTotal = getTotalCalories([...keptRecipes, recipe]);
      const remainingCount = recommendCount - keptRecipes.length - 1;
      
      // 预估剩余菜品的平均卡路里
      const avgRemainingCalories = remainingCount > 0 
        ? (targetCalories - getTotalCalories(keptRecipes) - (recipe.calories || 0)) / remainingCount
        : 0;
      
      // 计算与目标的差距
      const projectedTotal = getTotalCalories([...keptRecipes, recipe]) + (avgRemainingCalories * remainingCount);
      const diff = Math.abs(projectedTotal - targetCalories);
      
      return { recipe, score: diff };
    });
    
    // 按差距从小到大排序
    return scoredRecipes
      .sort((a, b) => a.score - b.score)
      .map(item => item.recipe);
  }, [targetCalories, keptRecipes, recommendCount, getTotalCalories]);

  const generateRecommendation = useCallback(() => {
    setState('loading');
    setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

    const recipes = loadRecipes();
    let filteredRecipes = filterRecipes(recipes);
    
    // 如果有卡路里目标，先过滤掉明显超标的单个菜品
    if (targetCalories && keptRecipes.length < recommendCount) {
      const avgCaloriesPerDish = (targetCalories - getTotalCalories(keptRecipes)) / (recommendCount - keptRecipes.length);
      filteredRecipes = filteredRecipes.filter(r => {
        if (!r.calories) return true; // 没有卡路里数据的保留
        return r.calories <= avgCaloriesPerDish + calorieTolerance;
      });
    }
    
    // 排除已保留的菜
    const keptIds = new Set(keptRecipes.map(r => r.id));
    const availableRecipes = filteredRecipes.filter(r => !keptIds.has(r.id));
    
    const meatRecipes = availableRecipes.filter((r: Recipe) => r.category === 'meat');
    const vegRecipes = availableRecipes.filter((r: Recipe) => r.category === 'vegetable');
    const dessertRecipes = availableRecipes.filter((r: Recipe) => r.category === 'dessert');

    // 计算需要推荐的数量
    const neededCount = recommendCount - keptRecipes.length;
    
    if (availableRecipes.length < neededCount) {
      alert('符合条件的菜谱不足，请减少排除条件或添加更多菜谱！');
      setState('initial');
      return;
    }

    setTimeout(() => {
      let selectedRecipes: Recipe[] = [...keptRecipes];
      
      // 根据已有食材排序
      let sortedMeat = sortByIngredientMatch([...meatRecipes]);
      let sortedVeg = sortByIngredientMatch([...vegRecipes]);
      let sortedDessert = sortByIngredientMatch([...dessertRecipes]);
      
      // 如果有卡路里目标，再按卡路里匹配度排序
      if (targetCalories) {
        sortedMeat = filterByCalories(sortedMeat);
        sortedVeg = filterByCalories(sortedVeg);
        sortedDessert = filterByCalories(sortedDessert);
      }
      
      // 智能推荐逻辑
      const remainingSlots = neededCount;
      
      if (remainingSlots > 0) {
        // 优先荤素搭配
        if (sortedMeat.length > 0 && sortedVeg.length > 0) {
          const meatCount = Math.min(Math.ceil(remainingSlots / 2), sortedMeat.length);
          const vegCount = Math.min(remainingSlots - meatCount, sortedVeg.length);
          
          selectedRecipes = [...selectedRecipes, ...sortedMeat.slice(0, meatCount)];
          selectedRecipes = [...selectedRecipes, ...sortedVeg.slice(0, vegCount)];
        } else if (sortedMeat.length > 0) {
          selectedRecipes = [...selectedRecipes, ...sortedMeat.slice(0, remainingSlots)];
        } else if (sortedVeg.length > 0) {
          selectedRecipes = [...selectedRecipes, ...sortedVeg.slice(0, remainingSlots)];
        } else if (sortedDessert.length > 0) {
          selectedRecipes = [...selectedRecipes, ...sortedDessert.slice(0, remainingSlots)];
        }
      }
      
      // 如果数量不够，从已排序的列表中补充
      const allSortedRecipes = [...sortedMeat, ...sortedVeg, ...sortedDessert]
        .filter(r => !selectedRecipes.find(sr => sr.id === r.id));
      
      while (selectedRecipes.length < recommendCount && allSortedRecipes.length > 0) {
        const nextRecipe = allSortedRecipes.shift();
        if (nextRecipe && !selectedRecipes.find(r => r.id === nextRecipe.id)) {
          selectedRecipes.push(nextRecipe);
        }
      }

      const hour = new Date().getHours();
      const mealType = hour >= 5 && hour < 10 ? 'breakfast' : hour >= 10 && hour < 14 ? 'lunch' : hour >= 17 && hour < 21 ? 'dinner' : 'lunch';

      const recommendation: Recommendation = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        date: Date.now(),
        recipes: selectedRecipes.slice(0, recommendCount) as [Recipe, Recipe, Recipe],
        isFavorite: false,
        note: '',
        mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
      };

      setCurrentRecommendation(recommendation);
      setCurrentRecipes(selectedRecipes.slice(0, recommendCount));
      setState('result');
      setRerollCount(0);
    }, 1500);
  }, [availableIngredients, excludedFoods, recommendCount, keptRecipes, targetCalories, calorieTolerance, filterRecipes, sortByIngredientMatch, filterByCalories, getTotalCalories]);

  // 保留某个菜
  const handleKeepRecipe = (recipe: Recipe) => {
    if (!keptRecipes.find(r => r.id === recipe.id)) {
      setKeptRecipes([...keptRecipes, recipe]);
    }
  };

  // 取消保留某个菜
  const handleUnkeepRecipe = (recipe: Recipe) => {
    setKeptRecipes(keptRecipes.filter(r => r.id !== recipe.id));
  };

  // 重新推荐单个菜
  const handleRerollSingle = (recipeToReplace: Recipe) => {
    const recipes = loadRecipes();
    const filteredRecipes = filterRecipes(recipes);
    const keptIds = new Set([...keptRecipes.map(r => r.id), ...currentRecipes.map(r => r.id)]);
    const availableRecipes = filteredRecipes.filter(r => !keptIds.has(r.id));
    
    if (availableRecipes.length === 0) {
      alert('没有更多可选菜谱了！');
      return;
    }
    
    const newRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    const updatedRecipes = currentRecipes.map(r => 
      r.id === recipeToReplace.id ? newRecipe : r
    );
    
    setCurrentRecipes(updatedRecipes);
    if (currentRecommendation) {
      setCurrentRecommendation({
        ...currentRecommendation,
        recipes: updatedRecipes as [Recipe, Recipe, Recipe]
      });
    }
    setRerollCount(prev => prev + 1);
  };

  const handleReroll = () => {
    setRerollCount((prev) => prev + 1);
    // 保留已保留的菜，重新推荐其他的
    generateRecommendation();
  };

  const handleFavorite = () => {
    if (currentRecommendation) {
      const updated = {
        ...currentRecommendation,
        isFavorite: !currentRecommendation.isFavorite,
      };
      setCurrentRecommendation(updated);
      saveRecommendation(updated);
      setHistory(getRecommendationHistory());
    }
  };

  const handleDeleteHistory = (id: string) => {
    deleteRecommendation(id);
    setHistory(getRecommendationHistory());
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-orange-50 to-background">
      <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-1">今日推荐</h1>
        <p className="text-white/80 text-sm">
          {state === 'result' ? '为你精心搭配的三餐' : '点击按钮，帮你决定今天吃什么'}
        </p>
      </div>

      <div className="px-4 -mt-4">
        <AnimatePresence mode="wait">
          {state === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* 筛选面板 */}
              <motion.div 
                className="bg-white rounded-2xl p-4 shadow-sm"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 size={20} className="text-primary" />
                    <span className="font-semibold text-gray-800">推荐设置</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {showFilters ? '收起' : '展开'}
                  </span>
                </button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 mt-4 overflow-hidden"
                    >
                      {/* 已有食材 */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <ChefHat size={16} className="text-green-500" />
                          已有食材（可选）
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={tempIngredient}
                            onChange={(e) => setTempIngredient(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addAvailableIngredient()}
                            placeholder="输入食材，如：鸡蛋、番茄"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
                          />
                          <button
                            type="button"
                            onClick={addAvailableIngredient}
                            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableIngredients.map((ing) => (
                            <span
                              key={ing}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                            >
                              {ing}
                              <button onClick={() => removeAvailableIngredient(ing)}>
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 不想吃的食物 */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Ban size={16} className="text-red-500" />
                          不想吃（可选）
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={tempExcluded}
                            onChange={(e) => setTempExcluded(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addExcludedFood()}
                            placeholder="输入不想吃的菜或食材"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
                          />
                          <button
                            type="button"
                            onClick={addExcludedFood}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {excludedFoods.map((food) => (
                            <span
                              key={food}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                            >
                              {food}
                              <button onClick={() => removeExcludedFood(food)}>
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 推荐数量 */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <span>推荐数量</span>
                        </label>
                        <div className="flex gap-2">
                          {[2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setRecommendCount(num)}
                              className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                                recommendCount === num
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              {num}道
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 卡路里目标 */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Flame size={16} className="text-orange-500" />
                          目标卡路里（可选）
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="number"
                            value={targetCalories || ''}
                            onChange={(e) => setTargetCalories(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="如：800"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
                          />
                          <span className="flex items-center text-sm text-gray-500">kcal</span>
                        </div>
                        {targetCalories && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>误差范围：</span>
                            <input
                              type="range"
                              min="50"
                              max="500"
                              step="50"
                              value={calorieTolerance}
                              onChange={(e) => setCalorieTolerance(Number(e.target.value))}
                              className="flex-1"
                            />
                            <span>±{calorieTolerance}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <InitialState onStart={generateRecommendation} loading={false} />
            </motion.div>
          )}

          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState message={loadingMessage} />
            </motion.div>
          )}

          {state === 'result' && currentRecommendation && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {rerollCount >= 3 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-card p-3 text-sm text-yellow-800 text-center">
                  已经推荐了{rerollCount + 1}次啦，要不要换个口味试试？
                </div>
              )}

              {/* 食材匹配提示 */}
              {availableIngredients.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-card p-3">
                  <p className="text-sm text-blue-800">
                    根据食材「{availableIngredients.join('、')}」推荐
                  </p>
                </div>
              )}

              {/* 卡路里提示 */}
              {targetCalories && (
                <div className="bg-orange-50 border border-orange-200 rounded-card p-3">
                  <p className="text-sm text-orange-800">
                    目标卡路里：{targetCalories} kcal | 
                    当前推荐：{getTotalCalories(currentRecipes)} kcal | 
                    差距：{Math.abs(getTotalCalories(currentRecipes) - targetCalories)} kcal
                  </p>
                </div>
              )}

              {/* 保留的菜品提示 */}
              {keptRecipes.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-card p-3">
                  <p className="text-sm text-green-800">
                    已保留 {keptRecipes.length} 道菜：{keptRecipes.map(r => r.name).join('、')}
                  </p>
                </div>
              )}

              {/* 推荐结果卡片 */}
              <div className="grid gap-4">
                {currentRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  >
                    <div className="flex gap-4">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                          <div className="flex gap-1">
                            {recipe.calories && (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                {recipe.calories}kcal
                              </span>
                            )}
                            {availableIngredients.length > 0 && getMatchCount(recipe) > 0 && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                匹配{getMatchCount(recipe)}种食材
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {recipe.time}分钟 · {recipe.difficulty === 'easy' ? '简单' : recipe.difficulty === 'medium' ? '中等' : '困难'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {recipe.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex gap-2 mt-3">
                      {keptRecipes.find(r => r.id === recipe.id) ? (
                        <button
                          onClick={() => handleUnkeepRecipe(recipe)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Check size={16} />
                          已保留
                        </button>
                      ) : (
                        <button
                          onClick={() => handleKeepRecipe(recipe)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-green-100 hover:text-green-700 transition-colors"
                        >
                          <Check size={16} />
                          保留
                        </button>
                      )}
                      <button
                        onClick={() => handleRerollSingle(recipe)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors"
                      >
                        <RefreshCw size={16} />
                        换一道
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 整体操作 */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReroll}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-medium shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  重新推荐全部
                </button>
                <button
                  onClick={handleFavorite}
                  className={`px-4 py-3 rounded-xl font-medium shadow-lg transition-all ${
                    currentRecommendation.isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  {currentRecommendation.isFavorite ? '已收藏' : '收藏'}
                </button>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full py-2 text-center text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  {showHistory ? '收起历史记录' : '查看历史推荐'}
                </button>

                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 mt-4"
                  >
                    {history.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">暂无历史记录</div>
                    ) : (
                      history.slice(0, 5).map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-white rounded-card p-3 card-shadow flex items-center gap-3"
                        >
                          <div className="flex-1 cursor-pointer" onClick={() => {
                            setCurrentRecommendation(rec);
                            setCurrentRecipes(rec.recipes);
                            setState('result');
                          }}>
                            <p className="text-sm text-gray-500">{formatDate(rec.date)}</p>
                            <p className="text-gray-800 font-medium truncate">
                              {rec.recipes.map((r: Recipe) => r.name).join(' + ')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteHistory(rec.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            删除
                          </button>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecommendationPage;
