import { FC, useEffect } from "react";
import { Form } from "react-bootstrap";
import { SelectFieldProps } from "../Forms.d";

const SelectField: FC<SelectFieldProps> = ({
  id,
  label = "",
  showLabel = true,
  name,
  formikProps,
  placeholder = "",
  groupClassName = "",
  className = "",
  required = false,
  disabled = false,
  choices = [],
  excludeEmpty = false,
  customOnChange,
}) => {
  const { values, errors, touched, handleChange, setFieldValue } = formikProps;

  useEffect(() => {
    if (excludeEmpty === true) {
      setFieldValue(
        name,
        values[name] || (choices.length > 0 ? choices[0].id : null)
      );
    }
  }, [excludeEmpty, values, choices, name, setFieldValue]);

  return (
    <Form.Group
      className={(groupClassName || "") + " sfy-field mb-3"}
      controlId={id}
    >
      {showLabel && <Form.Label>{label}</Form.Label>}
      <Form.Select
        name={name}
        value={values[name] || ""}
        onChange={(e) => {
          handleChange(e);
          if (typeof customOnChange === "function") {
            customOnChange(e);
          }
        }}
        className={
          (className || "") +
          " " +
          (errors[name] && touched[name] ? "is-invalid" : "")
        }
        required={required}
        disabled={disabled}
      >
        {excludeEmpty ? <></> : <option value={""}>--- Select ---</option>}
        {choices.map((choice: any) => (
          <option key={choice.id} value={choice.id}>
            {choice.name}
          </option>
        ))}
      </Form.Select>
      <span className="bottom-border"></span>
      {errors[name] && touched[name] && (
        <Form.Text className="invalid-feedback">
          {errors[name]?.toString()}
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default SelectField;
