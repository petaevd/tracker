import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import projectService from './projectService.js';
import { Sequelize } from 'sequelize';

const getTasksByCreator = async (userId) => {
  return await Task.findAll({
    where: {
      creator_id: userId
    },
    include: [
      { model: Project, as: 'project', attributes: ['name'] },
      { model: User, as: 'creator', attributes: ['username'] },
    ],
  });
};

const getAllTasks = async (user) => {
  const projects = await projectService.getAllProjects(user);
  const projectIds = projects.map(p => p.id);

  return await Task.findAll({
    where: {
      project_id: projectIds,
    },
    include: [
      { model: Project, as: 'project', attributes: ['name'] },
      { model: User, as: 'creator', attributes: ['username'] },
    ],
    // order: [ MySQL
    //   [Sequelize.literal(`FIELD(priority, 'low', 'medium', 'high')`)]
    // ]
    order: [
      [Sequelize.literal(`
        CASE
          WHEN priority = 'low' THEN 1
          WHEN priority = 'medium' THEN 2
          WHEN priority = 'high' THEN 3
          ELSE 4
        END
      `), 'ASC']
    ]
  });
};

const createTask = async ({ title, project_id, status, priority, due_date, description, tags }, user) => {
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
    description,
    tags
  });
};

const updateTask = async ({ title, project_id, status, priority, due_date, description, tags }, user, task_id) => {
  const projects = await projectService.getAllProjects(user);
  const task = await Task.findByPk(task_id);
  const hasAccess = projects.some(p => p.id == project_id);
  
  if (!hasAccess) {
    const err = new Error('Проект не найден или у вас нет к нему доступа');
    err.status = 404;
    throw err;
  }
  
  if (!task) {
    const err = new Error('Задача не найдена');
    err.status = 404;
    throw err;
  }

  const updatableFields = {};
  if (title) updatableFields.title = title;
  if (status) updatableFields.status = status;
  if (priority) updatableFields.priority = priority;
  if (due_date) updatableFields.due_date = due_date;
  if (description) updatableFields.description = description;
  updatableFields.tags = tags;

  await task.update(updatableFields);

  return task;
}

const deleteTask = async (user, taskId) => {
  const task = await Task.findByPk(taskId);

  if (!task) {
    const err = new Error('Задача не найдена');
    err.status = 404;
    throw err;
  }

  const canDelete = (
    // Администратор
    user.role === 'admin' ||
    // Менеджер команды
    (user.role === 'manager' && task.project?.team?.members?.length > 0) ||
    // Создатель задачи
    task.creator_id === user.id
  );

  if (!canDelete) {
    const err = new Error('Недостаточно прав для удаления задачи');
    err.status = 403;
    throw err;
  }

  await task.destroy();
};

export default { getAllTasks, createTask, getTasksByCreator, updateTask, deleteTask};