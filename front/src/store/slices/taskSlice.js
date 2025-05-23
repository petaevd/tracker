import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTasks, createTask, updateTask, deleteTask, fetchAssignee } from '../../api/taskApi';
import {
  createAssignee as apiAddAssignee,
  fetchAssignee as apiGetAssignee,
  deleteAssignee as apiDeleteAssignee,
} from '../../api/taskApi';

export const getTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchTasks();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const addTask = createAsyncThunk('tasks/createTask', async (taskData, { rejectWithValue }) => {
  try {
    const response = await createTask(taskData);
    return response.task;
  } catch (error) {
    return rejectWithValue(error.response?.data?.errors || 'Failed to create task');
  }
});

export const updateExistingTask = createAsyncThunk('tasks/updateTask', async ({ taskId, taskData }, { rejectWithValue }) => {
  try {
    const response = await updateTask(taskId, taskData);
    return response.task;
  } catch (error) {
    return rejectWithValue(error.response?.data?.errors || 'Failed to update task');
  }
});

export const removeTask = createAsyncThunk('tasks/deleteTask', async (taskId, { rejectWithValue }) => {
  try {
    await deleteTask(taskId);
    return taskId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
  }
});


// Добавить ответственного
export const addAssignee = createAsyncThunk(
  'tasks/addAssignee',
  async ({ taskId, assigneeId }, { rejectWithValue }) => {
    try {
      console.log(taskId, assigneeId)
      const response = await apiAddAssignee(taskId, assigneeId);
      console.log(response)
      return { taskId, assigneeId: response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign user to task');
    }
  }
);

// Получить ответственного
export const getAssignee = createAsyncThunk(
  'tasks/getAssignee',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await apiGetAssignee(taskId);
      return { taskId, assignee: response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignee');
    }
  }
);

// Удалить ответственного
export const removeAssignee = createAsyncThunk(
  'tasks/removeAssignee',
  async (taskId, { rejectWithValue }) => {
    try {
      await apiDeleteAssignee(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove assignee');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateExistingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateExistingTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Добавление ответственного
      .addCase(addAssignee.fulfilled, (state, action) => {
        const { taskId, assignee } = action.payload;
        const task = state.tasks.find(task => task.id === taskId);
        if (task) {
          task.assignee = assignee;
        }
      })

      // Получение ответственного
      .addCase(getAssignee.fulfilled, (state, action) => {
        const { taskId, assignee } = action.payload;
        const task = state.tasks.find(task => task.id === taskId);
        if (task) {
          task.assignee = assignee;
        }
      })

      // Удаление ответственного
      .addCase(removeAssignee.fulfilled, (state, action) => {
        const taskId = action.payload;
        const task = state.tasks.find(task => task.id === taskId);
        if (task) {
          task.assignee = null;
        }
      })
  },
});

export default taskSlice.reducer;