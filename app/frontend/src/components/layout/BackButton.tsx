import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button variant="secondary" onClick={() => navigate(-1)}>
      <i className="fa-solid fa-chevron-left me-2"></i> Back
    </Button>
  );
};

export default BackButton;
