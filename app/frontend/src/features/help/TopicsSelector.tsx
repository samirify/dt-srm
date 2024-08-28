import { Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setOpenTopic } from "./helpSlice";
import { Link } from "react-router-dom";
import { FC } from "react";

interface TopicsSelectorProps {
  topics: any;
  fullWidth?: boolean;
  topicsTitle?: boolean;
}

const TopicsSelector: FC<TopicsSelectorProps> = ({
  topics,
  fullWidth = false,
  topicsTitle = true,
}) => {
  const dispatch = useDispatch();

  return (
    <Dropdown.Menu variant="" className={`shadow ${fullWidth ? "w-100" : ""}`}>
      {topicsTitle ? (
        <Dropdown.ItemText className="text-muted">
          <small className="text-uppercase">Topics</small>
        </Dropdown.ItemText>
      ) : null}
      {topics.map((topic: any, index: number) => (
        <Dropdown.Item
          key={index}
          onClick={() => dispatch(setOpenTopic(topic))}
        >
          {topic.title}
        </Dropdown.Item>
      ))}
      <Dropdown.Divider />
      <Dropdown.Item as={Link} to={"/help/faqs"}>
        FAQs
      </Dropdown.Item>
      <Dropdown.Item as={Link} to={"/help"}>
        All topics
      </Dropdown.Item>
    </Dropdown.Menu>
  );
};

export default TopicsSelector;
