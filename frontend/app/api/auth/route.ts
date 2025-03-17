import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const body = await request.json();
    const { refreshToken } = body;
    if (!refreshToken) {
        return new Response(
            JSON.stringify({ message: 'Refresh token not received' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    }

    return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Strict;`
        }
    });

}

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    return new Response(JSON.stringify({ refreshToken }), {
        status: 200
    });
}

export async function DELETE(request: Request) {
    return new Response(
        JSON.stringify({ message: 'Access token and refresh token deleted' }),
        {
            status: 200,
            headers: {
                'Set-Cookie': 'refreshToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
            }
        });
}
