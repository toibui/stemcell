import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET chi tiết khoản đối soát theo ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const reconciliation = await prisma.reconciliation.findUnique({
      where: { id },
      include: {
        staff: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!reconciliation) {
      return NextResponse.json(
        { error: 'Reconciliation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reconciliation);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * PUT cập nhật thông tin khoản đối soát theo ID
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const data = await req.json();

    const updatedReconciliation = await prisma.reconciliation.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        amount: data.amount !== undefined ? data.amount : undefined,
        type: data.type !== undefined ? data.type : undefined,
        reconciliationDate: data.reconciliationDate 
          ? new Date(data.reconciliationDate) 
          : undefined,
        staffId: data.staffId !== undefined ? data.staffId : undefined,
        note: data.note !== undefined ? data.note : undefined,
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

    return NextResponse.json(updatedReconciliation);
  } catch (err: any) {
    console.error(err);

    // Xử lý lỗi không tìm thấy bản ghi trong Prisma
    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reconciliation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE xóa khoản đối soát theo ID
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await prisma.reconciliation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Reconciliation deleted successfully' });
  } catch (err: any) {
    console.error(err);

    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reconciliation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}