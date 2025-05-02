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

const updateTask = async ({ title, project_id, status, priority, due_date, description }, user, task_id) => {
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