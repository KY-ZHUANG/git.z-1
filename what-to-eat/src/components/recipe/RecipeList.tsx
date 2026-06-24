import type { Recipe } from '../../types';
import { CATEGORIES, TAGS } from '../../utils/constants';
import { searchRecipes, filterRecipes } from '../../utils/search';
import { RecipeCard } from './RecipeCard';
import { Search } from 'lucide-react';
import { EmptyState, RecipeListSkeleton } from '../common/Badges';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecipeListProps {
  recipes: Recipe[];
  loading?: boolean;
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredRecipes = useMemo(() => {
    let result = recipes;

    if (debouncedQuery) {
      result = searchRecipes(result, debouncedQuery);
    }

    result = filterRecipes(result, {
      categories: activeCategory !== 'all' ? [activeCategory] : undefined,
      tags: activeTags.length > 0 ? activeTags : undefined,
    });

    return result;
  }, [recipes, debouncedQuery, activeCategory, activeTags]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索菜名、食材..."
            className="search-bar"
            disabled
          />
        </div>
        <RecipeListSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 搜索栏 */}
      <div className="relative sticky top-0 z-20 -mx-4 px-4 pt-2 pb-4 bg-gradient-to-b from-background via-background to-transparent">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="搜索菜名、食材..."
            className="search-bar"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                setSearchQuery('');
                setDebouncedQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <span className="text-gray-500 text-xs">✕</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* 分类Tab */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        {CATEGORIES.map((cat, index) => {
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveCategory(cat.id)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-glow'
                  : 'bg-white text-gray-600 shadow-soft hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* 标签筛选 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        {TAGS.map((tag, index) => {
          const isActive = activeTags.includes(tag);
          return (
            <motion.button
              key={tag}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              onClick={() => toggleTag(tag)}
              whileTap={{ scale: 0.95 }}
              className={`tag whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'tag-primary ring-1 ring-primary/20'
                  : 'tag-default'
              }`}
            >
              {isActive && <span className="mr-1">✓</span>}
              {tag}
            </motion.button>
          );
        })}
      </div>

      {/* 结果统计 */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          共 <span className="font-semibold text-gray-700">{filteredRecipes.length}</span> 道菜谱
        </p>
      </div>

      {/* 菜谱列表 */}
      <AnimatePresence mode="popLayout">
        {filteredRecipes.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState
              type="search"
              message={debouncedQuery ? '没找到相关菜品' : '暂无菜谱'}
              action={
                debouncedQuery
                  ? undefined
                  : { text: '添加菜谱', onClick: () => {} }
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="recipes"
            layout
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {filteredRecipes.map((recipe, idx) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={idx}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecipeList;
