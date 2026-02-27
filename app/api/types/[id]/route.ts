import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Type by ID
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
    const type = await prisma.type.findUnique({
      where: { id },
      include: {
        contracts: true, // include related contracts
      },
    });

    if (!type) {
      return NextResponse.json(
        { error: 'Type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(type);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update Type by ID
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

    const updatedType = await prisma.type.update({
      where: { id },
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(updatedType);
  } catch (err: any) {
    console.error(err);

    if (err.code === 'P2025') {
      // record not found
      return NextResponse.json(
        { error: 'Type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}