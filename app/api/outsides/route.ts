import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const outsides = await prisma.outside.findMany({
      orderBy: { price: 'asc' }
    });

    return NextResponse.json(outsides);
  } catch (error) {
    console.error('Error fetching outsides:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách chi phí ngoại viện' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const outside = await prisma.outside.create({
      data: {
        name,
        price,
        description:
          typeof data.description === 'string' && data.description.trim()
            ? data.description.trim()
            : null
      }
    });

    return NextResponse.json(outside, { status: 201 });
  } catch (error) {
    console.error('Error creating outside:', error);
    return NextResponse.json(
      { error: 'Không thể tạo chi phí ngoại viện' },
      { status: 500 }
    );
  }
}
