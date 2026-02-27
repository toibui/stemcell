import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all birth trackings (kèm Customer)
export async function GET() {
  try {
    const births = await prisma.birthTracking.findMany({
      include: {
        customer: true,
        samples: true,
        followUps: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(births);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch birth trackings' },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newBirthTracking = await prisma.birthTracking.create({
      data: {
        customerId: data.customerId,

        edd: data.edd ? new Date(data.edd) : undefined,
        actualBirthAt : data.actualBirthAt 
          ? new Date(data.actualBirthAt )
          : undefined,

        hospitalName: data.hospitalName,
        hospitalAddress: data.hospitalAddress,

        birthType: data.birthType,
        babiesCount: data.babiesCount ?? 1,

        status: data.status, // BirthStatus enum
        note: data.note
      }
    });

    return NextResponse.json(newBirthTracking, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create birth tracking' },
      { status: 500 }
    );
  }
}
