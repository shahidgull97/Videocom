// frontend/src/store/videoCallSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomId: null,
  users: [],
  isConnected: false,
};

const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState,
  reducers: {
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    removeUser: (state, action) => {
      state.users = state.users.filter(user => user !== action.payload);
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
  },
});

export const { setRoomId, addUser, removeUser, setConnected } = videoCallSlice.actions;
export default videoCallSlice.reducer;
