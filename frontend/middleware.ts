import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách các đường dẫn công khai
const PUBLIC_PATHS = ['/auth/login', '/auth/access', '/auth/error'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Kiểm tra nếu đường dẫn là public
    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next();
    }

    // Lấy token từ cookie (hoặc bạn có thể kiểm tra header nếu cần)
    const token = request.cookies.get('refreshToken')?.value;

    // Nếu không có token, chuyển hướng đến /auth/login
    if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Cho phép truy cập nếu token tồn tại
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/((?!api|public|_next/static|_next/image|static|layout|themes|favicon.ico).*)']
};
