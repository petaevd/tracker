import React from 'react';
import './ProjectInfo.css';

const ProjectInfo = ({ project, teamMembers }) => {
  return (
    <div className="dashboard-card">
      <h3 className="card-title">Информация о проекте</h3>
      <p><strong>Описание:</strong> {project.description || 'Нет описания'}</p>
      <p><strong>Команда:</strong> {project.team?.name || 'Не указана'}</p>
      <p><strong>Дедлайн:</strong> {project.deadline || 'Не указан'}</p>
      <p><strong>Статус:</strong> {project.status === 'active' ? 'Активен' : 'Архивирован'}</p>
      <p><strong>Участников:</strong> {teamMembers.length || 1}</p>
    </div>
  );
};

export default ProjectInfo;