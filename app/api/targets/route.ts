import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all targets
export async function GET() {
  try {
    const targets = await prisma.target.findMany({
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    });
    return NextResponse.json(targets);
  } catch (err) {
    console.error('Error fetching targets:', err);
    return NextResponse.json(
      { error: 'Failed to fetch targets' },
      { status: 500 }
    );
  }
}

// POST create new target
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { year, month, monthlyTarget } = data;

    if (!year || !month || monthlyTarget === undefined) {
      return NextResponse.json(
        { error: 'year, month và monthlyTarget là bắt buộc' },
        { status: 400 }
      );
    }

    const newTarget = await prisma.target.create({
      data: { year, month, monthlyTarget }
    });

    return NextResponse.json(newTarget, { status: 201 });
  } catch (err: any) {
    console.error('Error creating target:', err);

    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Target cho tháng/năm này đã tồn tại' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create target', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}