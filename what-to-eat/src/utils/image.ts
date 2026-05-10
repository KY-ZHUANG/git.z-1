export function getUnsplashImage(keyword: string): string {
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword)},food`;
}

export function getPlaceholderImage(id: number | string): string {
  return `https://picsum.photos/seed/${id}/400/300`;
}

export function getRecipeImage(recipeId: string, _recipeName: string): string {
  return `https://picsum.photos/seed/${recipeId}/400/300`;
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

export async function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(preloadImage));
}
