import { Fragment, useCallback, useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { setProject } from "./deploymentDetailsSlice";
import { useNavigate } from "react-router-dom";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { Alert, Button, Card, Col, Row } from "react-bootstrap";
import BootstrapSelectField from "./form/fields/SelectField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { Choice } from "./form/Forms.d";
import { HeaderMessage, steps } from "./deploymentDetailsUtil";
import { clearConsole } from "../codeViewer/codeViewerSlice";
import DeploymentsTable from "./table/DeploymentsTable";

const DeploymentDetails = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [headerMessage, setHeaderMessage] = useState<HeaderMessage>(
    steps.selectProject
  );

  const [availableProjects, setAvailableProjects] = useState<Choice[]>([]);
  const [deployments, setDeployments] = useState<Choice[]>([]);
  const [branches, setBranches] = useState<Choice[]>([]);

  const projectFormSchema = Yup.object().shape({
    project: Yup.string().required("Please select a project"),
    branch: Yup.string().required("Please select a branch"),
  });

  const initialValues = {
    project: "",
    branch: "",
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const determineHeaderMsg = (branches: Choice[], branchSelected?: boolean) => {
    if (branches.length > 0) {
      if (branchSelected) {
        setHeaderMessage({
          ...steps.deploy,
          isLoading: false,
          variant: "success",
        });
      } else {
        setHeaderMessage({
          ...steps.selectBranch,
          isLoading: false,
          variant: "light",
        });
      }
    } else {
      setHeaderMessage({
        text: "No branches found! Select another project",
        isLoading: false,
        variant: "danger",
        icon: faBan,
      });
    }
  };

  const getRepoData = async (projectCode: string) => {
    setBranches([]);
    setIsLoading(true);
    setHeaderMessage({
      ...steps.selectBranch,
      isLoading: true,
      variant: "warning",
    });
    await fetch(
      `${process.env.REACT_APP_DEPLOYMENT_API_URL_ROOT}/project-data/${projectCode}`
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          setBranches(res.data.branches);
          determineHeaderMsg(res.data.branches);
        } else {
          // TODO: handle errors
        }
      })
      .catch((err) => {
        determineHeaderMsg([]);
        console.log("err: ", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setHeaderMessage({
      ...steps.selectProject,
      isLoading: true,
      variant: "warning",
    });

    await fetch(`${process.env.REACT_APP_DEPLOYMENT_API_URL_ROOT}/projects`)
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          setAvailableProjects(res.data.projects);
          setDeployments(res.data.deployments);
        } else {
          // handle errors
        }
      })
      .catch((err) => {
        console.log("err: ", err);
        setHeaderMessage({
          text: "Failed to retrieve projects!",
          isLoading: false,
          variant: "danger",
          icon: faBan,
        });
      })
      .finally(() => {
        setIsLoading(false);
        setHeaderMessage({
          ...steps.selectProject,
          isLoading: false,
          variant: "light",
        });
      });
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const deployProject = async (values: any, actions: any) => {
    setHeaderMessage({
      ...steps.deploy,
      isLoading: true,
      variant: "warning",
    });
    await fetch(
      `${process.env.REACT_APP_DEPLOYMENT_API_URL_ROOT}/deploy-project`,
      {
        method: "post",
        body: JSON.stringify(values),
      }
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          dispatch(clearConsole());
          navigate(`/deployment-status/${res.data.deploymentId}`);
        } else {
          // handle errors
        }
      })
      .catch((err) => {
        console.log("err: ", err);
        setHeaderMessage({
          ...steps.deploy,
          isLoading: false,
          variant: "success",
        });
      })
      .finally(() => actions.setSubmitting(false));
  };

  return (
    <Fragment>
      <Formik
        initialValues={initialValues}
        validationSchema={projectFormSchema}
        onSubmit={(values, actions) => deployProject(values, actions)}
        enableReinitialize={true}
      >
        {(formik: any) => {
          const { handleSubmit, dirty, isValid, isSubmitting } = formik;
          return (
            <Card className="mx-1 my-5 shadow-sm border-0 rounded-2">
              <Card.Header className="bg-white p-0 border-0 rounded-2">
                <Alert
                  variant={headerMessage.variant}
                  className={`rounded-0 m-0 border-top-0 border-start-0 border-end-0 border-3 rounded-2`}
                >
                  <h4 className={`my-4 text-center`}>
                    {" "}
                    {headerMessage.isLoading ? (
                      <>
                        <FontAwesomeIcon icon={faCircleNotch} spin={true} />{" "}
                        {headerMessage.loadingMessage}
                      </>
                    ) : (
                      <>
                        {headerMessage.icon && (
                          <>
                            <FontAwesomeIcon icon={headerMessage.icon} />{" "}
                          </>
                        )}
                        {headerMessage.text}
                      </>
                    )}
                  </h4>
                </Alert>
              </Card.Header>
              <Card.Body className="py-4 px-5 bg-light rounded-2">
                <FormikForm noValidate onSubmit={handleSubmit}>
                  <Row>
                    <Col sm={6}>
                      <BootstrapSelectField
                        id="validationProject"
                        name="project"
                        label="Project"
                        formikProps={formik}
                        choices={availableProjects}
                        disabled={availableProjects.length <= 0 || isSubmitting}
                        customOnChange={(e) => {
                          if (e.target.value) {
                            getRepoData(e.target.value);
                            dispatch(
                              setProject(
                                availableProjects.find(
                                  (p) => p.id === e.target.value
                                )
                              )
                            );
                          } else {
                            setHeaderMessage({
                              ...steps.selectProject,
                              isLoading: false,
                              variant: "light",
                            });
                            setBranches([]);
                          }
                        }}
                      />
                    </Col>

                    <Col sm={6}>
                      <BootstrapSelectField
                        id="validationBranch"
                        name="branch"
                        label="Branch"
                        formikProps={formik}
                        choices={branches}
                        disabled={branches.length <= 0 || isSubmitting}
                        customOnChange={(e) => {
                          if (e.target.value) {
                            determineHeaderMsg(branches, true);
                          } else {
                            determineHeaderMsg(branches);
                          }
                        }}
                      />
                    </Col>
                  </Row>

                  <Row className="py-3 text-end">
                    <Col>
                      <Button
                        // disabled={isSubmitting || isLoading}
                        disabled={
                          isLoading ||
                          !(dirty && isValid) ||
                          isSubmitting ||
                          branches.length <= 0 ||
                          availableProjects.length <= 0
                        }
                        variant="primary"
                        size="sm"
                        type="submit"
                        value="Deploy"
                        className="px-4"
                      >
                        {isSubmitting ? (
                          <>
                            <FontAwesomeIcon icon={faCircleNotch} spin={true} />{" "}
                            Deploying...
                          </>
                        ) : (
                          "Deploy"
                        )}
                      </Button>
                    </Col>
                  </Row>
                </FormikForm>
                <hr />
                <DeploymentsTable
                  title="Previously deployed pipelines"
                  deployments={deployments}
                />
              </Card.Body>
            </Card>
          );
        }}
      </Formik>
    </Fragment>
  );
};

export default DeploymentDetails;
