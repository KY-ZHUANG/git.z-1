import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HealthyFood, NutritionTip, WeeklyPlan } from '../../types';
import { FOOD_CATEGORIES } from '../../utils/constants';
import { GIBadge } from '../common/Badges';
import { SearchIcon } from '../common/Icons';
import { getFoodImage } from '../../utils/image';

interface NutritionCarouselProps {
  tips: NutritionTip[];
}

export const NutritionCarousel: React.FC<NutritionCarouselProps> = ({ tips }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="w-full flex-shrink-0"
          >
            <div className="relative overflow-hidden rounded-2xl p-5 text-white"
              style={{
                background: tip.id === '1' 
                  ? 'linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #06B6D4 100%)'
                  : tip.id === '2'
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EF4444 100%)'
              }}
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/10 blur-xl" />
              
              <div className="relative flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                  {tip.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
                  <p className="text-sm text-white/90 leading-relaxed">{tip.content}</p>
                  {tip.source && (
                    <p className="text-xs text-white/60 mt-3 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      来源：{tip.source}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center gap-2 mt-5">
                {tips.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PrinciplesGridProps {
  onSelect: (principle: string) => void;
}

export const PrinciplesGrid: React.FC<PrinciplesGridProps> = ({ onSelect }) => {
  const principles = [
    { id: 'oil', icon: '🫗', title: '少油', desc: '每日<25-30g', bg: 'from-orange-50 to-amber-50', text: 'text-orange-600' },
    { id: 'salt', icon: '🧂', title: '少盐', desc: '每日<5g', bg: 'from-violet-50 to-purple-50', text: 'text-violet-600' },
    { id: 'sugar', icon: '🍬', title: '少糖', desc: '每日<25g', bg: 'from-pink-50 to-rose-50', text: 'text-pink-600' },
    { id: 'fiber', icon: '🌾', title: '高纤维', desc: '每日>25g', bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600' },
    { id: 'protein', icon: '💪', title: '优质蛋白', desc: '15-20%', bg: 'from-blue-50 to-indigo-50', text: 'text-blue-600' },
    { id: 'gi', icon: '📊', title: '低GI主食', desc: 'GI<55', bg: 'from-teal-50 to-cyan-50', text: 'text-teal-600' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {principles.map((p, index) => (
        <motion.button
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -2 }}
          onClick={() => onSelect(p.id)}
          className={`card card-press p-4 bg-gradient-to-br ${p.bg}`}
        >
          <div className="text-2xl mb-2">{p.icon}</div>
          <h3 className={`font-bold text-sm ${p.text}`}>{p.title}</h3>
          <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
        </motion.button>
      ))}
    </div>
  );
};

interface FoodCardProps {
  food: HealthyFood;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onFavorite, isFavorite }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      className="card card-press p-3.5 flex gap-3.5 items-center"
    >
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-emerald-50 flex-shrink-0">
        <img
          src={getFoodImage(food.id, food.name)}
          alt={food.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-800 truncate">{food.name}</h3>
          <GIBadge gi={food.gi} level={food.giLevel} />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-orange-500">🔥</span>
            {food.calories}kcal
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-200" />
          <span className="flex items-center gap-1">
            <span className="text-blue-500">💪</span>
            {food.protein}g蛋白
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {food.benefits.slice(0, 2).map((b) => (
            <span key={b} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
              {b}
            </span>
          ))}
        </div>
      </div>
      {onFavorite && (
        <motion.button
          onClick={() => onFavorite(food.id)}
          whileTap={{ scale: 0.9 }}
          className={`p-2 -mr-2 rounded-full transition-all ${
            isFavorite 
              ? 'text-rose-500 bg-rose-50' 
              : 'text-gray-300 hover:text-rose-400 hover:bg-rose-50'
          }`}
        >
          <svg 
            className="w-5 h-5" 
            fill={isFavorite ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
};

interface FoodLibraryProps {
  foods: HealthyFood[];
  favorites?: string[];
  onFavoriteToggle?: (id: string) => void;
}

export const FoodLibrary: React.FC<FoodLibraryProps> = ({
  foods,
  favorites = [],
  onFavoriteToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFoods = useMemo(() => {
    let result = foods;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.benefits.some((b) => b.includes(query))
      );
    }

    if (activeCategory !== 'all') {
      result = result.filter((f) => f.category === activeCategory);
    }

    return result;
  }, [foods, searchQuery, activeCategory]);

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索食材名称、功效..."
          className="search-bar w-full"
        />
      </div>

      {/* 分类标签 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        {FOOD_CATEGORIES.map((cat, index) => {
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setActiveCategory(cat.id)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white text-gray-600 shadow-soft hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* 食材列表 */}
      <div className="space-y-3">
        {filteredFoods.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FoodCard
              food={food}
              isFavorite={favorites.includes(food.id)}
              onFavorite={onFavoriteToggle}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface WeeklyPlanViewerProps {
  plan: WeeklyPlan;
}

export const WeeklyPlanViewer: React.FC<WeeklyPlanViewerProps> = ({ plan }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const currentDay = plan.days[selectedDay];

  const totalCalories = useMemo(() => {
    return (
      currentDay.breakfast.calories +
      currentDay.lunch.calories +
      currentDay.dinner.calories +
      (currentDay.snack?.calories || 0)
    );
  }, [currentDay]);

  const meals = [
    { key: 'breakfast', label: '早餐', icon: '🌅', color: 'from-amber-50 to-orange-50', accent: 'text-amber-600' },
    { key: 'lunch', label: '午餐', icon: '☀️', color: 'from-orange-50 to-rose-50', accent: 'text-orange-600' },
    { key: 'dinner', label: '晚餐', icon: '🌙', color: 'from-indigo-50 to-blue-50', accent: 'text-indigo-600' },
    ...(currentDay.snack ? [{ key: 'snack', label: '加餐', icon: '🍎', color: 'from-rose-50 to-pink-50', accent: 'text-rose-600' }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* 日期选择器 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        {plan.days.map((day, index) => {
          const isActive = selectedDay === index;
          return (
            <motion.button
              key={day.day}
              onClick={() => setSelectedDay(index)}
              whileTap={{ scale: 0.95 }}
              className={`relative px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white text-gray-600 shadow-soft hover:bg-gray-50'
              }`}
            >
              {day.day}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3"
        >
          {meals.map((meal, idx) => {
            const mealData = currentDay[meal.key as keyof typeof currentDay] as typeof currentDay.breakfast;
            return (
              <motion.div
                key={meal.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`card p-4.5 bg-gradient-to-br ${meal.color}`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl">{meal.icon}</span>
                  <span className={`font-bold ${meal.accent}`}>{meal.label}</span>
                  <span className="text-xs text-gray-500 ml-auto font-medium bg-white/60 px-2 py-1 rounded-full">
                    {mealData.calories} kcal
                  </span>
                </div>
                <p className="text-gray-800 font-bold">{mealData.name}</p>
                <p className="text-sm text-gray-600 mt-1.5">
                  {mealData.foods.map((f) => f.name).join(' + ')}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {mealData.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-white/70 text-emerald-700 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* 营养数据 */}
                <div className="flex gap-4 mt-3.5 pt-3 border-t border-white/50">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800">{mealData.nutrition.protein}g</p>
                    <p className="text-[10px] text-gray-500">蛋白质</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800">{mealData.nutrition.carbs}g</p>
                    <p className="text-[10px] text-gray-500">碳水</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800">{mealData.nutrition.fat}g</p>
                    <p className="text-[10px] text-gray-500">脂肪</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800">{mealData.nutrition.fiber}g</p>
                    <p className="text-[10px] text-gray-500">纤维</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* 今日总热量 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: meals.length * 0.08 + 0.1 }}
            className="card p-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">今日总热量</p>
                <p className="text-3xl font-bold mt-1">{totalCalories}</p>
                <p className="text-white/70 text-xs">千卡 · 均衡搭配</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                🥗
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NutritionCarousel;
