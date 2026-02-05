import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // đường dẫn tới Prisma client

// GET all staff
export async function GET() {
  try {
    const staffList = await prisma.staff.findMany({
      // Nếu muốn include các relation, thêm vào include ở đây
      // include: { someRelation: true }
    });
    return NextResponse.json(staffList);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST create new staff
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Chỉ lấy các field hợp lệ của Staff
    const newStaff = await prisma.staff.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        role: data.role,               // bắt buộc phải có giá trị hợp lệ theo enum StaffRole
        isActive: data.isActive ?? true, // default true nếu không có
      }
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}
