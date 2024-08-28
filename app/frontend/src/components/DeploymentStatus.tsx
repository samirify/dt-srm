import { FC, Fragment, useCallback, useEffect, useRef, useState } from "react";

import CodeViewer from "../features/codeViewer/CodeViewer";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import {
  addCodeLines,
  clearConsole,
} from "../features/codeViewer/codeViewerSlice";
import { useNavigate, useParams } from "react-router-dom";
import { Button, ButtonGroup, Container } from "react-bootstrap";
import {
  DeploymentSocketMessage,
  DeploymentStatusProps,
  inProgressStatuses,
} from "./Deployment.d";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";
import { setProject } from "../features/deploymentDetails/deploymentDetailsSlice";
import { v4 as uuidv4 } from "uuid";

const DeploymentStatus: FC<DeploymentStatusProps> = () => {
  const project = useSelector((state: any) => state.deploymentDetails.project);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [isRedeploying, setIsRedeploying] = useState<boolean>(false);
  const [serverIsConnected, setServerIsConnected] = useState<boolean>(false);

  const initialized = useRef(false);

  const { deploymentId } = useParams() as { deploymentId: number | undefined };
  const [loading] = useState(false);

  const ws = useRef<any>(null);

  useEffect(() => {
    if (loading) {
      document.body.classList.add("with-main-preloader");
    } else {
      document.body.classList.remove("with-main-preloader");
    }
  }, [loading]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleApiErrors = useCallback(
    (errors: string[]): void => {
      ws.current.send(
        JSON.stringify({
          id: uuidv4(),
          deploymentId: deploymentId,
          textColor: "red",
          icon: "times",
          content: errors.join("<br />"),
        } as DeploymentSocketMessage)
      );
    },
    [deploymentId]
  );

  const loadProjectStatus = useCallback(async () => {
    setIsLoading(true);

    await fetch(
      `${process.env.REACT_APP_DEPLOYMENT_API_URL_ROOT}/project-status/${deploymentId}`
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          dispatch(setProject(res.data.project));
          if (inProgressStatuses.includes(res.data.project.status)) {
            setInProgress(true);
          }
        } else {
          handleApiErrors(res.errors);
        }
      })
      .catch((err) => {
        console.log("err: ", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [deploymentId, dispatch, handleApiErrors]);

  useEffect(() => {
    if (
      !initialized.current &&
      process.env.REACT_APP_DEPLOYMENT_SOCKET_SERVER_ADDRESS
    ) {
      dispatch(
        addCodeLines({
          id: uuidv4(),
          deploymentId,
          textColor: "info",
          icon: "clock",
          content: "Loading status from server..",
        })
      );

      initialized.current = true;
      ws.current = new WebSocket(
        process.env.REACT_APP_DEPLOYMENT_SOCKET_SERVER_ADDRESS
      );

      ws.current.onopen = () => {
        setServerIsConnected(true);
        loadProjectStatus();
      };

      ws.current.onmessage = (event: any) => {
        const msg = JSON.parse(event.data);
        if (msg.deploymentId === deploymentId) {
          if (!inProgressStatuses.includes(msg.deploymentStatus)) {
            setInProgress(false);
          }
          dispatch(addCodeLines(msg));
        }
      };

      ws.current.onerror = () => {
        dispatch(
          addCodeLines({
            id: uuidv4(),
            deploymentId,
            textColor: "red",
            icon: "ban",
            content: "Could not load from server. Server is disconnected!",
          })
        );
      };
    }
  }, [deploymentId, dispatch, loadProjectStatus, serverIsConnected, isLoading]);

  const reDeployProject = async () => {
    setIsRedeploying(true);
    setInProgress(true);
    await fetch(
      `${process.env.REACT_APP_DEPLOYMENT_API_URL_ROOT}/re-deploy-project/${deploymentId}`,
      {
        method: "post",
      }
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          if (inProgressStatuses.includes(res.data.status)) {
            ws.current.send(
              JSON.stringify({
                id: uuidv4(),
                deploymentId: deploymentId,
                textColor: "red",
                icon: "hand",
                content:
                  "Another deployment is already in progress! Please wait until it finishes..",
                deploymentStatus: "STARTED",
              } as DeploymentSocketMessage)
            );
          } else {
            dispatch(clearConsole());
          }
        } else {
          handleApiErrors(res.errors);
        }
      })
      .catch((err) => {
        console.log("err: ", err);
      })
      .finally(() => setIsRedeploying(false));
  };

  return (
    <Fragment>
      <Header />
      <main className="d-flex flex-column flex-grow-1 overflow-hidden">
        <Container
          fluid
          className="d-flex flex-column vh-100 flex-grow-1 overflow-hidden mx-0 px-0"
        >
          <div className="row mb-0 flex-grow-1 overflow-hidden">
            <div className="col-xl-3 col-lg-4 col-md-6 shadow p-4 card border-0 rounded-0 overflow-hidden">
              <ButtonGroup>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/")}
                >
                  <FontAwesomeIcon icon={faChevronLeft} size="sm" /> Back
                </Button>
                <Button
                  onClick={() => reDeployProject()}
                  disabled={isRedeploying || inProgress}
                >
                  {isRedeploying || inProgress ? (
                    <>
                      <FontAwesomeIcon icon={faCircleNotch} spin={true} className="me-1" />{" "}
                      Deploying...
                    </>
                  ) : (
                    "Re-deploy"
                  )}
                </Button>
              </ButtonGroup>

              <br />
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-3 d-flex align-items-center justify-content-between">
                  <span className="text-muted small">Project</span>
                  <strong className="small">{project.name}</strong>
                </li>
                <li className="list-group-item px-3 d-flex align-items-center justify-content-between">
                  <span className="text-muted small">Branch</span>
                  <strong className="small">{project.branch}</strong>
                </li>
                <li className="list-group-item px-3 d-flex align-items-center justify-content-between">
                  <span className="text-muted small">Live updates</span>
                  <strong
                    className={`small text-${
                      serverIsConnected ? "success" : "danger"
                    }`}
                  >
                    <span
                      className={`align-middle me-1 border border-4 border-${
                        serverIsConnected ? "success" : "danger"
                      } rounded-circle d-inline-block`}
                    />
                    {serverIsConnected ? "Connected" : "Disconnected"}
                  </strong>
                </li>
              </ul>
            </div>

            <CodeViewer serverIsConnected={serverIsConnected} />
          </div>
        </Container>
      </main>
      <Footer />
    </Fragment>
  );
};

export default DeploymentStatus;
