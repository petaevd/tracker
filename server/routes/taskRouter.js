import { Router } from 'express';
import taskController from '../controllers/taskController.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import validate from '../middleware/validate.js';
import { taskSchema } from '../utils/validators.js';

const router = Router();

router.get('/', authMiddleware, taskController.getAllTasks);
router.post('/', authMiddleware, roleMiddleware(['admin','manager']), validate(taskSchema.create), taskController.createTask);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'manager', 'employee']), validate(taskSchema.update), taskController.updateTask);
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'manager', 'employee']), validate(taskSchema.id), taskController.deleteTask);
router.get('/:id/assignee', authMiddleware, roleMiddleware(['admin','manager']), taskController.getAssignee);
router.post('/:id/assignee', authMiddleware, roleMiddleware(['admin','manager']), taskController.addAssignee);
router.delete('/:id/assignee', authMiddleware, roleMiddleware(['admin', 'manager']), taskController.deleteAssignee);

export default router;