"use server"
import { db } from "@/lib/prisma";
import { loginSchema, signUpSchema } from "@/validation";
import bcrypt from "bcrypt"

export const login = async (
    credentials: Record<"email" | "password", string> | undefined,
) => {
   const result = loginSchema().safeParse(credentials);
    if (result.success === false) {
      return {
        error: result.error.formErrors.fieldErrors,
        status: 400,
      };
      }
      try {
        const user = await db.user.findUnique({
          where: {
            email: result.data.email,
          },
        });
        if (!user) {
          return { message: "User Not Found.", status: 401 };
        }
        const hashedPassword = user.password;
        const isValidPassword = await bcrypt.compare(
          result.data.password,
          hashedPassword
        );
        if (!isValidPassword) {
          return {
            message: "Password incorrect",
            status: 401,
          };
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return {
          user: userWithoutPassword,
          status: 200,
          message: "Login done successfully",
        };
      } catch (error) {
        console.error(error);
        return {
          status: 500,
          message: "unexpected Error",
        };
      }
}
export const signUp = async (prevState : unknown, formData : FormData) => {
  const result =  signUpSchema().safeParse(
    Object.fromEntries(formData.entries())
  );
  if(result.success === false) {
    return {
      error: result.error.formErrors.fieldErrors,
      status: 400,
      formData
    };
  }
  try {
    const user = await db.user.findUnique({
      where : {
        email : result.data.email
      }
    })
    if(user) {
      return {
        status : 409,
        message : "User already exist",
        formData
      }
     };
     const fullName = `${result.data.firstname}  ${result.data.lastname}`.trim();
     const generatedUsername =  result.data.email.split('@')[0];
     const hashedPaswword  = await bcrypt.hash(result.data.password, 10);
     const createdUser = await db.user.create({
      data : {
        name : fullName,
        username: generatedUsername,
        email : result.data.email,
        password : hashedPaswword
      }
    })
    return {
      status : 201,
      message : "Account created successfully",
      user : {
        id : createdUser.id,
        username : createdUser.username,
        email : createdUser.email
      }
    }
  } catch (error) {
     console.log(error);
     return {
      status : 500,
      message : "unexpected error"
     }
  }
}