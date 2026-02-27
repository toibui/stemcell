import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET contract by ID (kèm Customer, BirthTracking và Type)
 */
export async function GET(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: true,
        birthTracking: true,
        type: true
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const data = await req.json();

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        customerId: data.customerId,
        typeId: data.typeId,
        no: data.no ?? null,
        dateContract: data.dateContract ? new Date(data.dateContract) : undefined
      },
      include: {
        customer: true,
        birthTracking: true,
        type: true
      }
    });

    return NextResponse.json(updatedContract);
  } catch (err: any) {
    console.error(err);

    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE contract by ID
 */
export async function DELETE(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    await prisma.contract.delete({ where: { id } });
    return NextResponse.json({ message: 'Contract deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}