import { createSlice } from "@reduxjs/toolkit";
import { DeploymentSocketMessage } from "../../components/Deployment";

export type FontSize = {
  [label: string]: string;
};

export type FontSizes = {
  [key: string]: FontSize;
};

export const fontSizes: FontSizes = {
  "extra-small": {
    label: "Extra Small",
  },
  small: {
    label: "Small",
  },
  medium: {
    label: "Medium",
  },
  large: {
    label: "Large",
  },
  "extra-large": {
    label: "Extra Large",
  },
};

interface CodeViewerStoreState {
  codeLines: DeploymentSocketMessage[],
  coloured: string,
  showIcons: string,
  fontSize: string,
}

const initialState: CodeViewerStoreState = {
  codeLines: [],
  coloured: localStorage.getItem('coloured') || 'yes',
  showIcons: localStorage.getItem('showIcons') || 'yes',
  fontSize: localStorage.getItem('fontSize') || 'medium',
};

export const codeViewerSlice = createSlice({
  name: "codeViewer",
  initialState,
  reducers: {
    addCodeLines: (state: any, action) => {
      if (Array.isArray(action.payload)) {
        for (const i in action.payload) {
          state.codeLines.push(action.payload[i]);
        }
      } else {
        state.codeLines.push(action.payload);
      }
    },
    clearConsole: (state) => {
      state.codeLines = [];
    },
    toggleColor: (state, action) => {
      localStorage.setItem('coloured', action.payload)
      state.coloured = action.payload;
    },
    toggleIcons: (state, action) => {
      localStorage.setItem('showIcons', action.payload)
      state.showIcons = action.payload;
    },
    setFontSize: (state, action) => {
      localStorage.setItem('fontSize', action.payload)
      state.fontSize = action.payload;
    },
  },
});

export const {
  addCodeLines,
  clearConsole,
  toggleColor,
  toggleIcons,
  setFontSize,
} = codeViewerSlice.actions;

export default codeViewerSlice.reducer;
