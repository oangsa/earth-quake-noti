import { NextResponse } from 'next/server';
import client from '@/libs/prismadb';

type CResponse = {
    message: string;
    success?: boolean;
}

export async function POST(): Promise<NextResponse<CResponse>> {
    // Delete all events
    await client.event.deleteMany();

    return NextResponse.json({ message: "OK" }, { status: 200 })
}
