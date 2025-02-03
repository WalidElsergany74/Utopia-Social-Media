import { Pages, Routes } from "@/constants/enums"
import { IFormField, IFormFieldsVariables } from "@/types"

const useFormFields = ({slug }: IFormFieldsVariables ) => {
    const loginFields = () : IFormField[] => 
        [
           
            {
                label : "Email",
                type : "email",
                placeholder : "Enter your Email",
                autoFocus : true,
                name : "email"
            },
            {
                label : "Password",
                type : "password",
                placeholder : "Enter your password",
                autoFocus : true,
                name : "password"
            }
        ]
    const registerFields = () : IFormField[] => 
        [
            {
                label : "Frist Name",
                type : "text",
                placeholder : "Enter your First name",
                autoFocus : true,
                name : "firstname"
            },
            {
                label : "Last Name",
                type : "text",
                placeholder : "Enter your Last name",
                autoFocus : true,
                name : "lastname"
            },
            
            {
                label : "Email",
                type : "email",
                placeholder : "Enter  Email",
                autoFocus : true,
                name : "email"
            },
            {
                label : "Password",
                type : "password",
                placeholder : "Enter  password",
                autoFocus : true,
                name : "password"
            },
            {
                label : "Confirm Password",
                type : "password",
                placeholder : "Enter confirm password",
                autoFocus : true,
                name : "confirmPassword"
            }
        ]

        const profileFields = (): IFormField[] => [
            {
              label: "Name",
              name: "name",
              type: "text",
              placeholder: "Enter your name",
              autoFocus: true,
            },
            {
                label: "Email",
                name: "email",
                type: "email",
                placeholder: "Your email",
              },
            {
              label: "Bio",
              name: "bio",
              type: "text",
              placeholder: "Enter your bio",
            },
            {
              label: "Location",
              name: "location",
              type: "text",
              placeholder: "Enter your Country",
            },
            {
              label: "Website",
              name: "website",
              type: "text",
              placeholder: "Enter your Website",
            },
          ];
        
        

        const getFormFields = () : IFormField[] => {
            switch(slug) {
              case Pages.LOGIN :
                  return loginFields()
              case Pages.Register :
                  return registerFields()
                  case Routes.PROFILE:
                    return profileFields();
                  default : 
                  return []
            }
          }
  
          return {
              getFormFields
          } 

       

        }
        export default useFormFields;