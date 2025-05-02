import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Tag from '../models/Tag.js';
import projectService from './projectService.js';

const getTasksByCreator = async (userId) => {
  return await Task.findAll({
    where: {
      creator_id: userId
    },
    include: [
      { model: Project, as: 'project', attributes: ['name'] },
      { model: User, as: 'creator', attributes: ['username'] },
      { model: Tag, as: 'tags', attributes: ['name'] },
    ],
  });
};

const getAllTasks = async () => {
  return await Task.findAll({
    include: [
      { model: Project, as: 'project', attributes: ['name'] },
      { model: User, as: 'creator', attributes: ['username'] },
      { model: Tag, as: 'tags', attributes: ['name'] },
    ],
  });
};

const createTask = async ({ title, project_id, status, priority, due_date, description }, user) => {
  const projects = await projectService.getAllProjects(user);
  const creator_id = user.id

  const hasAccess = projects.some(p => p.id == project_id);
  
  if (!hasAccess) {
    const err = new Error('Проект не найден или у вас нет к нему доступа');
    err.status = 404;
    throw err;
  }

  return await Task.create({ 
    title, 
    project_id, 
    status, 
    creator_id, 
    priority, 
    due_date, 
    description 
  });
};

export default { getAllTasks, createTask, getTasksByCreator };