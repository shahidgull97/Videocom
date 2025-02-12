// frontend/src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import videoCallReducer from "./videoCallSlice";

const store = configureStore({
  reducer: {
    videoCall: videoCallReducer,
  },
});

export default store;
