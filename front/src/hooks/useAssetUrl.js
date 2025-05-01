// src/hooks/useAssetUrl.js
export default function useAssetUrl() {
    const getFullUrl = (relativePath) => {
      if (!relativePath) return '';
      
      // Если путь уже абсолютный (начинается с http), возвращаем как есть
      if (relativePath.startsWith('http')) return relativePath;
      
      // Добавляем базовый URL API к относительному пути
      return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}${relativePath}`;
    };
  
    return getFullUrl;
  }