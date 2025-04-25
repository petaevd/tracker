import React from 'react';
import { 
  FiHome, 
  FiCheckSquare, 
  FiCalendar,
  FiHeart,
  FiSettings,
  FiHelpCircle
} from 'react-icons/fi';
import './Navbar.css';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const icons = [
    { id: 'home', icon: <FiHome size={20} />, path: '/' },
    { id: 'project', icon: <FiCheckSquare size={20} />, path: '/project' },
    { id: 'calendar', icon: <FiCalendar size={20} />, path: '/calendar' },
    { id: 'favorites', icon: <FiHeart size={20} />, path: '/favorites' },
    { id: 'settings', icon: <FiSettings size={20} />, path: '/settings' },
    { id: 'help', icon: <FiHelpCircle size={20} />, path: '/help' },
  ];

  const getActiveIcon = () => {
    const currentPath = location.pathname;
    const activeIcon = icons.find((icon) => 
      matchPath({ path: icon.path, exact: true }, currentPath)
    ) || icons[0];
    return activeIcon.id;
  };

  const handleIconClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="navbar-container" aria-label="Главное меню">
      <div className="navbar-icons">
        {icons.map((item) => (
          <div 
            key={item.id}
            className={`icon-circle ${getActiveIcon() === item.id ? 'active' : ''}`}
            onClick={() => handleIconClick(item.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleIconClick(item.path)}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar; 