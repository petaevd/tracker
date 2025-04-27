import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { fetchTasks } from '../../api/taskApi';
import { toast } from 'react-toastify';
import './TaskList.css';

const TaskList = ({ projectId, tasks, setTasks, user, setShowAddUserModal }) => {
  const [taskFilter, setTaskFilter] = useState({ status: 'all', priority: 'all', tag: 'all' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        const response = await fetchTasks();
        const projectTasks = response.filter((task) => task.project_id === parseInt(projectId));
        setTasks(projectTasks);
      } catch (err) {
        toast.error('Ошибка загрузки задач');
      }
    };

    if (projectId) {
      fetchTasksData();
    }
  }, [projectId, setTasks]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input').focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = taskFilter.status === 'all' || task.status?.name === taskFilter.status;
    const matchesPriority = taskFilter.priority === 'all' || task.priority === taskFilter.priority;
    const matchesTag = taskFilter.tag === 'all' || task.tags?.some((t) => t.name === taskFilter.tag);
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesTag && matchesSearch;
  });

  return (
    <div className="dashboard-card">
      <h3 className="card-title">
        Задачи
        {user.role !== 'employee' && (
          <button
            className="action-btn purple"
            onClick={() => setShowAddUserModal(true)}
            style={{ marginLeft: '10px' }}
          >
            <FaPlus /> Добавить пользователя
          </button>
        )}
      </h3>
      <div className="search-container">
        <div className="search-wrapper">
          <input
            id="search-input"
            type="text"
            placeholder="Поиск задач"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="shortcut-box">
            <span className="shortcut-key">⌘</span>
            <span className="shortcut-key">F</span>
          </div>
        </div>
      </div>
      <div className="task-filter">
        <select
          value={taskFilter.status}
          onChange={(e) => setTaskFilter({ ...taskFilter, status: e.target.value })}
        >
          <option value="all">Все статусы</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={taskFilter.priority}
          onChange={(e) => setTaskFilter({ ...taskFilter, priority: e.target.value })}
        >
          <option value="all">Все приоритеты</option>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
        <select
          value={taskFilter.tag}
          onChange={(e) => setTaskFilter({ ...taskFilter, tag: e.target.value })}
        >
          <option value="all">Все теги</option>
          {[...new Set(tasks.flatMap((task) => task.tags?.map((t) => t.name) || []))].map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      {filteredTasks.length > 0 ? (
        <ul>
          {filteredTasks.map((task) => (
            <li key={task.id}>
              {task.title} - {task.status?.name || 'Не указан'} - {task.priority}
              {task.tags?.length > 0 && (
                <span> (Теги: {task.tags.map((t) => t.name).join(', ')})</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Задачи отсутствуют</p>
      )}
    </div>
  );
};

export default TaskList;