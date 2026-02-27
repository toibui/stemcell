import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all types
export async function GET() {
  try {
    const types = await prisma.type.findMany({
      include: {
        contracts: true, // include related contracts
      },
    });

    return NextResponse.json(types);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch types' },
      { status: 500 }
    );
  }
}

// POST create new type
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newType = await prisma.type.create({
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(newType, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create type' },
      { status: 500 }
    );
  }
}