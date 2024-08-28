import { Dropdown } from "react-bootstrap";
import { useSelector } from "react-redux";
import HelpTopic from "./HelpTopic";
import TopicsSelector from "./TopicsSelector";

const Help = () => {
  const availableTopics = useSelector((state: any) => state.help.availableTopics);

  return (
    <>
      {availableTopics ? (
        <>
          <Dropdown>
            <Dropdown.Toggle size="sm" className="w-100" variant="outline-secondary">
              Help <i className="fa-solid fa-question-circle"></i>
            </Dropdown.Toggle>

            <TopicsSelector topics={availableTopics} />
          </Dropdown>
          <HelpTopic />
        </>
      ) : null}
    </>
  );
};

export default Help;
