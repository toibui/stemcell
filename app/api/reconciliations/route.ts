import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET danh sách các khoản đối soát (hỗ trợ lọc theo tháng, năm, type)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const month = searchParams.get('month'); // ví dụ: 10
    const year = searchParams.get('year');   // ví dụ: 2026
    const type = searchParams.get('type');   // ví dụ: PROJECT_RESEARCH

    // Xây dựng điều kiện lọc (where) động
    let dateCondition = {};
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);
      dateCondition = {
        reconciliationDate: {
          gte: startDate,
          lt: endDate,
        },
      };
    } else if (year) {
      const startDate = new Date(Number(year), 0, 1);
      const endDate = new Date(Number(year) + 1, 0, 1);
      dateCondition = {
        reconciliationDate: {
          gte: startDate,
          lt: endDate,
        },
      };
    }

    const reconciliations = await prisma.reconciliation.findMany({
      where: {
        ...dateCondition,
        ...(type && { type: type as any }),
      },
      include: {
        staff: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        reconciliationDate: 'desc',
      },
    });

    return NextResponse.json(reconciliations);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch reconciliations', details: err.message },
      { status: 500 }
    );
  }
}

// POST tạo mới một khoản đối soát dòng tiền
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Kiểm tra các trường bắt buộc
    if (!data.title || data.amount === undefined) {
      return NextResponse.json(
        { error: 'title and amount are required' },
        { status: 400 }
      );
    }

    const newReconciliation = await prisma.reconciliation.create({
      data: {
        title: data.title,
        amount: data.amount, // Prisma Decimal chấp nhận number hoặc string
        type: data.type || 'PROJECT_RESEARCH',
        reconciliationDate: data.reconciliationDate 
          ? new Date(data.reconciliationDate) 
          : new Date(),
        staffId: data.staffId || null,
        note: data.note || null,
      },
      include: {
        staff: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(newReconciliation, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create reconciliation', details: err.message },
      { status: 500 }
    );
  }
}