import React, { useEffect, useState } from 'react';
import { FaShareAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAvatarLetter } from '../../utils';
import useAssetUrl from '../../hooks/useAssetUrl';
import { logout } from '../../store/slices/authSlice';
import { getUserById } from '../../api/userApi';
import './TopBar.css';

const TopBar = ({ onLogout }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getAssetUrl = useAssetUrl();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: null,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await getUserById(user.id);
        setProfileData({
          name: response.username,
          email: response.email,
          avatar: response.avatar_url || null,
        });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        if (error.response?.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      }
    };

    loadProfile();
  }, [user, navigate, dispatch]);

  return (
    <div className="top-bar">
      <div className="top-bar-actions">
        {user ? (
          <div className="user-controls">
            <div className="user-avatar">
              {profileData.avatar ? (
                <img
                  src={getAssetUrl(profileData.avatar)}
                  alt={`Аватар пользователя ${profileData.name}`}
                  className="avatar-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    setProfileData(prev => ({
                      ...prev,
                      avatar: prev.avatar || null
                    }));
                  }}
                />
              ) : (
                <div 
                  className="avatar-placeholder"
                  aria-hidden="true"
                >
                  {getAvatarLetter(user?.username, user?.email)}
                </div>
              )}
            </div>
            <button 
              onClick={onLogout} 
              className="logout-button"
              aria-label="Выйти из системы"
            >
              <FaSignOutAlt aria-hidden="true" />
              <span className="visually-hidden">Выйти</span>
            </button>
          </div>
        ) : (
          <button 
            className="login-btn" 
            onClick={() => navigate('/login')}
            aria-label="Войти в систему"
          >
            <FaUser aria-hidden="true" />
            <span className="visually-hidden">Войти</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;