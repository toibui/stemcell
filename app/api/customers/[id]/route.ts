import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, context: any) {
  // context.params là Promise, phải unwrap
  const params = await context.params;
  const { id } = params;

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { births: true },
    });

    if (!customer)
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    return NextResponse.json(customer);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const data = await req.json(); // dữ liệu gửi từ frontend

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        status: data.status,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        edd: data.edd ? new Date(data.edd) : null,
        contractSigned: data.contractSigned ?? false,
        contractSignedAt: data.contractSignedAt ? new Date(data.contractSignedAt) : null,
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  const params = await context.params;
  const { id } = params;

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ message: 'Customer deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
