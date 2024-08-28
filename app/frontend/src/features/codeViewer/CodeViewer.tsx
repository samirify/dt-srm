import { FC, Fragment } from "react";
import { useSelector } from "react-redux";

import CodeViewerControls from "./CodeViewerControls";
import CodeViewerLog from "./CodeViewerLog";

interface CodeViewerProps {
  serverIsConnected: boolean;
}

const CodeViewer: FC<CodeViewerProps> = ({ serverIsConnected }) => {
  const coloured = useSelector((state: any) => state.codeViewer.coloured);
  const showIcons = useSelector((state: any) => state.codeViewer.showIcons);

  return (
    <Fragment>
      <div
        className={`col-xl-9 col-lg-8 col-md-6 console-area shadow p-4 h-100 overflow-hidden ${
          coloured !== "yes" ? "console-no-colors" : ""
        } ${showIcons !== "yes" ? "console-no-icons" : ""}`}
      >
        <div className="row h-100 mb-3 mx-0 overflow-hidden">
          <div className="h-100">
            <div className="row h-100">
              <div className="col-12 h-100 p-0 m-0">
                <div className="card h-100 border-0">
                  <div className="card-header border-0 px-0">
                    <div className="row gx-1 console-heading">
                      <div className="col-6">
                        <div className="float-start mb-1">
                          <div
                            className="viewer-version mb-2 me-2"
                            title={
                              serverIsConnected
                                ? "Server is connected"
                                : "Server is disconnected"
                            }
                          >
                            Samirify Deployment v{process.env.REACT_APP_VERSION}
                            <span
                              className={`align-middle ms-2 border-${
                                serverIsConnected ? "green" : "red"
                              } rounded-circle d-inline-block`}
                            ></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <CodeViewerControls />
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-0 m-0 overflow-hidden">
                    <div className="h-100">
                      <div className="h-100 scrollable overflow-auto">
                        <CodeViewerLog />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CodeViewer;
