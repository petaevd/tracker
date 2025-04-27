import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects } from '../../store/slices/projectSlice';
import { logout } from '../../store/slices/authSlice';
import ProjectInfo from '../../components/ProjectInfo/ProjectInfo';
import TaskList from '../../components//TaskList/TaskList';
import TeamMembers from '../../components/TeamMembers/TeamMembers';
import AddUserModal from '../../components/AddUserModal/AddUserModal';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects, loading, error } = useSelector((state) => state.projects);
  const user = useSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!projects.length) {
      dispatch(getProjects());
    }
  }, [dispatch, projects.length, user, navigate]);

  const project = projects.find((p) => p.id === projectId);

  if (!user) {
    return <div className="loading-message">Загрузка...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="breadcrumb">Домашняя / Проект / {project?.name || 'Панель управления'}</div>
        <h1 className="dashboard-title">{project?.name || 'Панель управления проектом'}</h1>
        <p className="dashboard-subtitle">
          {project ? `Управляйте проектом "${project.name}"` : 'Внимательно изучите показатели и управляйте своим проектом'}
        </p>

        {loading && <div className="loading-message">Загрузка...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !project && !error && (
          <div className="error-message">Проект не найден</div>
        )}

        {project && (
          <div className="project-details">
            <ProjectInfo project={project} teamMembers={teamMembers} />
            <TaskList
              projectId={projectId}
              tasks={tasks}
              setTasks={setTasks}
              user={user}
              setShowAddUserModal={setShowAddUserModal}
            />
            <TeamMembers teamMembers={teamMembers} />
          </div>
        )}

        {showAddUserModal && (
          <AddUserModal
            users={users}
            setUsers={setUsers}
            project={project}
            setTeamMembers={setTeamMembers}
            setShowAddUserModal={setShowAddUserModal}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;