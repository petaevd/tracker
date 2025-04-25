import React from 'react';
import { 
  FiHome, 
  FiCheckSquare, 
  FiPieChart,
  FiCalendar,
  FiHeart,
  FiSettings,
  FiHelpCircle
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const icons = [
    { id: 'home', icon: <FiHome size={20} />, path: '/' },
    { id: 'project', icon: <FiCheckSquare size={20} />, path: '/project' },
    { id: 'dashboard', icon: <FiPieChart size={20} />, path: '/dashboard' },
    { id: 'calendar', icon: <FiCalendar size={20} />, path: '/calendar' },
    { id: 'favorites', icon: <FiHeart size={20} />, path: '/favorites' },
    { id: 'settings', icon: <FiSettings size={20} />, path: '/settings' },
    { id: 'help', icon: <FiHelpCircle size={20} />, path: '/help' }
  ];

  // Определяем активную иконку на основе текущего пути
  const getActiveIcon = () => {
    const currentPath = location.pathname;
    const activeIcon = icons.find(icon => icon.path === currentPath) || icons[0];
    return activeIcon.id;
  };

  const handleIconClick = (path) => {
    navigate(path);
  };

  return (
    <div className="navbar-container">
      <div className="navbar-icons">
        {icons.map((item) => (
          <div 
            key={item.id}
            className={`icon-circle ${getActiveIcon() === item.id ? 'active' : ''}`}
            onClick={() => handleIconClick(item.path)}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navbar;