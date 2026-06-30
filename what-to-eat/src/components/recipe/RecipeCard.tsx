import type { Recipe } from '../../types';
import { DifficultyBadge } from '../common/Badges';
import { Heart, Clock } from 'lucide-react';
import { formatTime } from '../../utils/format';
import { isFavorite, toggleFavorite as toggleFavoriteStorage } from '../../utils/storage';
import { getRecipeImage } from '../../utils/image';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteChange?: () => void;
  index?: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onFavoriteChange,
  index = 0,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fav, setFav] = useState(isFavorite(recipe.id));
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavoriteStorage(recipe.id);
    setFav(newState);
    onFavoriteChange?.();
  };

  const categoryLabels: Record<string, { label: string; color: string }> = {
    meat: { label: '荤菜', color: 'bg-rose-100 text-rose-600' },
    vegetable: { label: '素菜', color: 'bg-emerald-100 text-emerald-600' },
    dessert: { label: '甜品', color: 'bg-amber-100 text-amber-600' },
  };

  const category = categoryLabels[recipe.category] || categoryLabels.vegetable;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-white rounded-2xl overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-card-hover group"
    >
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="relative aspect-card overflow-hidden bg-warm-100">
          {/* 图片加载骨架 */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-warm-100 to-warm-200 animate-pulse" />
          )}
          
          {/* 图片 */}
          <img
            src={getRecipeImage(recipe.id, recipe.name)}
            alt={recipe.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } group-hover:scale-110`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
          
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* 收藏按钮 */}
          <motion.button
            onClick={handleFavorite}
            whileTap={{ scale: 0.9 }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg backdrop-blur-sm ${
              fav
                ? 'bg-primary text-white'
                : 'bg-white/80 text-gray-500 hover:bg-white hover:text-primary'
            }`}
          >
            <motion.div
              animate={fav ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
            </motion.div>
          </motion.button>

          {/* 分类标签 */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${category.color} backdrop-blur-sm`}>
              {category.label}
            </span>
          </div>

          {/* 卡路里标签 */}
          {recipe.calories && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/40 text-white backdrop-blur-sm">
                {recipe.calories} kcal
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* 菜名 */}
          <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-1 tracking-tight">
            {recipe.name}
          </h3>
          
          {/* 时间和难度 */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {formatTime(recipe.time)}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <DifficultyBadge level={recipe.difficulty} />
          </div>

          {/* 食材预览 */}
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ing, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500"
              >
                {ing.name}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-400">
                +{recipe.ingredients.length - 3}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RecipeCard;
