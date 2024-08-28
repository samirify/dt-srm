import { FormikProps, FormikValues } from "formik";
import { CSSProperties } from "react";

export type Choice = {
  id: string;
  name: string;
};

export interface FieldProps {
  id: string;
  name: string;
  label?: string;
  showLabel?: boolean;
  placeholder?: string;
  className?: string;
  groupClassName?: string;
  formikProps: FormikProps<FormikValues>;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  choices?: Choice[];
  checked?: boolean;
  defaultChecked?: boolean;
  onBlur?: (e: any) => void;
  customOnChange?: (e: any) => void;
  type?: string;
  value?: any;
  style?: CSSProperties;
  groupStyle?: CSSProperties;
}

export interface SelectFieldProps extends FieldProps {
  excludeEmpty?: boolean;
}
