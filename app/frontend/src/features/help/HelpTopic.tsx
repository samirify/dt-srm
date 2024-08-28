import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import SlidingPane from "react-sliding-pane";
import { clearTopic } from "./helpSlice";
import HelpTopicTitle from "./HelpTopicTitle";

const HelpTopic = () => {
  const [loadingContent, setLoadingContent] = useState(true);
  const openTopic = useSelector((state: any) => state.help.openTopic);

  const dispatch = useDispatch();

  const [content, setContent] = useState("");

  const fetchContent = useCallback(() => {
    setLoadingContent(true);

    fetch(
      `${process.env.REACT_APP_DEPLOYMENT_API_URL_ROOT}/help/topic/${openTopic.code}`
    )
      .then(
        (res) => {
          res.json().then((response) => {
            if (response.success) {
              setContent(response.data["content"]);
            } else {
              throw Error("Could not retrieve topic!");
            }
          });
        },
        (err) => {
          setContent("Could not retrieve topic!");
        }
      )
      .catch((error) => {
        setContent(error);
      })
      .finally(() => {
        setLoadingContent(false);
      });
  }, [openTopic.code]);

  useEffect(() => {
    if (Object.keys(openTopic).length !== 0) {
      fetchContent();
    }
  }, [openTopic, fetchContent]);

  return (
    <SlidingPane
      isOpen={Object.keys(openTopic).length !== 0}
      title={<HelpTopicTitle />}
      subtitle={openTopic.subTitle ?? ""}
      onRequestClose={() => {
        dispatch(clearTopic());
      }}
    >
      {loadingContent ? (
        <h4>
          <i className="fa-solid fa-circle-notch fa-spin"></i> Loading...
        </h4>
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: content,
          }}
        ></div>
      )}
    </SlidingPane>
  );
};

export default HelpTopic;
