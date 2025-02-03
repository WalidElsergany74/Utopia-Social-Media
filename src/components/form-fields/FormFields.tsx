import { InputTypes } from "@/constants/enums";
import { IFormField } from "@/types";
import { ValidationErrors } from "@/validation";
import TextField from "./Text-Field";
import PasswordField from "./password-fields";



interface Props extends IFormField {
  error: ValidationErrors;
}

const FormFields =  (props: Props) => {
  
  const { type } = props;
  const renderField = (): React.ReactNode => {
    if (type === InputTypes.EMAIL || type === InputTypes.TEXT) {
      return <TextField  {...props} />;
    }

    if (type === InputTypes.PASSWORD) {
      return <PasswordField {...props} />;
    }


    return <TextField {...props} />;
  };

  return <>{renderField()}</>;
};

export default FormFields;
