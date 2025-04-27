import Project from '../models/Project.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import Task from '../models/Task.js';

const getAllProjects = async (user, query = {}) => {
  let projects;
  const { created_by } = query;

  if (user.role === 'employee') {
    const teamMembers = await TeamMember.findAll({
      where: { users_id: user.id },
      attributes: ['team_id'],
    });
    const teamIds = teamMembers.map(member => member.team_id);

    if (teamIds.length === 0) {
      return [];
    }

    projects = await Project.findAll({
      where: { team_id: teamIds },
      include: [
        { model: Team, as: 'team', attributes: ['name'] },
      ],
    });
  } else if (user.role === 'manager') {
    const createdById = created_by ? parseInt(created_by) : user.id;

    projects = await Project.findAll({
      where: { creator_id: createdById },
      include: [
        { model: Team, as: 'team', attributes: ['name'] },
      ],
    });
  } else {
    projects = await Project.findAll({
      include: [
        { model: Team, as: 'team', attributes: ['name'] },
      ],
    });
  }

  return projects;
};

const createProject = async ({ name, team_id, status, description, deadline }, user) => {
  const team = await Team.findByPk(team_id);
  if (!team) {
    const err = new Error('Команда не найдена');
    err.status = 404;
    throw err;
  }

  if (user.role === 'manager' && team.created_by !== user.id) {
    const err = new Error('Вы можете создавать проекты только для своих команд');
    err.status = 403;
    throw err;
  }

  return await Project.create({
    name,
    team_id,
    status,
    description,
    deadline,
    creator_id: user.id,
  });
};

const updateProject = async (id, { name, team_id, status, description, deadline }, user) => {
  const project = await Project.findByPk(id, {
    include: [{ model: Team, as: 'team' }],
  });
  if (!project) {
    const err = new Error('Проект не найден');
    err.status = 404;
    throw err;
  }

  if (user.role === 'manager' && project.creator_id !== user.id) {
    const err = new Error('Вы можете редактировать только свои проекты');
    err.status = 403;
    throw err;
  }

  const updates = {};
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (status) updates.status = status;
  if (deadline) updates.deadline = deadline;

  if (team_id) {
    const team = await Team.findByPk(team_id);
    if (!team) {
      const err = new Error('Команда не найдена');
      err.status = 404;
      throw err;
    }
    if (user.role === 'manager' && team.created_by !== user.id) {
      const err = new Error('Вы можете переносить проекты только в свои команды');
      err.status = 403;
      throw err;
    }
    updates.team_id = team_id;
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error('Нет допустимых полей для обновления');
    err.status = 400;
    throw err;
  }

  await project.update(updates);
  return project;
};

const deleteProject = async (id, user) => {
  const project = await Project.findByPk(id, {
    include: [{ model: Team, as: 'team' }],
  });
  if (!project) {
    const err = new Error('Проект не найден');
    err.status = 404;
    throw err;
  }

  if (user.role === 'manager' && project.creator_id !== user.id) {
    const err = new Error('Вы можете удалять только свои проекты');
    err.status = 403;
    throw err;
  }

  const taskCount = await Task.count({ where: { project_id: id } });
  if (taskCount > 0) {
    const err = new Error('Нельзя удалить проект, у которого есть задачи');
    err.status = 400;
    throw err;
  }

  await project.destroy();
};

export default { getAllProjects, createProject, updateProject, deleteProject };