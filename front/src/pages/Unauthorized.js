import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Unauthorized = () => {

  // ================ Перевод ================
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  // ================ Перевод ================
  return (
    <div className="unauthorized-container">
      <h2>Доступ запрещен</h2>
      <p>У вас нет прав для доступа к этой странице.</p>
      <Link to="/" className="home-link">Вернуться на главную</Link>
    </div>
  );
};

export default Unauthorized;