import { Accordion, Button, ButtonGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Footer from "../../../components/layout/Footer";
import Header from "../../../components/layout/Header";
import HelpFooter from "../layout/HelpFooter";
import BackButton from "../../../components/layout/BackButton";

const FAQsPage = () => {
  const availableFAQs = useSelector((state: any) => state.help.availableFAQs);
  const availableTopics = useSelector(
    (state: any) => state.help.availableTopics
  );

  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="container shadow rounded-bottom">
        <div className="rounded px-3 py-5">
          <h1 className=" text-white text-center mb-5">
            Frequently Asked Questions
          </h1>

          <div className="text-center mb-5">
            <ButtonGroup size={"sm"} className="border border-2">
              <BackButton />
              {availableTopics.length > 0 ? (
                <Button variant="primary" onClick={() => navigate("/help")}>
                  <i className="fa-solid fa-list me-2"></i> Browse Help topics
                </Button>
              ) : null}
            </ButtonGroup>
          </div>

          <Accordion defaultActiveKey="0">
            {availableFAQs.map((faq: any, index: any) => (
              <Accordion.Item key={index} eventKey={index}>
                <Accordion.Header>
                  <i className="fa-solid fa-question-circle me-2"></i>
                  <span>{faq.question}</span>
                </Accordion.Header>
                <Accordion.Body>
                  <strong className="text-success">
                    <i className="fa-regular fa-comment me-2"></i> Answer:
                  </strong>{" "}
                  <span dangerouslySetInnerHTML={{ __html: faq.answer }}></span>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          <HelpFooter />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQsPage;
