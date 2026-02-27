import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all channel marketing
export async function GET() {
  try {
    const channels = await prisma.channelMarketing.findMany({
      include: {
        customers: true
      }
    });

    return NextResponse.json(channels);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch channel marketing' },
      { status: 500 }
    );
  }
}
//Post

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newChannel = await prisma.channelMarketing.create({
      data: {
        name: data.name
      }
    });

    return NextResponse.json(newChannel, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create channel marketing' },
      { status: 500 }
    );
  }
}