import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Recipe } from '../../types';
import { DifficultyBadge } from '../common/Badges';
import { BackIcon, HeartIcon, ShareIcon, ClockIcon, FireIcon } from '../common/Icons';
import { formatTime } from '../../utils/format';
import { loadRecipes, isFavorite, toggleFavorite, addToRecentBrowse, getRecentBrowse } from '../../utils/storage';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [favorite, setFavorite] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    
    const recipes = loadRecipes();
    const found = recipes.find((r) => r.id === id);
    if (found) {
      setRecipe(found);
      setFavorite(isFavorite(found.id));
      addToRecentBrowse(found.id);
      setRecentIds(getRecentBrowse().filter(recipeId => recipeId !== id));
    }
  }, [id]);

  const handleFavorite = () => {
    if (!recipe) return;
    const newState = toggleFavorite(recipe.id);
    setFavorite(newState);
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleShare = async () => {
    if (!recipe) return;
    const text = `${recipe.name}\n\n食材：${recipe.ingredients.map(i => `${i.name} ${i.amount}`).join('、')}\n\n做法：${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          text: text,
        });
      } catch (e) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('菜谱已复制到剪贴板！');
    }
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍳</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const recentRecipes = recentIds.map(rid => loadRecipes().find(r => r.id === rid)).filter(Boolean) as Recipe[];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          >
            <BackIcon />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ShareIcon />
            </button>
            <button
              onClick={handleFavorite}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                favorite ? 'bg-primary text-white' : 'bg-white/90 text-gray-600 hover:text-primary'
              }`}
            >
              <HeartIcon filled={favorite} />
            </button>
          </div>
        </div>
      </div>

      <div className="-mt-8 relative z-10 bg-background rounded-t-3xl px-4 pb-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">{recipe.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <DifficultyBadge level={recipe.difficulty} />
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <ClockIcon size={16} />
                {formatTime(recipe.time)}
              </span>
              {recipe.calories && (
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <FireIcon size={16} />
                  {recipe.calories}kcal
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="bg-white rounded-card p-4 card-shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🥗</span> 食材清单
            </h2>
            <div className="space-y-2">
              {recipe.ingredients.map((ing, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    checkedIngredients.has(index) ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      checkedIngredients.has(index)
                        ? 'bg-primary border-primary text-white'
                        : 'border-gray-300'
                    }`}
                    onClick={() => toggleIngredient(index)}
                  >
                    {checkedIngredients.has(index) && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 ${checkedIngredients.has(index) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {ing.name}
                  </span>
                  <span className="text-gray-500 text-sm">{ing.amount}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-card p-4 card-shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>👨‍🍳</span> 烹饪步骤
            </h2>
            <div className="space-y-4">
              {recipe.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {recentRecipes.length > 0 && (
            <div className="bg-white rounded-card p-4 card-shadow">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">最近浏览</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {recentRecipes.slice(0, 5).map((r) => (
                  <Link
                    key={r.id}
                    to={`/recipe/${r.id}`}
                    className="flex-shrink-0 w-24"
                  >
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
