import type { Recipe, Recommendation } from '../types';
import { STORAGE_KEYS } from './constants';

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  setToStorage(STORAGE_KEYS.RECIPES, recipes);
}

export function loadRecipes(): Recipe[] {
  return getFromStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);
}

export function addRecipe(recipe: Recipe): void {
  const recipes = loadRecipes();
  recipes.unshift(recipe);
  saveRecipes(recipes);
}

export function updateRecipe(id: string, updates: Partial<Recipe>): void {
  const recipes = loadRecipes();
  const index = recipes.findIndex((r) => r.id === id);
  if (index !== -1) {
    recipes[index] = { ...recipes[index], ...updates };
    saveRecipes(recipes);
  }
}

export function deleteRecipe(id: string): void {
  const recipes = loadRecipes();
  const filtered = recipes.filter((r) => r.id !== id);
  saveRecipes(filtered);
  const favorites = getFavorites();
  if (favorites.includes(id)) {
    toggleFavorite(id);
  }
}

export function getFavorites(): string[] {
  return getFromStorage<string[]>(STORAGE_KEYS.FAVORITES, []);
}

export function toggleFavorite(id: string): boolean {
  const favorites = getFavorites();
  const index = favorites.indexOf(id);
  if (index === -1) {
    favorites.push(id);
    setToStorage(STORAGE_KEYS.FAVORITES, favorites);
    return true;
  } else {
    favorites.splice(index, 1);
    setToStorage(STORAGE_KEYS.FAVORITES, favorites);
    return false;
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function saveRecommendation(rec: Recommendation): void {
  const history = getRecommendationHistory();
  history.unshift(rec);
  if (history.length > 100) {
    history.pop();
  }
  setToStorage(STORAGE_KEYS.HISTORY, history);
}

export function getRecommendationHistory(): Recommendation[] {
  return getFromStorage<Recommendation[]>(STORAGE_KEYS.HISTORY, []);
}

export function deleteRecommendation(id: string): void {
  const history = getRecommendationHistory();
  const filtered = history.filter((r) => r.id !== id);
  setToStorage(STORAGE_KEYS.HISTORY, filtered);
}

export function clearHistory(): void {
  setToStorage(STORAGE_KEYS.HISTORY, []);
}

export function getRecentBrowse(): string[] {
  return getFromStorage<string[]>(STORAGE_KEYS.RECENT_BROWSE, []);
}

export function addToRecentBrowse(recipeId: string): void {
  const recent = getRecentBrowse();
  const filtered = recent.filter((id) => id !== recipeId);
  filtered.unshift(recipeId);
  if (filtered.length > 10) {
    filtered.pop();
  }
  setToStorage(STORAGE_KEYS.RECENT_BROWSE, filtered);
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportData(): void {
  const data = {
    recipes: loadRecipes(),
    favorites: getFavorites(),
    history: getRecommendationHistory(),
    exportDate: new Date().toISOString(),
    version: '1.0',
  };
  const dateStr = new Date().toISOString().split('T')[0];
  downloadJSON(data, `whatToEat_backup_${dateStr}.json`);
}

export function importData(
  jsonString: string,
  mode: 'merge' | 'replace'
): { success: boolean; imported: { recipes: number; favorites: number; history: number }; errors: string[] } {
  const errors: string[] = [];
  let imported = { recipes: 0, favorites: 0, history: 0 };

  try {
    const data = JSON.parse(jsonString);

    if (mode === 'replace') {
      if (data.recipes && Array.isArray(data.recipes)) {
        saveRecipes(data.recipes);
        imported.recipes = data.recipes.length;
      }
      if (data.favorites && Array.isArray(data.favorites)) {
        setToStorage(STORAGE_KEYS.FAVORITES, data.favorites);
        imported.favorites = data.favorites.length;
      }
      if (data.history && Array.isArray(data.history)) {
        setToStorage(STORAGE_KEYS.HISTORY, data.history);
        imported.history = data.history.length;
      }
    } else {
      if (data.recipes && Array.isArray(data.recipes)) {
        const existing = loadRecipes();
        const existingIds = new Set(existing.map((r) => r.id));
        const newRecipes = data.recipes.filter((r: Recipe) => !existingIds.has(r.id));
        saveRecipes([...newRecipes, ...existing]);
        imported.recipes = newRecipes.length;
      }
      if (data.favorites && Array.isArray(data.favorites)) {
        const existingFavorites = getFavorites();
        const merged = [...new Set([...existingFavorites, ...data.favorites])];
        setToStorage(STORAGE_KEYS.FAVORITES, merged);
        imported.favorites = data.favorites.length;
      }
    }

    return { success: true, imported, errors };
  } catch (e) {
    errors.push('JSON格式解析失败');
    return { success: false, imported, errors };
  }
}
