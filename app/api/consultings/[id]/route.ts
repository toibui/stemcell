import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET consultation theo ID (kèm Customer và Staff)
// GET consultation by ID (including Customer and Staff)

// ✅ GET consultation theo ID (bao gồm Customer và Staff)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params phải là Promise
) {
  const { id } = await params; // await để lấy id

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const consulting = await prisma.consulting.findUnique({
      where: { id },
      include: {
        customer: true,
        staff: true,
      },
    });

    if (!consulting) {
      return NextResponse.json({ error: 'Consulting not found' }, { status: 404 });
    }

    return NextResponse.json(consulting);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ✅ PUT cập nhật consultation theo ID
export async function PUT(
  req: NextRequest, // cũng phải là NextRequest
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params;

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const data = await req.json();

    const updatedConsulting = await prisma.consulting.update({
      where: { id },
      data: {
        customerId: data.customerId,
        staffid: data.staffid,
        Content: data.Content ?? null
      },
      include: {
        customer: true,
        staff: true
      }
    });

    return NextResponse.json(updatedConsulting);
  } catch (err: any) {
    console.error(err);

    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Consulting not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE consultation theo ID
export async function DELETE(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    await prisma.consulting.delete({ where: { id } });
    return NextResponse.json({ message: 'Consulting deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}