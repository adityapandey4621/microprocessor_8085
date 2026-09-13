import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/settings/:path*",
    "/profile/:path*",
    "/simulator/:path*",
    "/challenges/:path*",
    "/classroom/:path*",
    "/friends/:path*",
    "/gallery/:path*"
  ],
}

