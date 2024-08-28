import { useDispatch, useSelector } from "react-redux";
import Main from "./components/Main";
import { Route, Routes } from "react-router-dom";
import DeploymentStatus from "./components/DeploymentStatus";
import HelpMainPage from "./features/help/pages/HelpMainPage";
import FAQsPage from "./features/help/pages/FAQsPage";
import { useCallback, useEffect, useState } from "react";
import {
  setAppError,
  setAppIsInitialised,
  // setServerTimezone,
} from "./features/mainSlice";
import {
  setAvailableFAQs,
  setAvailableTopics,
} from "./features/help/helpSlice";
import { MainFullPreloader } from "./components/layout/preloaders/SamirifyPreloaders";
import ApplicationError from "./errors/ApplicationError";

const App = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const appIsInitialised = useSelector(
    (state: any) => state.main.appIsInitialised
  );
  const appError = useSelector((state: any) => state.main.appError);

  const dispatch = useDispatch();
  const initApp = useCallback(() => {
    dispatch(setAppError({}));

    fetch(`${process.env.REACT_APP_DEPLOYMENT_API_URL_ROOT}/initialise`)
      .then((res) => {
        res.json().then((response) => {
          if (response.success) {
            dispatch(setAvailableTopics(response.data.help?.topics));
            dispatch(setAvailableFAQs(response.data.help?.faqs));
            // dispatch(setServerTimezone(response.data.data.timezone));
            dispatch(setAppIsInitialised(true));
          } else {
          }
        });
      })
      .catch((error) => {
        dispatch(
          setAppError({
            title: "Failed to Initialise!",
            message: error,
          })
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    initApp();
  }, [initApp]);
  return (
    <>
      <MainFullPreloader show={isLoading} />
      {appIsInitialised ? (
        <Routes>
          <Route path="/" element={<Main />} />
          <Route
            path="/deployment-status/:deploymentId"
            element={<DeploymentStatus />}
          />
          <Route path="/help">
            <Route index element={<HelpMainPage />} />
            <Route path="faqs" element={<FAQsPage />} />
          </Route>
        </Routes>
      ) : (
        <ApplicationError
          errorTitle={appError.title}
          errorDetails={appError.message}
        />
      )}
    </>
  );
};

export default App;
