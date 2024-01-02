// reducer/store.tsx

import { configureStore, createSlice } from '@reduxjs/toolkit';

// Define a slice for the user state
const userSlice = createSlice({
  name: 'user',
  initialState: {
    // Define initial state properties here
    username: '',
    status: false,
    token: '',
  },
  reducers: {
    // Define reducer functions to update the state
    setUser: (state, action) => {
      const { username, status, token } = action.payload;
      state.username = username;
      state.status = status;
      state.token = token;
    },
    clearUser: (state) => {
      // Reset the user state when logging out
      state.username = '';
      state.status = false;
      state.token = '';
    },
  },
});

// Create the store using the configured slice
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

// Export the actions from the userSlice to use in components
export const { setUser, clearUser } = userSlice.actions;

export default store;
