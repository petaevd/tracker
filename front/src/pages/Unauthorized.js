import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <h2>Доступ запрещен</h2>
      <p>У вас нет прав для доступа к этой странице.</p>
      <Link to="/" className="home-link">Вернуться на главную</Link>
    </div>
  );
};

export default Unauthorized;