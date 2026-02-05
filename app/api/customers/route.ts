import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // đường dẫn tới Prisma client

// GET all customers (kèm BirthTracking)
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: { births: true } // Customer có relation births
    });
    return NextResponse.json(customers);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST create new customer
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Chỉ lấy các field hợp lệ của Customer
    const newCustomer = await prisma.customer.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        edd: data.edd ? new Date(data.edd) : undefined,
        contractSigned: data.contractSigned ?? false,
        contractSignedAt: data.contractSignedAt ? new Date(data.contractSignedAt) : undefined,
        status: data.status
      }
    });
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
