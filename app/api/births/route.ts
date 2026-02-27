import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all birth trackings (kèm Contract + Customer)
export async function GET() {
  try {
    const births = await prisma.birthTracking.findMany({
      include: {
        contract: {
          include: {
            customer: true, // Lấy thông tin khách hàng từ contract
          }
        },
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

// POST create new birth tracking dựa trên contract
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Kiểm tra contractId
    if (!data.contractId) {
      return NextResponse.json(
        { error: 'contractId is required' },
        { status: 400 }
      );
    }

    const newBirthTracking = await prisma.birthTracking.create({
      data: {
        contractId: data.contractId,

        edd: data.edd ? new Date(data.edd) : undefined,
        actualBirthAt: data.actualBirthAt
          ? new Date(data.actualBirthAt)
          : undefined,

        hospitalName: data.hospitalName,
        hospitalAddress: data.hospitalAddress,

        birthType: data.birthType,
        babiesCount: data.babiesCount ?? 1,

        status: data.status, // BirthStatus enum
        note: data.note
      },
      include: {
        contract: {
          include: { customer: true } // trả về luôn customer
        }
      }
    });

    return NextResponse.json(newBirthTracking, { status: 201 });
  } catch (err: any) {
    console.error(err);

    // Nếu contractId đã có BirthTracking (1-1)
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'This contract already has a BirthTracking' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create birth tracking', details: err.message ?? err },
      { status: 500 }
    );
  }
}