import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTeams, createTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember, searchUsersByEmail } from '../../api/teamApi';

export const getTeams = createAsyncThunk('teams/fetchTeams', async (user, { rejectWithValue }) => {
  try {
    const response = await fetchTeams(user.role === 'manager' ? user.id : null);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить команды');
  }
});

export const addTeam = createAsyncThunk('teams/createTeam', async (teamData, { rejectWithValue }) => {
  try {
    const response = await createTeam(teamData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось создать команду');
  }
});

export const editTeam = createAsyncThunk('teams/updateTeam', async ({ id, teamData }, { rejectWithValue }) => {
  try {
    const response = await updateTeam(id, teamData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось обновить команду');
  }
});

export const removeTeam = createAsyncThunk('teams/deleteTeam', async (teamId, { rejectWithValue }) => {
  try {
    await deleteTeam(teamId);
    return teamId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось удалить команду');
  }
});

export const addMember = createAsyncThunk('teams/addMember', async ({ teamId, user }, { rejectWithValue }) => {
  try {
    await addTeamMember(teamId, user.id);
    return { teamId, user };
  } catch (error) {
    console.log(error)
    return rejectWithValue(error.response?.data?.message || 'Не удалось добавить участника');
  }
});

export const removeMember = createAsyncThunk('teams/removeMember', async ({ teamId, userId }, { rejectWithValue }) => {
  try {
    await removeTeamMember(teamId, userId);
    return { teamId, userId };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось удалить участника');
  }
});

export const searchUsers = createAsyncThunk('teams/searchUsers', async (email, { rejectWithValue }) => {
  try {
    const response = await searchUsersByEmail(email);
    return response.filter(user => user.role === 'employee'); // Фильтрация по роли employee
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Не удалось найти пользователей');
  }
});

const teamSlice = createSlice({
  name: 'teams',
  initialState: {
    teams: [],
    searchResults: [],
    loading: false,
    error: null,
  },
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teams
      .addCase(getTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(getTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Team
      .addCase(addTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
      })
      .addCase(addTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Team
      .addCase(editTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTeam.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.teams.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      })
      .addCase(editTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Team
      .addCase(removeTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter((t) => t.id !== action.payload);
      })
      .addCase(removeTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Member
      .addCase(addMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.loading = false;
        const team = state.teams.find((t) => t.id === action.payload.teamId);
        if (team) {
          team.members = team.members || [];
          team.members.push(action.payload.user);
        }
      })
      .addCase(addMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Member
      .addCase(removeMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.loading = false;
        const team = state.teams.find((t) => t.id === action.payload.teamId);
        if (team && team.members) {
          team.members = team.members.filter((m) => m.id !== action.payload.userId);
        }
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setError, clearSearchResults } = teamSlice.actions;
export default teamSlice.reducer;