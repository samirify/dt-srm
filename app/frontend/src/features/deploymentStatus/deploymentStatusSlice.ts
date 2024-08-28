import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  socket: null,
};

export const deploymentStatusSlice = createSlice({
  name: "deploymentStatus",
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
  },
});

export const { setSocket } = deploymentStatusSlice.actions;

export default deploymentStatusSlice.reducer;
