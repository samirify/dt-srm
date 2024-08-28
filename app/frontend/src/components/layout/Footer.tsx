import logoSrc from "../../assets/images/logo-grey.png";

const Footer = () => {
  return (
    <div className="footer text-center">
      <small className="text-muted">
        <img className="inline-logo" src={logoSrc} alt="Logo" width={16} />{" "}
        <span className="small">Samirify Deployment</span> v
        {process.env.REACT_APP_VERSION}
      </small>
    </div>
  );
};

export default Footer;
