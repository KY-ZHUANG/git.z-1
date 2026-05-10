import type { Recipe } from '../types';

export function fuzzyMatch(text: string, query: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();
  
  if (normalizedQuery.length === 0) return true;
  
  let queryIndex = 0;
  for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === normalizedQuery.length;
}

export function searchRecipes(
  recipes: Recipe[],
  query: string,
  options?: {
    fields?: ('name' | 'ingredients' | 'tags')[];
    fuzzy?: boolean;
  }
): Recipe[] {
  if (!query.trim()) return recipes;

  const fields = options?.fields || ['name', 'ingredients', 'tags'];
  const fuzzy = options?.fuzzy ?? true;

  return recipes.filter((recipe) => {
    if (fields.includes('name') && fuzzyMatch(recipe.name, query)) {
      return true;
    }

    if (fields.includes('ingredients')) {
      const ingredientMatch = recipe.ingredients.some((ing) =>
        fuzzy ? fuzzyMatch(ing.name, query) : ing.name.includes(query)
      );
      if (ingredientMatch) return true;
    }

    if (fields.includes('tags')) {
      const tagMatch = recipe.tags.some((tag) =>
        fuzzy ? fuzzyMatch(tag, query) : tag.includes(query)
      );
      if (tagMatch) return true;
    }

    return false;
  });
}

export interface FilterOptions {
  categories?: string[];
  tags?: string[];
  maxTime?: number;
  difficulty?: string[];
  ingredients?: string[];
}

export function filterRecipes(recipes: Recipe[], filters: FilterOptions): Recipe[] {
  return recipes.filter((recipe) => {
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(recipe.category)) {
        return false;
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) => recipe.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    if (filters.maxTime && recipe.time > filters.maxTime) {
      return false;
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(recipe.difficulty)) {
        return false;
      }
    }

    if (filters.ingredients && filters.ingredients.length > 0) {
      const hasAllIngredients = filters.ingredients.every((ing) =>
        recipe.ingredients.some((recipeIng) =>
          recipeIng.name.toLowerCase().includes(ing.toLowerCase())
        )
      );
      if (!hasAllIngredients) {
        return false;
      }
    }

    return true;
  });
}
