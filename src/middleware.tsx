import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { Pages, Routes } from "./constants/enums";

export default withAuth(
    async function middleware(request: NextRequest) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-url", request.url);
    
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });

        const pathname = request.nextUrl.pathname;
        
        const isAuth = await getToken({ req: request });
        const isAuthPage = pathname.startsWith(`/${Routes.AUTH}`);
        const protectedRoutes = [Routes.PROFILE, Routes.NOTIFICATIONS];
        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(`/${route}`)
        );

      // if user not loggedin and try to acess protected route
    if (!isAuth && isProtectedRoute) {
        return NextResponse.redirect(
          new URL(`/${Routes.AUTH}/${Pages.LOGIN}`, request.url)
        );
      }
      // if user loggedin and try to acess auth routes
      if (isAuthPage && isAuth) {
        return NextResponse.redirect(
          new URL(`/${Routes.PROFILE}`, request.url)
        );
      }
      return response;
    },
    {
        callbacks: {
          authorized() {
            return true;
          },
        },
      }
)