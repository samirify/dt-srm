import {
  faCheckCircle,
  faClock,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Col, Form, InputGroup, Pagination, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const DeploymentsTable = ({
  deployments = [],
  title = "",
}: {
  deployments: any;
  title?: string;
}) => {
  const [data, setData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [numOfPages, setNumOfPages] = useState<number>(1);
  const [disablePrevBtn, setDisablePrevBtn] = useState<boolean>(false);
  const [disableNextBtn, setDisableNextBtn] = useState<boolean>(false);

  const goOnPrevPage = () => {
    if (currentPageNumber <= 1) {
      return;
    }

    setCurrentPageNumber((prev) => prev - 1);
  };

  const goOnNextPage = () => {
    if (currentPageNumber > deployments.length / rowsPerPage) {
      return;
    }

    setCurrentPageNumber((prev) => prev + 1);
  };

  useEffect(() => {
    setNumOfPages(Math.ceil(deployments.length / rowsPerPage));
    const setTableData = async () => {
      const start = (currentPageNumber - 1) * rowsPerPage;
      const end = currentPageNumber * rowsPerPage;

      if (searchQuery) {
        const _deployments = deployments.slice(start, end);
        setData(
          _deployments.filter((rec: any) =>
            Object.values(rec).some((val: any) => {
              return val.toString().includes(searchQuery);
            })
          )
        );
      } else {
        setData(deployments.slice(start, end));
      }
    };

    setTableData();

    if (currentPageNumber <= 1) setDisablePrevBtn(true);
    else setDisablePrevBtn(false);

    if (currentPageNumber > deployments.length / rowsPerPage)
      setDisableNextBtn(true);
    else setDisableNextBtn(false);
  }, [currentPageNumber, rowsPerPage, deployments, searchQuery]);

  return (
    <>
      <Row className="border-bottom bg-light mb-3 mx-1">
        <Col sm={8}>
          {title && <h5 className="py-3 text-primary">{title}</h5>}
        </Col>
        <Col sm={4} className="py-3">
          <InputGroup size="sm">
            <Form.Control
              placeholder="Search.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
              aria-describedby="search-addon"
              className="bg-white"
            />
            <Form.Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
              }}
              style={{
                maxWidth: "30%",
              }}
            >
              <option value={5}> 5 </option>
              <option value={10}> 10 </option>
              <option value={25}> 25 </option>
              <option value={100}> 100 </option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>
      <div className="overflow-auto">
        <table className="table table-responsive small shadow-sm">
          <thead>
            <tr>
              <th scope="col">Pipeline ID</th>
              <th scope="col">Project</th>
              <th scope="col">Branch</th>
              <th scope="col">Deployed At</th>
              <th scope="col" className="text-center">
                Status
              </th>
              <th scope="col" className="text-center">
                View
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((deployment: any) => {
                return (
                  <tr key={deployment.id}>
                    <td>{deployment.id}</td>
                    <td>{deployment.project_code}</td>
                    <td>{deployment.branch}</td>
                    <td>
                      {deployment.created_date !== null
                        ? dayjs(deployment.created_date).format(
                            "DD-MM-YYYY @ HH:mm:ss"
                          )
                        : ""}
                    </td>

                    {(() => {
                      switch (deployment.status_code) {
                        case "STARTED":
                          return (
                            <td className="text-center">
                              <FontAwesomeIcon
                                className="text-warning"
                                icon={faClock}
                                spin={true}
                              />
                            </td>
                          );
                        case "SUCCEEDED":
                          return (
                            <td className="text-center">
                              <FontAwesomeIcon
                                className="text-success"
                                icon={faCheckCircle}
                              />
                            </td>
                          );
                        case "FAILED":
                          return (
                            <td className="text-center">
                              <FontAwesomeIcon
                                className="text-danger"
                                icon={faTimesCircle}
                              />
                            </td>
                          );
                        default:
                          <td></td>;
                      }
                    })()}

                    <td className="text-center">
                      <Link
                        className="text-decoration-none"
                        to={`/deployment-status/${deployment.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No pipeline found!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination size="sm" className="justify-content-center">
        <Pagination.Item disabled={disablePrevBtn} onClick={goOnPrevPage}>
          Previous
        </Pagination.Item>

        {(() => {
          let rows = [];
          for (let i = 0; i < numOfPages; i++) {
            const pageNum = i + 1;
            rows.push(
              <Pagination.Item
                key={i}
                active={pageNum === currentPageNumber}
                onClick={() => setCurrentPageNumber(pageNum)}
              >
                {pageNum}
              </Pagination.Item>
            );
          }
          return rows;
        })()}

        <Pagination.Item disabled={disableNextBtn} onClick={goOnNextPage}>
          Next
        </Pagination.Item>
      </Pagination>
    </>
  );
};

export default DeploymentsTable;
