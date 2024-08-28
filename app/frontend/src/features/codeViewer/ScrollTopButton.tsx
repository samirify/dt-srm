import { Fragment } from "react";

import useOnScreen from "../../hooks/useOnScreen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";

export const ScrollTopButton = ({ areaRef }: any) => {
  const viewerRefIsVisible = useOnScreen(areaRef);

  return (
    <Fragment>
      {!viewerRefIsVisible ? (
        <button
          type="button"
          className="scroll-to-top"
          onClick={() => {
            areaRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            const navbar = document.querySelector<HTMLElement>(".navbar");
            window.scrollBy(0, -(navbar?.offsetHeight || 0));
          }}
        >
          <FontAwesomeIcon icon={faAngleUp} />
        </button>
      ) : null}
    </Fragment>
  );
};
