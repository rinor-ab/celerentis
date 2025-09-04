// Middleware disabled for development
export default function middleware(req: any) {
  // No authentication required for development
}

export const config = {
  matcher: [],
};
