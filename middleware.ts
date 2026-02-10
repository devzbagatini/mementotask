import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Protect API routes: require Authorization header
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
