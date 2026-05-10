import type { Recipe } from '../../types';
import { DifficultyBadge } from '../common/Badges';
import { HeartIcon, ClockIcon } from '../common/Icons';
import { formatTime } from '../../utils/format';
import { isFavorite, toggleFavorite as toggleFavoriteStorage } from '../../utils/storage';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

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

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-card overflow-hidden card-shadow transition-all duration-300 hover:-translate-y-1 hover:card-shadow-hover ${
        isVisible ? 'animate-card-enter' : 'opacity-0'
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'forwards',
      }}
    >
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="relative aspect-card overflow-hidden bg-gray-100">
          {!imgLoaded && (
            <div className="absolute inset-0 skeleton-shimmer" />
          )}
          <img
            src={recipe.image}
            alt={recipe.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
          <button
            onClick={handleFavorite}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              fav
                ? 'bg-primary text-white'
                : 'bg-white/90 text-gray-400 hover:text-primary'
            }`}
          >
            <HeartIcon filled={fav} size={18} />
          </button>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-2">
            {recipe.name}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <ClockIcon size={12} />
              {formatTime(recipe.time)}
            </span>
            <DifficultyBadge level={recipe.difficulty} />
          </div>

          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;
