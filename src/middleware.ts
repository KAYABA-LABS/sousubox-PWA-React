import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/signin",
  "/signup",
  "/verify",
  "/sso-callback",
  "/learn-more",
  "/privacy",
  "/terms",
  "/splash",
  "/onboarding",
  "/dev/bypass",
]);

export default clerkMiddleware(async (auth, request) => {
  // Skip auth in development mode for easier testing
  if (process.env.NODE_ENV === "development") {
    return;
  }

  const { userId } = await auth();

  // Redirect authenticated users away from public auth pages
  if (userId && isPublicRoute(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return Response.redirect(url);
  }

  // Protect all non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
