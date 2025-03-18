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

    // Set cookie using Response
    return new Response(JSON.stringify({ message: 'Refresh token stored successfully' }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`
        }
    });
}

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    return new Response(JSON.stringify({ refreshToken }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function DELETE(request: Request) {
    // Delete cookie by setting Max-Age to 0
    return new Response(
        JSON.stringify({ message: 'Access token and refresh token deleted' }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': `refreshToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`
            }
        });
}