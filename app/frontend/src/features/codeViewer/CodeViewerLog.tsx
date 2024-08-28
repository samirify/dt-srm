import { Fragment, useEffect, useRef } from "react";

import { useSelector } from "react-redux";
import { ScrollTopButton } from "./ScrollTopButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";

const CodeViewerLog = () => {
  const codeLines = useSelector((state: any) => state.codeViewer.codeLines);
  const fontSize = useSelector((state: any) => state.codeViewer.fontSize);

  const viewerRef = useRef(null);
  const bottomRef = useRef<null | HTMLElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    const navbar = document.querySelector<HTMLElement>('.navbar')
    window.scrollBy(0, - (navbar?.offsetHeight || 0));
  }, [codeLines]);

  const CodeLine = ({
    newLine = true,
    line = null,
  }: {
    newLine?: boolean;
    line?: JSX.Element | null;
  }) => {
    return (
      <>
        <div className="line-icon">
          <FontAwesomeIcon
            icon={faAngleRight}
            className={`fa-2xs mt-2 ${
              newLine ? "fa-fade code-new-line-cursor" : ""
            }`}
          />
        </div>
        <div className="line-content">{line}</div>
      </>
    );
  };

  return (
    <>
      <pre className={`h-100 overflow-auto w-100 m-0 p-0 font-${fontSize}`}>
        <div ref={viewerRef}></div>
        <ul className="px-0">
          {codeLines.map((line: any, index: number) => (
            <Fragment key={index}>
              <li className="line text-wrap">
                <CodeLine
                  newLine={false}
                  line={
                    <span className={` ${line.textColor}`}>
                      {line.icon ? (
                        <FontAwesomeIcon
                          icon={["fas", line.icon]}
                          className="console-icons show-console-icons"
                        />
                      ) : null}
                      <span
                        dangerouslySetInnerHTML={{ __html: line.content }}
                      ></span>
                    </span>
                  }
                />
              </li>
              {line.longOperation ? (
                <li className="line text-wrap">
                  <CodeLine
                    newLine={false}
                    line={
                      <span className={`info`}>
                        <FontAwesomeIcon
                          icon={faClock}
                          className="console-icons show-console-icons"
                        />
                        <span>
                          This operation may take a long time! Please be
                          patient.
                        </span>
                      </span>
                    }
                  />
                </li>
              ) : null}
            </Fragment>
          ))}
          <li className="line">
            <CodeLine />
          </li>
        </ul>
        <span ref={bottomRef}></span>
      </pre>
      <ScrollTopButton areaRef={viewerRef} />
    </>
  );
};

export default CodeViewerLog;
