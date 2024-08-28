import { configureStore } from "@reduxjs/toolkit";
import codeViewerReducer from "../features/codeViewer/codeViewerSlice";
import mainReducer from '../features/mainSlice';
import deploymentDetailsReducer from "../features/deploymentDetails/deploymentDetailsSlice";
import deploymentStatusReducer from "../features/deploymentStatus/deploymentStatusSlice";
import helpReducer from '../features/help/helpSlice';

const store = configureStore({
  reducer: {
    main: mainReducer,
    codeViewer: codeViewerReducer,
    deploymentDetails: deploymentDetailsReducer,
    deploymentStatus: deploymentStatusReducer,
    help: helpReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
