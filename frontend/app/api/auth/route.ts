import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const body = await request.json();
    const { refreshToken } = body;
    if (!refreshToken) {
        return Response.json(
            { message: 'Refresh token not received' },
            {
                status: 400
            }
        );
    }

    return Response.json(body, {
        status: 200,
        headers: {
            'Set-Cookie': `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Strict;`
        }
    });
}

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    return Response.json(
        { refreshToken },
        {
            status: 200
        }
    );
}

export async function DELETE(request: Request) {
    return Response.json(
        { message: 'Access token and refresh token deleted' },
        {
            status: 200,
            headers: {
                'Set-Cookie': 'refreshToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
            }
        }
    );
}
