import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  availableTopics: [],
  availableFAQs: [],
  openTopic: {},
};

export const helpSlice = createSlice({
  name: "help",
  initialState,
  reducers: {
    setAvailableTopics: (state, action) => {
      state.availableTopics = action.payload;
    },
    setAvailableFAQs: (state, action) => {
      state.availableFAQs = action.payload;
    },
    setOpenTopic: (state, action) => {
      state.openTopic = action.payload;
    },
    clearTopic: (state) => {
      state.openTopic = {};
    },
  },
});

export const { setAvailableTopics, setAvailableFAQs, setOpenTopic, clearTopic } =
  helpSlice.actions;

export default helpSlice.reducer;
