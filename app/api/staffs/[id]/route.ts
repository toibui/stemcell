import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single staff by ID
export async function GET(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id) 
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
      // Nếu Staff có relation, thêm vào include ở đây
      // include: { tasks: true }
    });

    if (!staff)
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

    return NextResponse.json(staff);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update staff by ID
export async function PUT(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id) 
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const data = await req.json();

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone ?? null,
        email: data.email ?? null,
        role: data.role,                    // phải hợp lệ theo enum StaffRole
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(updatedStaff);
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') { // record not found
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE staff by ID
export async function DELETE(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id) 
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    await prisma.staff.delete({ where: { id } });
    return NextResponse.json({ message: 'Staff deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
