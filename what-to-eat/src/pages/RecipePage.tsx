import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeList } from '../components/recipe/RecipeList';
import { loadRecipes, saveRecipes } from '../utils/storage';
import type { Recipe } from '../types';
import { mockRecipes } from '../data/recipes';
import { Plus, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen pb-24">
      {/* 头部区域 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        
        <div className="relative px-4 pt-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ChefHat size={20} className="text-white/80" />
                <span className="text-white/70 text-sm font-medium">美食厨房</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                菜谱大全
              </h1>
              <p className="text-white/70 text-sm mt-1">
                精选 <span className="font-semibold text-white">{recipes.length}</span> 道美味佳肴
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/recipe/add')}
              className="flex items-center gap-1.5 bg-white text-primary px-4 py-2.5 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="text-sm">添加</span>
            </motion.button>
          </motion.div>
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

      {/* 内容区域 */}
      <div className="px-4 -mt-10 relative z-10">
        <RecipeList recipes={recipes} loading={loading} />
      </div>
    </div>
  );
};

export default RecipePage;
