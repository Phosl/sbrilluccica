import { NextRequest, NextResponse } from "next/server";

const EXPLICIT_ITALIAN = /^\/it(?=\/|$)/;
const ENGLISH = /^\/en(?=\/|$)/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (EXPLICIT_ITALIAN.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(EXPLICIT_ITALIAN, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  if (ENGLISH.test(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/it${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
