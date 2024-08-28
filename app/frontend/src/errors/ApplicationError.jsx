import ErrorsLayout from "./ErrorsLayout";

const ApplicationError = (props) => {
  return (
    <ErrorsLayout
      errorTitle={props.errorTitle || "Opps!"}
      errorDetails={props.errorDetails}
    />
  );
};

export default ApplicationError;
