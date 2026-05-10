import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HealthyFood, NutritionTip, WeeklyPlan } from '../../types';
import { FOOD_CATEGORIES } from '../../utils/constants';
import { GIBadge } from '../common/Badges';
import { SearchIcon } from '../common/Icons';

interface NutritionCarouselProps {
  tips: NutritionTip[];
}

export const NutritionCarousel: React.FC<NutritionCarouselProps> = ({ tips }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="w-full flex-shrink-0 px-4"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-card p-4 text-white">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{tip.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{tip.title}</h3>
                  <p className="text-sm text-white/90 leading-relaxed">{tip.content}</p>
                  {tip.source && (
                    <p className="text-xs text-white/70 mt-2">来源：{tip.source}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {tips.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex ? 'bg-white' : 'bg-white/40'
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
    { id: 'oil', icon: '🫗', title: '少油', desc: '每日<25-30g', color: '#FF9800' },
    { id: 'salt', icon: '🧂', title: '少盐', desc: '每日<5g', color: '#9C27B0' },
    { id: 'sugar', icon: '🍬', title: '少糖', desc: '每日<25g', color: '#E91E63' },
    { id: 'fiber', icon: '🌾', title: '高纤维', desc: '每日>25g', color: '#4CAF50' },
    { id: 'protein', icon: '💪', title: '优质蛋白', desc: '15-20%', color: '#2196F3' },
    { id: 'gi', icon: '📊', title: '低GI主食', desc: 'GI<55', color: '#FF5722' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {principles.map((p) => (
        <motion.button
          key={p.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(p.id)}
          className="bg-white rounded-card p-4 card-shadow hover:card-shadow-hover transition-shadow"
        >
          <div className="text-2xl mb-2">{p.icon}</div>
          <h3 className="font-medium text-gray-800 text-sm">{p.title}</h3>
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
      className="bg-white rounded-card p-3 card-shadow flex gap-3 items-center"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-800 truncate">{food.name}</h3>
          <GIBadge gi={food.gi} level={food.giLevel} />
        </div>
        <div className="flex gap-3 text-xs text-gray-500 mt-1">
          <span>{food.calories}kcal/100g</span>
          <span>蛋白质{food.protein}g</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {food.benefits.slice(0, 2).map((b) => (
            <span key={b} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
              {b}
            </span>
          ))}
        </div>
      </div>
      {onFavorite && (
        <button
          onClick={() => onFavorite(food.id)}
          className={`text-xl ${isFavorite ? 'text-red-500' : 'text-gray-300'}`}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
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
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索食材..."
          className="search-input"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {FOOD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`tab-item whitespace-nowrap ${
              activeCategory === cat.id ? 'active' : ''
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredFoods.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
            isFavorite={favorites.includes(food.id)}
            onFavorite={onFavoriteToggle}
          />
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {plan.days.map((day, index) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(index)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDay === index
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {day.day}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {[
            { key: 'breakfast', label: '早餐', icon: '🌅' },
            { key: 'lunch', label: '午餐', icon: '☀️' },
            { key: 'dinner', label: '晚餐', icon: '🌙' },
            ...(currentDay.snack ? [{ key: 'snack', label: '加餐', icon: '🍎' }] : []),
          ].map((meal) => {
            const mealData = currentDay[meal.key as keyof typeof currentDay] as typeof currentDay.breakfast;
            return (
              <div key={meal.key} className="bg-white rounded-card p-4 card-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{meal.icon}</span>
                  <span className="font-medium text-gray-800">{meal.label}</span>
                  <span className="text-xs text-gray-500 ml-auto">{mealData.calories}kcal</span>
                </div>
                <p className="text-gray-700 font-medium">{mealData.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {mealData.foods.map((f) => f.name).join(' + ')}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {mealData.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-card p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">今日总热量</span>
              <span className="text-lg font-bold text-primary">{totalCalories}kcal</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NutritionCarousel;
