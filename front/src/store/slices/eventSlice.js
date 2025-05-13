import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../../api/eventApi';

export const getEvents = createAsyncThunk(
  'events/fetchEvents',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetchEvents(userId);
      return { userId, events: response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch events');
    }
  }
);

export const addEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      console.log('Sending event data:', eventData);
      const response = await createEvent(eventData);
      console.log('Received response:', response);
      return response;
    } catch (error) {
      console.error('Full error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateExistingEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await updateEvent(eventId, eventData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update event');
    }
  }
);

export const removeEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await deleteEvent(eventId);
      return eventId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete event');
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    eventsByUser: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Events
      .addCase(getEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, events } = action.payload;
        state.eventsByUser[userId] = events;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Event
      .addCase(addEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.meta.arg.userId; // или из payload, если сервер возвращает user_id
        if (!state.eventsByUser[userId]) {
          state.eventsByUser[userId] = [];
        }
        state.eventsByUser[userId].push(action.payload);
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
        const updatedEvent = action.payload;
        const userId = Object.keys(state.eventsByUser).find(userId => 
          state.eventsByUser[userId].some(event => event.id === updatedEvent.id)
        );
        
        if (userId) {
          state.eventsByUser[userId] = state.eventsByUser[userId].map(event =>
            event.id === updatedEvent.id ? updatedEvent : event
          );
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
        const eventId = action.payload;
        for (const userId in state.eventsByUser) {
          state.eventsByUser[userId] = state.eventsByUser[userId].filter(
            event => event.id !== eventId
          );
        }
      })
      .addCase(removeEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default eventSlice.reducer;