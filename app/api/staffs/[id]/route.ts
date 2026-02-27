import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 🔹 Mảng roles riêng cho TypeScript
const StaffRoles = [
  'admin',
  'administration',
  'collection',
  'processing',
  'quality_control',
  'storage'
] as const;

// 🔹 Kiểu dữ liệu cho role
type StaffRoleType = (typeof StaffRoles)[number];

// GET single staff by ID
export async function GET(req: Request, context: any) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
      // include relations nếu cần, ví dụ: include: { tasks: true }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update staff by ID
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // Authorization: chỉ admin hoặc chính user mới được update
  if (session.user.role !== "admin" && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Role validation
    if (body.role) {
      if (session.user.role !== "admin") {
        return NextResponse.json({ error: "You cannot change role" }, { status: 403 });
      }

      if (!StaffRoles.includes(body.role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
    }

    // Build update object
    const updateData: Partial<{
      fullName: string;
      phone: string | null;
      email: string ;
      role: StaffRoleType;
      isActive: boolean;
    }> = {};

    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.phone !== undefined) updateData.phone = body.phone ?? null;
    if (body.email !== undefined)updateData.email = body.email; // không gán null
    if (body.role !== undefined && session.user.role === "admin") updateData.role = body.role;
    if (body.isActive !== undefined && session.user.role === "admin") updateData.isActive = body.isActive;

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedStaff);
  } catch (err: any) {
    console.error(err);

    if (err.code === "P2025") {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE staff by ID
export async function DELETE(req: Request, context: any) {
  const { id } = context.params;

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    await prisma.staff.delete({ where: { id } });
    return NextResponse.json({ message: 'Staff deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}