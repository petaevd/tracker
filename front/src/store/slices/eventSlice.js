import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../../api/eventApi';

export const getEvents = createAsyncThunk('events/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchEvents();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch events');
  }
});

export const addEvent = createAsyncThunk('events/createEvent', async (eventData, { rejectWithValue }) => {
  try {
    const response = await createEvent(eventData);
    return response.event;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to create event');
  }
});

export const updateExistingEvent = createAsyncThunk('events/updateEvent', async ({ eventId, eventData }, { rejectWithValue }) => {
  try {
    const response = await updateEvent(eventId, eventData);
    return response.event;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to update event');
  }
});

export const removeEvent = createAsyncThunk('events/deleteEvent', async (eventId, { rejectWithValue }) => {
  try {
    await deleteEvent(eventId);
    return eventId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to delete event');
  }
});

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(getEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Event
      .addCase(addEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Event
      .addCase(updateExistingEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateExistingEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Event
      .addCase(removeEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event.id !== action.payload);
      })
      .addCase(removeEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default eventSlice.reducer;