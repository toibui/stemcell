import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // 🔒 Chặn staffs nếu không phải admin
    if (pathname.startsWith("/staffs")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
)

export const config = {
  matcher: [
    /*
      Match tất cả route ngoại trừ:
      - /
      - /auth/login
      - /api
      - /_next
      - favicon.ico
    */
    "/((?!^$|auth/login|api|_next|favicon.ico).*)",
  ],
}