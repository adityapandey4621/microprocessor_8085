import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/simulator/:path*",
    "/challenges/:path*",
    "/classroom/:path*",
    "/gallery/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/api/user/:path*",
    "/api/code/:path*",
    "/api/ai/generate/:path*",
    "/api/challenge/:path*",
    "/api/collaboration/:path*",
  ],
}
