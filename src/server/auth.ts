import { Environments, Pages, Routes } from "@/constants/enums"
import { db } from "@/lib/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { DefaultSession, type NextAuthOptions} from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { login } from "./_actions/auth"
import { User } from "@prisma/client"
import { JWT } from "next-auth/jwt"





declare module "next-auth" {
    interface Session extends DefaultSession {
      user: User;
    }
  }

  declare module "next-auth/jwt" {
    interface JWT extends Partial<User> {
      id: string;
      username: string;
      email: string;
    }
  }

export const authOptions : NextAuthOptions =  {
    callbacks: {
        session: ({ session, token }) => {
            if (token) {
                  session.user.id = token.id;
                  session.user.username = token.username;
                  session.user.image = token.image as string;
                  session.user.bio = token.bio as string ;
                  session.user.website = token.website as string;
                  session.user.location = token.location as string;
              }
          return {
            ...session,
            user: {
              ...session.user,
              id: token.id,
              username: token.username,
              email: token.email,
              image: token.image,
            },
          };
        },
        jwt: async ({ token }): Promise<JWT> => {
          const dbUser = await db.user.findUnique({
            where: {
              email: token?.email,
            },
          });
          if (!dbUser) {
            return token;
          }
          return {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            image: dbUser.image,
            bio : dbUser.bio,
            location : dbUser.location,
            website : dbUser.website,
          };
        },
      },
    session : {
        strategy : "jwt",
      maxAge : 7 * 24 * 60 * 60,
      updateAge : 24 * 60 * 60
    },
    secret : process.env.NEXTAUTH_SECRET,
    debug : process.env.NODE_ENV === Environments.DEV ,
    providers : [Credentials({
        name: "credentials",
        credentials: {
            email: {
                label: "Email",
                placeholder: "tetst@gmail.com",
                type: "email"
            },
            password: {
                label: "Password",
                placeholder: "Password",
                type: "password"
            }
        },
        authorize: async function (credentials) {
            const res = await login(credentials)
             if(res.status === 200 && res.user){
                return res.user
             }else {
                throw new Error(JSON.stringify({
                    validationError : res.error,
                    responseError : res.message
                }))
             }
        }
    })],
    adapter : PrismaAdapter(db),
    pages : {
        signIn : `/${Routes.AUTH}/${Pages.LOGIN}`
    }
}