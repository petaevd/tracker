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
        {/* <button className="share-button">
          <FaShareAlt />
        </button> */}
        {user ? (
          <div className="user-controls">
            <div className="user-avatar">
                {profileData.avatar ? (
                  <img
                    src={getAssetUrl(profileData.avatar)}
                    alt="Ваш аватар"
                    className="avatar-image"
                    onError={(e) => {
                      e.target.onerror = null; // Предотвращаем бесконечный цикл
                      e.target.src = ''; // Удаляем нерабочий URL
                      setProfileData(prev => ({
                        ...prev,
                        avatar: prev.avatar || null
                      }));
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {getAvatarLetter(user?.username, user?.email)}
                  </div>
                )}
            </div>
            <button onClick={onLogout} className="logout-button">
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => navigate('/login')}>
            <FaUser />
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;