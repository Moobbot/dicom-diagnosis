import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách các đường dẫn công khai
const PUBLIC_PATHS = ['/auth/login', '/auth/access', '/auth/error'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // Lấy token từ cookie (hoặc bạn có thể kiểm tra header nếu cần)
    const token = request.cookies.get('refreshToken')?.value;

    // Nếu private path và không có token thì chuyển hướng về trang login
    if (!PUBLIC_PATHS.some((path) => pathname.startsWith(path)) && !token) {
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Nếu public path và có token thì chuyển hướng về trang chính
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path)) && token) {
        const mainUrl = new URL('/', request.url);
        return NextResponse.redirect(mainUrl);
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|static|layout|themes|demo|favicon.ico).*)']
};
