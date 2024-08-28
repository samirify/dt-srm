import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  project: "",
};

export const deploymentDetailsSlice = createSlice({
  name: "deploymentDetails",
  initialState,
  reducers: {
    setProject: (state, action) => {
      state.project = action.payload;
    },
  },
});

export const { setProject } = deploymentDetailsSlice.actions;

export default deploymentDetailsSlice.reducer;
