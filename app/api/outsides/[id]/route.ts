import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const outside = await prisma.outside.findUnique({ where: { id } });

    if (!outside) {
      return NextResponse.json(
        { error: 'Không tìm thấy chi phí ngoại viện' },
        { status: 404 }
      );
    }

    return NextResponse.json(outside);
  } catch (error) {
    console.error('Error fetching outside:', error);
    return NextResponse.json(
      { error: 'Không thể tải chi phí ngoại viện' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    const data = await req.json();
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const price = Number(data.price);

    if (
      !name ||
      data.price === '' ||
      data.price === null ||
      data.price === undefined ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        { error: 'Tên và chi phí hợp lệ là bắt buộc' },
        { status: 400 }
      );
    }

    const outside = await prisma.outside.update({
      where: { id },
      data: {
        name,
        price,
        description:
          typeof data.description === 'string' && data.description.trim()
            ? data.description.trim()
            : null
      }
    });

    return NextResponse.json(outside);
  } catch (error) {
    console.error('Error updating outside:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật chi phí ngoại viện' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const contractCount = await prisma.contract.count({
      where: { outsideId: id }
    });

    if (contractCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xoá mức phí đang được sử dụng trong hợp đồng' },
        { status: 409 }
      );
    }

    await prisma.outside.delete({ where: { id } });
    return NextResponse.json({ message: 'Đã xoá chi phí ngoại viện' });
  } catch (error) {
    console.error('Error deleting outside:', error);
    return NextResponse.json(
      { error: 'Không thể xoá chi phí ngoại viện' },
      { status: 500 }
    );
  }
}
