import type { UseFormRegister, FieldErrors, Control } from "react-hook-form";

export interface BaseInputProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>;
}

export interface ControlledInputProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>;
}
