import logoSrc from "../../assets/images/logo.png";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Nav, Navbar } from "react-bootstrap";
import Help from "../../features/help/Help";

const Header = () => {
  const project = useSelector((state: any) => state.deploymentDetails.project);

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="px-1 py-3 shadow">
      <Container fluid>
        <Navbar.Brand as={Link} to={"/"}>
          <img className="mb-1" src={logoSrc} alt="Logo" height={18} /> Samirify
          Deployment
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll">
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <Help />
          </Nav>
          {project && (
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                <span>
                  Project: <span className="text-primary">{project.name}</span>
                </span>
              </Navbar.Text>
            </Navbar.Collapse>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
