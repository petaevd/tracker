import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProjects, createProject } from '../../api/projectApi';

export const getProjects = createAsyncThunk('projects/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchProjects();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
  }
});

export const addProject = createAsyncThunk('projects/createProject', async (projectData, { rejectWithValue }) => {
  try {
    const response = await createProject(projectData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create project');
  }
});

// Заглушки для addBoard и addUser
export const addBoard = createAsyncThunk('projects/addBoard', async ({ projectId, boardData }, { rejectWithValue }) => {
  try {
    // Заглушка: пока ничего не делаем, возвращаем моковые данные
    return { projectId, board: { id: Date.now(), name: boardData.name } };
  } catch (error) {
    return rejectWithValue('Функция добавления досок не реализована');
  }
});

export const addUser = createAsyncThunk('projects/addUser', async ({ projectId, userData }, { rejectWithValue }) => {
  try {
    // Заглушка: пока ничего не делаем, возвращаем моковые данные
    return { projectId, user: { email: userData.email } };
  } catch (error) {
    return rejectWithValue('Функция добавления пользователей не реализована');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Project
      .addCase(addProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(addProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Board
      .addCase(addBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBoard.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, board } = action.payload;
        const project = state.projects.find((p) => p.id === projectId);
        if (project) {
          project.boards = [...(project.boards || []), board];
        }
      })
      .addCase(addBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add User
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId } = action.payload;
        const project = state.projects.find((p) => p.id === projectId);
        if (project) {
          project.members_count = (project.members_count || 1) + 1;
        }
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default projectSlice.reducer;