import *  as z from "zod";
export const loginSchema = () => {
    return z.object({
        email : z.string().trim().email({
          message : "Must be a valid email"
        }),
        password : z.string().min(6 , {message :"Password must be at least 6 characters" })
        .max(40 , "Password must be at most 40 characters" )
    })
  }
  export const signUpSchema = () => {
    return z.object({
      firstname : z.string().trim().min(1 , "First Name is required"),
        lastname : z.string().trim().min(1 , "Last Name is required"),
        email : z.string().trim().email({
          message : "Not valid email"
        }),
        password : z.string().min(6 , {message : "Password must be 6 characters at least"})
        .max(40 , "Password must be at most 40 characters"),
        confirmPassword : z.string().min(4 , {message : "Password must be 6 characters at least"})
        .max(40 , "Password must be at most 40 characters")
  
    }).refine((data) => data.password === data.confirmPassword, {
      message : "Password do not match",
      path : ["confirmPassword"]
    })
  }

export type ValidationErrors =
  | {
      [key: string]: string[];
    }
  | undefined;