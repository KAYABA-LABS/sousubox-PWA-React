import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
  // Skip auth if dev bypass enabled
  if (process.env.DEV_BYPASS === "true") {
    if (
      request.nextUrl.pathname === "/signin" ||
      request.nextUrl.pathname === "/signup"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return;
  }

  const { userId } = await auth();

  // A session can exist mid-signup (created as soon as the phone is
  // verified, before signUp.finalize()). Don't evict the user from
  // /signup for that — the wizard navigates to /dashboard itself once
  // signUp.finalize() actually completes.
  const isSignUpRoute = request.nextUrl.pathname === "/signup";

  // Redirect authenticated users away from public auth pages
  if (userId && isPublicRoute(request) && !isSignUpRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protect all non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|api/backend|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
