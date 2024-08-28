import { useSelector } from "react-redux";

const HelpTopicTitle = () => {
  const openTopic = useSelector((state: any) => state.help.openTopic);

  return <span className="float-start">{openTopic.title}</span>;
};

export default HelpTopicTitle;
