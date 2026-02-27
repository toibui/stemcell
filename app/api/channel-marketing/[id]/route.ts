import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'ID is required' },
      { status: 400 }
    );
  }

  try {
    const channel = await prisma.channelMarketing.findUnique({
      where: { id },
      include: {
        customers: true
      }
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel marketing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(channel);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'ID is required' },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();

    const updatedChannel = await prisma.channelMarketing.update({
      where: { id },
      data: {
        name: data.name
      }
    });

    return NextResponse.json(updatedChannel);
  } catch (err: any) {
    console.error(err);

    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: 'Channel marketing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}