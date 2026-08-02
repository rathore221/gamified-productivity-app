import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/leaderboard(.*)",
  "/api/tasks(.*)",
  "/api/leaderboard(.*)",
  "/api/user(.*)",
  "/friends(.*)",
"/api/friends(.*)",
"/api/users(.*)",
"/api/challenges(.*)",
"/notifications(.*)",
"/history(.*)",
"/api/notifications(.*)",
"/api/tasks/history(.*)",
"/api/friends/(.*)/(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

