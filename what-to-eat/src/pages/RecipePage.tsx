import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeList } from '../components/recipe/RecipeList';
import { loadRecipes, saveRecipes } from '../utils/storage';
import type { Recipe } from '../types';
import { mockRecipes } from '../data/recipes';
import { Plus } from 'lucide-react';

const RecipePage: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedRecipes = loadRecipes();
    if (loadedRecipes.length === 0) {
      saveRecipes(mockRecipes);
      setRecipes(mockRecipes);
    } else {
      setRecipes(loadedRecipes);
    }
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">菜谱大全</h1>
            <p className="text-white/80 text-sm">
              {recipes.length}道美味佳肴
            </p>
          </div>
          <button
            onClick={() => navigate('/recipe/add')}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
          >
            <Plus size={20} />
            <span className="text-sm font-medium">添加</span>
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <RecipeList recipes={recipes} loading={loading} />
      </div>
    </div>
  );
};

export default RecipePage;
