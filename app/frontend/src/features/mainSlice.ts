import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  appIsInitialised: false,
  appError: {},
  longOperation: {},
  serverTimezone: "",
};

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setAppError: (state, action) => {
      state.appError = action.payload;
    },
    setAppIsInitialised: (state, action) => {
      state.appIsInitialised = action.payload;
    },
    setLongOperation: (state, action) => {
      state.longOperation = action.payload;
    },
    setServerTimezone: (state, action) => {
      state.serverTimezone = action.payload;
    },
  },
});

export const {
  setAppError,
  setAppIsInitialised,
  setLongOperation,
  setServerTimezone,
} = mainSlice.actions;

export default mainSlice.reducer;
