import taskService from '../services/taskService.js';

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.body, req.user);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// Юзлесс пока что
const getTasksByCreator = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksByCreator(req.user);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user);
    res.status(201).json({ message: 'Задача успешно создана', id: task.id });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json({ message: 'Задача успешно обновлена', task });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.json({ message: 'Задача успешно удалена' });
  } catch (err) {
    next(err);
  }
};

export default { getAllTasks, createTask, updateTask, deleteTask, getTasksByCreator };