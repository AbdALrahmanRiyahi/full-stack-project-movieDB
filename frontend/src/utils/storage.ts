const getFavoritesKey = (userId: string): string => `movie_favorites_${userId}`;
const getWatchedKey = (userId: string): string => `movie_watched_${userId}`;

export const getFavorites = (userId: string): string[] => {
  try {
    const favorites = localStorage.getItem(getFavoritesKey(userId));
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
};

export const addToFavorites = (movieId: string, userId: string): void => {
  const favorites = getFavorites(userId);
  if (!favorites.includes(movieId)) {
    favorites.push(movieId);
    localStorage.setItem(getFavoritesKey(userId), JSON.stringify(favorites));
  }
};

export const removeFromFavorites = (movieId: string, userId: string): void => {
  const favorites = getFavorites(userId);
  const updatedFavorites = favorites.filter(id => id !== movieId);
  localStorage.setItem(getFavoritesKey(userId), JSON.stringify(updatedFavorites));
};

export const isFavorite = (movieId: string, userId: string): boolean => {
  const favorites = getFavorites(userId);
  return favorites.includes(movieId);
};

// Watched movies functions
export const getWatched = (userId: string): string[] => {
  try {
    const watched = localStorage.getItem(getWatchedKey(userId));
    return watched ? JSON.parse(watched) : [];
  } catch {
    return [];
  }
};

export const addToWatched = (movieId: string, userId: string): void => {
  const watched = getWatched(userId);
  if (!watched.includes(movieId)) {
    watched.push(movieId);
    localStorage.setItem(getWatchedKey(userId), JSON.stringify(watched));
  }
};

export const removeFromWatched = (movieId: string, userId: string): void => {
  const watched = getWatched(userId);
  const updatedWatched = watched.filter(id => id !== movieId);
  localStorage.setItem(getWatchedKey(userId), JSON.stringify(updatedWatched));
};

export const isWatched = (movieId: string, userId: string): boolean => {
  const watched = getWatched(userId);
  return watched.includes(movieId);
};