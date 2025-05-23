import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Unauthorized = () => {
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <div className="unauthorized-container">
      <h2>{t('unauthorized_title')}</h2>
      <p>{t('unauthorized_message')}</p>
      <Link to="/" className="home-link">
        {t('unauthorized_home_link')}
      </Link>
    </div>
  );
};

export default Unauthorized;