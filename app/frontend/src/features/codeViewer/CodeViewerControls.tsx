import { Fragment } from "react";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  clearConsole,
  fontSizes,
  setFontSize,
  toggleColor,
  toggleIcons,
} from "./codeViewerSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faEyeDropper,
  faFont,
  faTarpDroplet,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const CodeViewerControls = () => {
  const project = useSelector((state: any) => state.deploymentDetails.project);
  const coloured = useSelector((state: any) => state.codeViewer.coloured);
  const showIcons = useSelector((state: any) => state.codeViewer.showIcons);
  const fontSize = useSelector((state: any) => state.codeViewer.fontSize);

  const dispatch = useDispatch();

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Fragment>
      <ButtonGroup className="float-end mb-1">
        <Button
          variant="outline-info"
          className="btn-xs"
          onClick={() => dispatch(clearConsole())}
        >
          <span className="d-none d-lg-none d-xl-inline">Clear</span>{" "}
          <FontAwesomeIcon icon={faTrash} />
        </Button>
        <Button
          variant="outline-info"
          className={`btn-xs ${coloured === "yes" ? "active" : ""}`}
          onClick={() =>
            dispatch(toggleColor(coloured === "yes" ? "no" : "yes"))
          }
        >
          <span className="d-none d-lg-none d-xl-inline">Colored</span>{" "}
          <FontAwesomeIcon icon={faEyeDropper} />
        </Button>
        <Button
          variant="outline-info"
          className={`btn-xs ${showIcons ? "active" : ""}`}
          onClick={() =>
            dispatch(toggleIcons(showIcons === "yes" ? "no" : "yes"))
          }
        >
          <span className="d-none d-lg-none d-xl-inline">Icons</span>{" "}
          <FontAwesomeIcon icon={faTarpDroplet} />
        </Button>
        <Button
          variant="outline-info"
          className="btn-xs"
          onClick={() =>
            openInNewTab(
              `${process.env.REACT_APP_DEPLOYMENT_API_URL_ROOT}/export-project-log/${project.deploymentId}`
            )
          }
        >
          <span className="d-none d-lg-none d-xl-inline">Log</span>{" "}
          <FontAwesomeIcon icon={faClockRotateLeft} />
        </Button>
        <Dropdown as={ButtonGroup}>
          <Dropdown.Toggle
            variant="outline-info"
            id="dropdown-basic"
            className="btn-xs"
            as={Button}
          >
            <span className="d-none d-lg-none d-xl-inline">
              {fontSizes[fontSize].label}
            </span>{" "}
            <FontAwesomeIcon icon={faFont} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {Object.keys(fontSizes).map((key: string) => (
              <Dropdown.Item
                key={key}
                className="small"
                onClick={() => dispatch(setFontSize(key))}
              >
                {fontSizes[key].label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
    </Fragment>
  );
};

export default CodeViewerControls;
