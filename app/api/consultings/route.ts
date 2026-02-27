import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all consultations (kèm thông tin Customer và Staff)
export async function GET() {
  try {
    const consultations = await prisma.consulting.findMany({
      include: { 
        customer: true,
        staff: true
      },
      orderBy: {
        createdAt: 'desc' // Sắp xếp mới nhất lên đầu
      }
    });
    return NextResponse.json(consultations);
  } catch (err) {
    console.error('Error fetching consultations:', err);
    return NextResponse.json({ error: 'Failed to fetch consultations' }, { status: 500 });
  }
}

// POST create new consultation
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newConsulting = await prisma.consulting.create({
      data: {
        customerId: data.customerId,
        staffid: data.staffid,
        Content: data.Content || null
      },
      include: {
        customer: true,
        staff: true
      }
    });

    return NextResponse.json(newConsulting, { status: 201 });
  } catch (err) {
    console.error('Error creating consultation:', err);

    return NextResponse.json(
      { error: 'Failed to create consultation', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}