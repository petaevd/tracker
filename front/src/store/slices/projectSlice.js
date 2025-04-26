import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProjects, createProject, updateProject, deleteProject } from '../../api/projectApi';
import { addTeamMember } from '../../api/teamApi';

export const getProjects = createAsyncThunk('projects/fetchProjects', async (userId, { rejectWithValue }) => {
  try {
    const response = await fetchProjects(userId);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить проекты');
  }
});

export const addProject = createAsyncThunk('projects/createProject', async (projectData, { rejectWithValue }) => {
  try {
    const response = await createProject(projectData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось создать проект');
  }
});

export const editProject = createAsyncThunk('projects/updateProject', async ({ id, projectData }, { rejectWithValue }) => {
  try {
    const response = await updateProject(id, projectData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось обновить проект');
  }
});

export const removeProject = createAsyncThunk('projects/deleteProject', async (projectId, { rejectWithValue }) => {
  try {
    await deleteProject(projectId);
    return projectId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось удалить проект');
  }
});

export const addUser = createAsyncThunk('projects/addUser', async ({ teamId, userId }, { rejectWithValue }) => {
  try {
    await addTeamMember(teamId, userId);
    return { teamId, userId };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось добавить пользователя');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
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
      // Update Project
      .addCase(editProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(editProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Project
      .addCase(removeProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      .addCase(removeProject.rejected, (state, action) => {
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
        const project = state.projects.find((p) => p.team_id === action.payload.teamId);
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

export const { setError } = projectSlice.actions;
export default projectSlice.reducer;