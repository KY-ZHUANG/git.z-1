import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChefHat, Ban, Settings2, RefreshCw, Check, Flame, ArrowLeft } from 'lucide-react';
import type { Recommendation, Recipe } from '../types';
import { RecommendationDisplay, InitialState, LoadingState } from '../components/recommendation/RecommendationCard';
import { formatDate } from '../utils/format';
import { loadRecipes, saveRecommendation, getRecommendationHistory, deleteRecommendation } from '../utils/storage';
import { LOADING_MESSAGES } from '../utils/constants';
import { getRecipeImage } from '../utils/image';

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
    
    // 从 sessionStorage 恢复状态
    const savedState = sessionStorage.getItem('recommendationState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.currentRecommendation) {
          setCurrentRecommendation(parsed.currentRecommendation);
          setCurrentRecipes(parsed.currentRecipes || []);
          setKeptRecipes(parsed.keptRecipes || []);
          setAvailableIngredients(parsed.availableIngredients || []);
          setExcludedFoods(parsed.excludedFoods || []);
          setTargetCalories(parsed.targetCalories);
          setRecommendCount(parsed.recommendCount || 3);
          setState('result');
        }
      } catch (e) {
        console.error('Failed to restore state:', e);
      }
    }
  }, []);

  // 保存状态到 sessionStorage
  useEffect(() => {
    if (state === 'result' && currentRecommendation) {
      const stateToSave = {
        currentRecommendation,
        currentRecipes,
        keptRecipes,
        availableIngredients,
        excludedFoods,
        targetCalories,
        recommendCount,
      };
      sessionStorage.setItem('recommendationState', JSON.stringify(stateToSave));
    }
  }, [state, currentRecommendation, currentRecipes, keptRecipes, availableIngredients, excludedFoods, targetCalories, recommendCount]);

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
    // 直接进入加载状态重新生成推荐
    // generateRecommendation 会自动处理 keptRecipes
    setState('loading');
    setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    
    setTimeout(() => {
      const recipes = loadRecipes();
      const filteredRecipes = filterRecipes(recipes);
      
      // 排除已保留的菜
      const keptIds = new Set(keptRecipes.map(r => r.id));
      const availableRecipes = filteredRecipes.filter(r => !keptIds.has(r.id));
      
      const meatRecipes = availableRecipes.filter((r: Recipe) => r.category === 'meat');
      const vegRecipes = availableRecipes.filter((r: Recipe) => r.category === 'vegetable');
      const dessertRecipes = availableRecipes.filter((r: Recipe) => r.category === 'dessert');

      const neededCount = recommendCount - keptRecipes.length;
      
      if (availableRecipes.length < neededCount) {
        alert('符合条件的菜谱不足，请减少排除条件或添加更多菜谱！');
        setState('result');
        return;
      }

      let selectedRecipes: Recipe[] = [...keptRecipes];
      
      // 随机排序
      const shuffledMeat = [...meatRecipes].sort(() => Math.random() - 0.5);
      const shuffledVeg = [...vegRecipes].sort(() => Math.random() - 0.5);
      const shuffledDessert = [...dessertRecipes].sort(() => Math.random() - 0.5);
      
      // 智能推荐逻辑
      const remainingSlots = neededCount;
      
      if (remainingSlots > 0) {
        // 优先荤素搭配
        if (shuffledMeat.length > 0 && shuffledVeg.length > 0) {
          const meatCount = Math.min(Math.ceil(remainingSlots / 2), shuffledMeat.length);
          const vegCount = Math.min(remainingSlots - meatCount, shuffledVeg.length);
          
          selectedRecipes = [...selectedRecipes, ...shuffledMeat.slice(0, meatCount)];
          selectedRecipes = [...selectedRecipes, ...shuffledVeg.slice(0, vegCount)];
        } else if (shuffledMeat.length > 0) {
          selectedRecipes = [...selectedRecipes, ...shuffledMeat.slice(0, remainingSlots)];
        } else if (shuffledVeg.length > 0) {
          selectedRecipes = [...selectedRecipes, ...shuffledVeg.slice(0, remainingSlots)];
        } else if (shuffledDessert.length > 0) {
          selectedRecipes = [...selectedRecipes, ...shuffledDessert.slice(0, remainingSlots)];
        }
      }
      
      // 如果数量不够，随机补充
      const allRecipes = [...shuffledMeat, ...shuffledVeg, ...shuffledDessert]
        .filter(r => !selectedRecipes.find(sr => sr.id === r.id));
      
      while (selectedRecipes.length < recommendCount && allRecipes.length > 0) {
        const randomIndex = Math.floor(Math.random() * allRecipes.length);
        const nextRecipe = allRecipes.splice(randomIndex, 1)[0];
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
    }, 1500);
  };

  const handleBackToInitial = () => {
    // 清除 sessionStorage 中的状态
    sessionStorage.removeItem('recommendationState');
    // 重置所有状态
    setState('initial');
    setCurrentRecommendation(null);
    setCurrentRecipes([]);
    setKeptRecipes([]);
    setRerollCount(0);
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
    <div className="min-h-screen pb-20 bg-background">
      {/* 头部区域 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500" />
        <div className="absolute -top-24 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-12 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-16 right-8 w-16 h-16 rounded-full bg-white/10 blur-xl" />
        
        <div className="relative px-4 pt-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 mb-1"
          >
            <span className="text-2xl">✨</span>
            <span className="text-white/70 text-sm font-medium">美食精灵</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            今日推荐
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/70 text-sm mt-1"
          >
            {state === 'result' ? '为你精心搭配的美味组合' : '点击按钮，帮你决定今天吃什么'}
          </motion.p>
        </div>
        
        {/* 底部弧形装饰 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 text-background">
            <path
              d="M0 48H1440V0C1440 0 1080 48 720 48C360 48 0 0 0 0V48Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10">
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
                className="card p-5"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 flex items-center justify-center">
                      <Settings2 size={20} className="text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 block">推荐设置</span>
                      <span className="text-xs text-gray-400">
                        {availableIngredients.length > 0 || excludedFoods.length > 0 
                          ? `已设置 ${availableIngredients.length + excludedFoods.length} 个条件`
                          : '个性化你的推荐'
                        }
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-5 mt-5 overflow-hidden"
                    >
                      {/* 已有食材 */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                          <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                            <ChefHat size={14} className="text-green-600" />
                          </div>
                          已有食材
                          <span className="text-xs font-normal text-gray-400">（优先推荐包含这些食材的菜）</span>
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={tempIngredient}
                            onChange={(e) => setTempIngredient(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addAvailableIngredient()}
                            placeholder="输入食材，如：鸡蛋、番茄"
                            className="input-field flex-1 text-sm"
                          />
                          <motion.button
                            type="button"
                            onClick={addAvailableIngredient}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary !py-2 !px-4 flex items-center justify-center"
                          >
                            <Plus size={18} />
                          </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableIngredients.map((ing) => (
                            <motion.span
                              key={ing}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="tag tag-success"
                            >
                              {ing}
                              <button onClick={() => removeAvailableIngredient(ing)} className="ml-1 opacity-60 hover:opacity-100">
                                <X size={12} />
                              </button>
                            </motion.span>
                          ))}
                          {availableIngredients.length === 0 && (
                            <span className="text-xs text-gray-400">暂未添加食材</span>
                          )}
                        </div>
                      </div>

                      {/* 不想吃的食物 */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                          <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
                            <Ban size={14} className="text-rose-600" />
                          </div>
                          不想吃
                          <span className="text-xs font-normal text-gray-400">（这些食材将被排除）</span>
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={tempExcluded}
                            onChange={(e) => setTempExcluded(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addExcludedFood()}
                            placeholder="输入不想吃的菜或食材"
                            className="input-field flex-1 text-sm"
                          />
                          <motion.button
                            type="button"
                            onClick={addExcludedFood}
                            whileTap={{ scale: 0.95 }}
                            className="bg-rose-500 hover:bg-rose-600 text-white rounded-button !py-2 !px-4 flex items-center justify-center transition-colors"
                          >
                            <Plus size={18} />
                          </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {excludedFoods.map((food) => (
                            <motion.span
                              key={food}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="tag tag-danger"
                            >
                              {food}
                              <button onClick={() => removeExcludedFood(food)} className="ml-1 opacity-60 hover:opacity-100">
                                <X size={12} />
                              </button>
                            </motion.span>
                          ))}
                          {excludedFoods.length === 0 && (
                            <span className="text-xs text-gray-400">暂未添加排除项</span>
                          )}
                        </div>
                      </div>

                      {/* 推荐数量 */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          推荐数量
                        </label>
                        <div className="flex gap-2">
                          {[2, 3, 4, 5].map((num) => (
                            <motion.button
                              key={num}
                              type="button"
                              onClick={() => setRecommendCount(num)}
                              whileTap={{ scale: 0.95 }}
                              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                                recommendCount === num
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-glow'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {num}道
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* 卡路里目标 */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                          <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Flame size={14} className="text-orange-600" />
                          </div>
                          目标卡路里
                          <span className="text-xs font-normal text-gray-400">（可选）</span>
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="number"
                            value={targetCalories || ''}
                            onChange={(e) => setTargetCalories(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="如：800"
                            className="input-field flex-1 text-sm"
                          />
                          <span className="flex items-center text-sm text-gray-500 font-medium">kcal</span>
                        </div>
                        {targetCalories && (
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 whitespace-nowrap">误差范围</span>
                            <input
                              type="range"
                              min="50"
                              max="500"
                              step="50"
                              value={calorieTolerance}
                              onChange={(e) => setCalorieTolerance(Number(e.target.value))}
                              className="flex-1 accent-primary"
                            />
                            <span className="text-xs font-semibold text-primary whitespace-nowrap">±{calorieTolerance}</span>
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
              {/* 返回按钮 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={handleBackToInitial}
                  className="flex items-center gap-2 px-4 py-2.5 card hover:shadow-card-hover transition-all"
                >
                  <ArrowLeft size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">重新设置</span>
                </button>
              </motion.div>

              {/* 状态提示卡片 */}
              {(rerollCount >= 3 || availableIngredients.length > 0 || targetCalories || keptRecipes.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="space-y-2"
                >
                  {rerollCount >= 3 && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-2xl p-3.5">
                      <p className="text-sm text-amber-800 font-medium">
                        💡 已经推荐了{rerollCount + 1}次啦，要不要调整一下筛选条件试试？
                      </p>
                    </div>
                  )}
                  {availableIngredients.length > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-2xl p-3.5">
                      <p className="text-sm text-emerald-800">
                        <span className="font-medium">🥗 食材匹配：</span>
                        根据「{availableIngredients.join('、')}」优先推荐
                      </p>
                    </div>
                  )}
                  {targetCalories && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 rounded-2xl p-3.5">
                      <p className="text-sm text-orange-800">
                        <span className="font-medium">🔥 卡路里目标：</span>
                        {targetCalories} kcal · 当前 {getTotalCalories(currentRecipes)} kcal · 
                        差距 {Math.abs(getTotalCalories(currentRecipes) - targetCalories)} kcal
                      </p>
                    </div>
                  )}
                  {keptRecipes.length > 0 && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/50 rounded-2xl p-3.5">
                      <p className="text-sm text-teal-800">
                        <span className="font-medium">✨ 已保留：</span>
                        {keptRecipes.map(r => r.name).join('、')}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* 推荐结果卡片 */}
              <div className="space-y-4 pt-2">
                {currentRecipes.map((recipe, index) => {
                  const isKept = keptRecipes.find(r => r.id === recipe.id);
                  const matchCount = getMatchCount(recipe);
                  
                  return (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.12, 
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      whileHover={{ y: -2 }}
                      className="card card-press overflow-hidden cursor-pointer group"
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                      <div className="relative">
                        <div className="flex gap-4 p-4">
                          <div className="relative w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden">
                            <img
                              src={getRecipeImage(recipe.id, recipe.name)}
                              alt={recipe.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            {/* 分类标签 */}
                            <div className="absolute top-2 left-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm ${
                                recipe.category === 'meat' 
                                  ? 'bg-rose-500/90 text-white' 
                                  : recipe.category === 'dessert'
                                  ? 'bg-amber-500/90 text-white'
                                  : 'bg-emerald-500/90 text-white'
                              }`}>
                                {recipe.category === 'meat' ? '荤' : recipe.category === 'dessert' ? '甜' : '素'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">
                                {recipe.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {recipe.time}分钟
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span>{recipe.difficulty === 'easy' ? '简单' : recipe.difficulty === 'medium' ? '中等' : '困难'}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5">
                              {recipe.calories && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-medium">
                                  🔥 {recipe.calories} kcal
                                </span>
                              )}
                              {availableIngredients.length > 0 && matchCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                                  ✓ 匹配{matchCount}种
                                </span>
                              )}
                              {recipe.tags.slice(0, 1).map((tag) => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div 
                          className="flex border-t border-gray-100" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              isKept ? handleUnkeepRecipe(recipe) : handleKeepRecipe(recipe);
                            }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-all ${
                              isKept
                                ? 'text-emerald-600 bg-emerald-50'
                                : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50'
                            }`}
                          >
                            <Check size={16} strokeWidth={isKept ? 2.5 : 2} />
                            {isKept ? '已保留' : '保留'}
                          </motion.button>
                          <div className="w-px bg-gray-100" />
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRerollSingle(recipe);
                            }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-gray-500 hover:text-primary hover:bg-primary/5 transition-all"
                          >
                            <RefreshCw size={16} />
                            换一道
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 营养概览 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: currentRecipes.length * 0.12 + 0.1 }}
                className="card p-5 bg-gradient-to-br from-warm-50 to-primary/5"
              >
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">营养搭配</p>
                  <p className="text-gradient font-bold text-lg">
                    荤素均衡 · 营养丰富 ✨
                  </p>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {currentRecipes.reduce((sum, r) => sum + r.time, 0)}
                      </p>
                      <p className="text-xs text-gray-500">分钟总耗时</p>
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {getTotalCalories(currentRecipes)}
                      </p>
                      <p className="text-xs text-gray-500">千卡热量</p>
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-500">
                        {currentRecipes.filter(r => r.category === 'vegetable').length}
                      </p>
                      <p className="text-xs text-gray-500">道素菜</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 整体操作 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: currentRecipes.length * 0.12 + 0.2 }}
                className="flex gap-3 pt-2"
              >
                <motion.button
                  onClick={handleReroll}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  重新推荐
                </motion.button>
                <motion.button
                  onClick={handleFavorite}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-14 h-[52px] rounded-button flex items-center justify-center transition-all ${
                    currentRecommendation.isFavorite
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-white text-gray-400 border border-gray-200 hover:text-rose-500 hover:border-rose-200'
                  }`}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill={currentRecommendation.isFavorite ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </motion.button>
              </motion.div>

              {/* 历史记录 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="pt-4 pb-6"
              >
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full py-3 text-center text-sm text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {showHistory ? '收起历史推荐' : '查看历史推荐'}
                </button>

                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2.5 mt-3 overflow-hidden"
                    >
                      {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          暂无历史推荐记录
                        </div>
                      ) : (
                        history.slice(0, 5).map((rec, idx) => (
                          <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="card p-3.5 flex items-center gap-3 hover:shadow-card-hover transition-shadow"
                          >
                            <div 
                              className="flex-1 cursor-pointer min-w-0" 
                              onClick={() => {
                                setCurrentRecommendation(rec);
                                setCurrentRecipes(rec.recipes);
                                setState('result');
                              }}
                            >
                              <p className="text-xs text-gray-400 mb-1">{formatDate(rec.date)}</p>
                              <p className="text-gray-700 font-medium truncate text-sm">
                                {rec.recipes.map((r: Recipe) => r.name).join(' + ')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteHistory(rec.id)}
                              className="text-gray-300 hover:text-red-500 p-2 -mr-2 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecommendationPage;
