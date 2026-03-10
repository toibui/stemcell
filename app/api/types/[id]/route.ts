import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET Type by ID
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // params là Promise trong Next.js 13+
) {
  const params = await context.params; // unwrap Promise
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const type = await prisma.type.findUnique({
      where: { id }, // UUID string
      include: { contracts: true }, // lấy luôn các contract liên quan
    });

    if (!type) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 });
    }

    return NextResponse.json(type, { status: 200 });
  } catch (err) {
    console.error('GET type error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update Type by ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'ID is required' },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();

    // Kiểm tra dữ liệu đầu vào
    if (data.name === undefined && data.price === undefined) {
      return NextResponse.json(
        { error: 'At least one of name or price must be provided' },
        { status: 400 }
      );
    }

    // Chuẩn bị data để update
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) {
      // Nếu schema dùng Decimal
      updateData.price = new Prisma.Decimal(data.price);
      // Nếu dùng Float trong schema, có thể dùng: updateData.price = Number(data.price);
    }

    const updatedType = await prisma.type.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedType);
  } catch (err: any) {
    console.error(err);

    if (err.code === 'P2025') {
      // record not found
      return NextResponse.json(
        { error: 'Type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}