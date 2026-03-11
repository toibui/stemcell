import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Interface đảm bảo chuẩn Type của Next.js 15 (params là một Promise)
interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET Target by ID
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const target = await prisma.target.findUnique({
      where: { id },
    });

    if (!target) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    return NextResponse.json(target);
  } catch (error) {
    console.error("GET Target Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT update Target by ID
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updatedTarget = await prisma.target.update({
      where: { id },
      data: {
        year: data.year ? Number(data.year) : undefined,
        month: data.month ? Number(data.month) : undefined,
        monthlyTarget: data.monthlyTarget ? Number(data.monthlyTarget) : undefined,
      },
    });

    return NextResponse.json(updatedTarget);
  } catch (error: any) {
    console.error("PUT Target Error:", error);

    // Xử lý lỗi trùng lặp year/month (Unique constraint)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A target for this month and year already exists." },
        { status: 400 }
      );
    }

    // Lỗi không tìm thấy bản ghi
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

/**
 * DELETE Target by ID
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    await prisma.target.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Target deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Target Error:", error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Target already deleted or not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}