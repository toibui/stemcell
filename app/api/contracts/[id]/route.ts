import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET contract by ID (kèm Customer, BirthTracking, Type + Renew)
 */
export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: true,
        birthTracking: true,
        type: true,
        outside: true,

        // 👇 thêm renew
        renews: {
          orderBy: { renewNo: 'asc' }
        }
      }
    });

    if (!contract)
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

    return NextResponse.json(contract);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT update contract by ID
 */
export async function PUT(
  req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  if (!id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const data = await req.json();

    let outsideUpdate: { isOutside: boolean; outsideId: string | null } | undefined;
    if ('isOutside' in data || 'outsideId' in data) {
      if (data.isOutside !== true) {
        outsideUpdate = { isOutside: false, outsideId: null };
      } else {
        if (typeof data.outsideId !== 'string' || !data.outsideId) {
          return NextResponse.json(
            { error: 'Vui lòng chọn mức chi phí ngoại viện' },
            { status: 400 }
          );
        }

        const outsideExists = await prisma.outside.findUnique({
          where: { id: data.outsideId },
          select: { id: true }
        });

        if (!outsideExists) {
          return NextResponse.json(
            { error: 'Mức chi phí ngoại viện không hợp lệ' },
            { status: 400 }
          );
        }

        outsideUpdate = { isOutside: true, outsideId: data.outsideId };
      }
    }

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        customerId: data.customerId,
        typeId: data.typeId,
        no: data.no ?? null,
        dateContract: data.dateContract
          ? new Date(data.dateContract)
          : undefined,

        promote: data.promote ?? null,
        price: data.price ?? null,
        ...(outsideUpdate ?? {})

        // ❗ KHÔNG update renew ở đây
      },
      include: {
        customer: true,
        birthTracking: true,
        type: true,
        outside: true,
        renews: {
          orderBy: { renewNo: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedContract);
  } catch (err: unknown) {
    console.error(err);

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE contract by ID
 */
export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    // 🔥 check có renew chưa
    const renewCount = await prisma.renewContract.count({
      where: { contractId: id }
    });

    if (renewCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xoá contract đã có gia hạn' },
        { status: 400 }
      );
    }

    await prisma.contract.delete({ where: { id } });

    return NextResponse.json({ message: 'Contract deleted' });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}