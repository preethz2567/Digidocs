export const addRecentlyViewed = (id: number) => {
  try {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = viewed.filter((vId: number) => vId !== id);
    filtered.unshift(id);
    localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 5)));
  } catch (e) {
    console.error('Failed to save recently viewed', e);
  }
};

export const getRecentlyViewed = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  } catch (e) {
    return [];
  }
};
