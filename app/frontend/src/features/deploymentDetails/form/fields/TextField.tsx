import { FC } from "react";
import { Form } from "react-bootstrap";
import { FieldProps } from "../Forms.d";

const TextField: FC<FieldProps> = ({
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
  readonly = false,
  onBlur,
  type,
}) => {
  const { values, errors, touched, handleChange } = formikProps;

  return (
    <Form.Group
      className={(groupClassName || "") + " sfy-field mb-3"}
      controlId={id}
    >
      {showLabel && <Form.Label>{label}</Form.Label>}
      <Form.Control
        type={type || "text"}
        name={name}
        value={values[name] || ""}
        onChange={handleChange}
        onBlur={(e) => {
          if (onBlur) onBlur(e);
        }}
        placeholder={placeholder}
        className={
          (className || "") +
          " " +
          (errors[name] && touched[name] ? "is-invalid" : "") +
          (readonly ? " readonly" : "")
        }
        required={required}
        disabled={disabled}
        readOnly={readonly}
        autoComplete={name}
      />
      <span className="bottom-border"></span>
      {errors[name] && touched[name] && (
        <Form.Text className="invalid-feedback">
          {errors[name]?.toString()}
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default TextField;
