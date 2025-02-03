
import { ValidationErrors } from "@/validation";
import { IFormField } from "@/types";
import { Input } from "../ui/input";
import { Label } from "../ui/label";


interface Props extends IFormField {
  error: ValidationErrors;
}

const TextField = ({
  label,
  name,
  type,
  placeholder,
  disabled,
  autoFocus,
  error,
  defaultValue,
  readOnly,
}: Props) => {
  return (
    <div className="mb-3">
      <Label htmlFor={name} className="capitalize ">
        {label}
      </Label>
      <div className="mt-2">
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        name={name}
        id={name}
        defaultValue={defaultValue}
        readOnly={readOnly}
      />
      </div>
      {error && error[name] && (
        <p
          className={`text-accent mt-2 text-sm font-medium ${
            error[name] ? "text-destructive dark:text-red-700" : ""
          }`}
        >
          {error[name]}
        </p>
      )}
    </div>
  );
};

export default TextField;