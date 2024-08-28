import { FC, Fragment } from "react";

import Header from "./layout/Header";
import Footer from "./layout/Footer";
import DeploymentDetails from "../features/deploymentDetails/DeploymentDetails";
import { Col, Container, Row } from "react-bootstrap";

interface MainProps {}

const Main: FC<MainProps> = () => {
  return (
    <Fragment>
      <Header />
      <main className="d-flex flex-column flex-grow-1 overflow-hidden">
        <Container className="d-flex flex-column">
          <Row className="mb-0 flex-grow-1">
            <Col>
              <DeploymentDetails />
            </Col>
          </Row>
        </Container>
        <Footer />
      </main>
    </Fragment>
  );
};

export default Main;
