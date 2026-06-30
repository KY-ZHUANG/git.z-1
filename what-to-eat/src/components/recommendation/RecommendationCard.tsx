import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Recipe } from '../../types';
import { DiceIcon, HeartIcon, RefreshIcon } from '../common/Icons';
import { formatTime } from '../../utils/format';
import { getRecipeImage } from '../../utils/image';

interface RecommendationCardProps {
  recipe: Recipe;
  index: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recipe,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.15,
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
      className="bg-white rounded-card overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1"
    >
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={getRecipeImage(recipe.id, recipe.name)}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <h3 className="text-white font-semibold text-sm">{recipe.name}</h3>
            <p className="text-white/80 text-xs">约{formatTime(recipe.time)}</p>
          </div>
        </div>
        <div className="p-3">
          <p className="text-gray-600 text-xs line-clamp-2">
            {recipe.ingredients.slice(0, 3).map((i) => i.name).join('、')}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

interface RecommendationDisplayProps {
  recommendation: {
    recipes: [Recipe, Recipe, Recipe];
  };
  onReroll: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}

export const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({
  recommendation,
  onReroll,
  onFavorite,
  isFavorite,
}) => {
  const totalTime = recommendation.recipes.reduce((sum, r) => sum + r.time, 0);
  const totalCalories = recommendation.recipes.reduce((sum, r) => sum + (r.calories || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {recommendation.recipes.map((recipe, index) => (
          <RecommendationCard
            key={`${recipe.id}-${recommendation.recipes[0].id}`}
            recipe={recipe}
            index={index}
          />
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur rounded-card p-4 card-shadow">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>总耗时：约{formatTime(totalTime)}</span>
          <span>总热量：约{totalCalories}kcal</span>
        </div>
        <p className="text-center text-primary text-sm mt-2 font-medium">
          荤素均衡，营养搭配合理 ✨
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onReroll}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          <RefreshIcon size={18} />
          重新推荐
        </button>
        <button
          onClick={onFavorite}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors ${
            isFavorite
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <HeartIcon filled={isFavorite} size={18} />
          收藏组合
        </button>
      </div>
    </div>
  );
};

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="text-6xl mb-6"
      >
        🍳
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-gray-600 text-center"
      >
        {message}
      </motion.p>
    </motion.div>
  );
};

interface InitialStateProps {
  onStart: () => void;
  loading: boolean;
}

export const InitialState: React.FC<InitialStateProps> = ({ onStart, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh]"
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
        <button
          onClick={onStart}
          disabled={loading}
          className="relative w-40 h-40 rounded-full bg-primary flex flex-col items-center justify-center text-white shadow-lg hover:bg-primary-dark transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70"
        >
          <DiceIcon size={48} className="mb-2" />
          <span className="text-xl font-bold">今天吃什么？</span>
        </button>
      </motion.div>

      <p className="text-gray-500 text-sm text-center max-w-xs">
        点击按钮，为你搭配今日三餐营养搭配
      </p>

      {loading && (
        <div className="mt-4">
          <LoadingState message="正在召唤美食精灵..." />
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationDisplay;
