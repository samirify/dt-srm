import { useEffect, useState } from "react";
import { Card, Button, ButtonGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Footer from "../../../components/layout/Footer";
import Header from "../../../components/layout/Header";
import { setOpenTopic } from "../helpSlice";
import HelpFooter from "../layout/HelpFooter";
import BackButton from "../../../components/layout/BackButton";

const HelpMainPage = () => {
  const [filteredTopics, setFilteredTopics] = useState([]);

  const availableTopics = useSelector(
    (state: any) => state.help.availableTopics
  );
  const availableFAQs = useSelector((state: any) => state.help.availableFAQs);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTopicsSearch = (e: any) => {
    setFilteredTopics(
      availableTopics.filter((topic: any) => {
        return topic.title.toUpperCase().includes(e.target.value.toUpperCase());
      })
    );
  };

  useEffect(() => {
    setFilteredTopics(availableTopics);
  }, [availableTopics]);

  return (
    <>
      <Header />
      <div className="container shadow rounded-bottom">
        <div className="rounded px-3 py-5">
          <h1 className=" text-white text-center mb-5">Help topics</h1>

          <div className="text-center mb-5">
            <ButtonGroup size={"sm"} className="border border-2">
              <BackButton />
              {availableFAQs.length > 0 ? (
                <Button
                  variant="primary"
                  onClick={() => navigate("/help/faqs")}
                >
                  <i className="fa-solid fa-question-circle me-2"></i>{" "}
                  Frequently Asked Questions
                </Button>
              ) : null}
            </ButtonGroup>
          </div>

          <div className="d-flex justify-content-center">
            <div className="search-box w-100">
              <form>
                <input
                  className="form-control p-2 bg-transparent"
                  placeholder="What are you looking for?"
                  onChange={handleTopicsSearch}
                />
                <button className="btn btn-light" type="button">
                  <i className="fa-solid fa-search" />
                </button>
              </form>
            </div>
          </div>

          {availableTopics.length <= 0 ? (
            <h5>No available topics at present! Please come back later.</h5>
          ) : filteredTopics.length > 0 ? (
            <>
              {filteredTopics.map((topic: any, index) => (
                <Card key={index} className="shadow mb-2">
                  <Card.Body>
                    <Card.Title>{topic.title}</Card.Title>
                    <Card.Subtitle className="my-3 text-muted">
                      {topic.subTitle}
                    </Card.Subtitle>
                    <Card.Body>
                      <Button
                        onClick={() => dispatch(setOpenTopic(topic))}
                        className="float-end"
                      >
                        View topic
                      </Button>
                    </Card.Body>
                  </Card.Body>
                </Card>
              ))}
            </>
          ) : (
            <h5 className="bg-white p-5 text-center rounded">
              No available topics matching your query!
            </h5>
          )}
        </div>
        <HelpFooter />
      </div>
      <Footer />
    </>
  );
};

export default HelpMainPage;
