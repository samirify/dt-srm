import { Button, ButtonGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/layout/BackButton";

const ErrorsLayout = (props) => {
  const availableFAQs = useSelector((state) => state.help.availableFAQs);

  const navigate = useNavigate();

  return (
    <main className="container">
      <div className="bg-light p-5 rounded mt-3 shadow">
        <div className="my-3">
          <h1>
            <i className="fa-solid fa-triangle-exclamation"></i>{" "}
            {props.errorTitle}
          </h1>
          {props.errorDetails ? (
            <p className="lead text-danger pt-3">
              <strong
                dangerouslySetInnerHTML={{ __html: props.errorDetails }}
              ></strong>
            </p>
          ) : null}
        </div>

        <div className="text-center mt-3">
          <hr />
          <ButtonGroup>
            <BackButton />
            {availableFAQs.length > 0 ? (
              <Button variant="dark" onClick={() => navigate("/help/faqs")}>
                <i className="fa-solid fa-question-circle me-2"></i> Frequently
                Asked Questions
              </Button>
            ) : null}
          </ButtonGroup>
        </div>
      </div>
    </main>
  );
};

export default ErrorsLayout;
