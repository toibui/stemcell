import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all customers (kèm BirthTracking và ChannelMarketing)
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: { 
        channelMarketing: true,
        consulting: true,
        contract: {
          include: {
            birthTracking: true // 👈 THÊM DÒNG NÀY
          }
        // Bạn có thể include thêm consulting hoặc contract nếu cần ở frontend
        },
      },
      orderBy: {
        createdAt: 'desc' // Sắp xếp mới nhất lên đầu
      }
    });
    return NextResponse.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST create new customer
// POST create new customer
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newCustomer = await prisma.customer.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        pid: data.pid || null,
        email: data.email || null,
        address: data.address || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        edd: data.edd ? new Date(data.edd) : null,
        
        // --- Thêm 3 trường mới tại đây ---
        idno: data.idno || null,
        iddate: data.iddate ? new Date(data.iddate) : null,
        idplace: data.idplace || null,
        // ---------------------------------

        channelMarketingId: data.channelMarketingId || null,
      },
      include: {
        channelMarketing: true
      }
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (err) {
    console.error('Error creating customer:', err);
    return NextResponse.json(
      { error: 'Failed to create customer', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}