import type { Recipe } from '../../types';
import { CATEGORIES, TAGS } from '../../utils/constants';
import { searchRecipes, filterRecipes } from '../../utils/search';
import { RecipeCard } from './RecipeCard';
import { SearchIcon } from '../common/Icons';
import { EmptyState, RecipeListSkeleton } from '../common/Badges';
import { useState, useMemo, useCallback } from 'react';

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
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索菜名、食材..."
            className="search-input"
          />
        </div>
        <RecipeListSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative sticky top-0 bg-background z-10 pb-4 -mx-4 px-4">
        <SearchIcon className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="搜索菜名、食材..."
          className="search-input"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {CATEGORIES.map((cat) => (
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

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`tag-pill whitespace-nowrap ${
              activeTags.includes(tag) ? 'active' : ''
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {filteredRecipes.length === 0 ? (
        <EmptyState
          type="search"
          message={debouncedQuery ? '没找到相关菜品' : '暂无菜谱'}
          action={
            debouncedQuery
              ? undefined
              : { text: '添加菜谱', onClick: () => {} }
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe, idx) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;
