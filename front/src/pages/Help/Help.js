import React from 'react';
import { useSelector } from 'react-redux';
import './Help.css';

const Help = () => {
  const user = useSelector((state) => state.auth.user);
  
  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="breadcrumb">Домашняя / Помощь</div>
        <h1 className="dashboard-title">Помощь</h1>
        
        {/* Секции помощи */}
        <div className="help-sections">
          <div className="help-section">
            <h2 className="help-section-title">Основные вопросы</h2>
            <div className="help-item">
              <h3 className="help-question">Как создать новый проект?</h3>
              <p className="help-answer">Перейдите в раздел "Проекты" и нажмите кнопку "Создать проект". Заполните необходимые поля и сохраните.</p>
            </div>
            <div className="help-item">
              <h3 className="help-question">Как пригласить участников?</h3>
              <p className="help-answer">В настройках проекта есть раздел "Участники", где вы можете отправить приглашения по email.</p>
            </div>
          </div>
          
          <div className="help-section">
            <h2 className="help-section-title">Настройки аккаунта</h2>
            <div className="help-item">
              <h3 className="help-question">Как изменить пароль?</h3>
              <p className="help-answer">В разделе "Настройки" - "Безопасность" вы можете изменить ваш пароль.</p>
            </div>
            <div className="help-item">
              <h3 className="help-question">Как обновить профиль?</h3>
              <p className="help-answer">Перейдите в "Настройки" - "Профиль" для изменения информации о себе.</p>
            </div>
          </div>
          
          <div className="help-section">
            <h2 className="help-section-title">Горячие клавиши</h2>
            <div className="help-item">
              <h3 className="help-question">Быстрый поиск</h3>
              <p className="help-answer">Используйте Ctrl+F (Cmd+F на Mac) для быстрого доступа к поиску.</p>
            </div>
            <div className="help-item">
              <h3 className="help-question">Навигация</h3>
              <p className="help-answer">Alt+Стрелки для быстрой навигации между разделами.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;