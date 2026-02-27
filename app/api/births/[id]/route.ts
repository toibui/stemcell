import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET birth tracking by id
 */
export async function GET(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const birthTracking = await prisma.birthTracking.findUnique({
      where: { id },
      include: {
        customer: true,
        samples: true,
        followUps: true
      }
    });

    if (!birthTracking)
      return NextResponse.json(
        { error: 'BirthTracking not found' },
        { status: 404 }
      );

    return NextResponse.json(birthTracking);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT update birth tracking
 */

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

    // ✅ combine date + time thành actualBirthAt
    let actualBirthAt: Date | null = null;

    if (data.actualBirthDate) {
      if (data.actualBirthTime) {
        actualBirthAt = new Date(
          `${data.actualBirthDate}T${data.actualBirthTime}`
        );
      } else {
        actualBirthAt = new Date(data.actualBirthDate);
      }
    }

    const updatedBirthTracking = await prisma.birthTracking.update({
      where: { id },
      data: {
        edd: data.edd ? new Date(data.edd) : null,
        actualBirthAt, // ✅ đúng field trong schema

        hospitalName: data.hospitalName ?? null,
        hospitalAddress: data.hospitalAddress ?? null,
        birthType: data.birthType ?? null,
        babiesCount: data.babiesCount
          ? Number(data.babiesCount)
          : 1,
        status: data.status,
        note: data.note ?? null,

        customer: {
          connect: { id: data.customerId },
        },
      },
    });

    return NextResponse.json(updatedBirthTracking);
  } catch (err: any) {
    console.error(err);

    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: 'BirthTracking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE birth tracking
 */
export async function DELETE(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    await prisma.birthTracking.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'BirthTracking deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
