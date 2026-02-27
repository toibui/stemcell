import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all customers (kèm BirthTracking và ChannelMarketing)
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: { 
        births: true,
        channelMarketing: true,
        // Bạn có thể include thêm consulting hoặc contract nếu cần ở frontend
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
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newCustomer = await prisma.customer.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        edd: data.edd ? new Date(data.edd) : null,
        
        // Gắn ChannelMarketing theo ID nếu có
        // Lưu ý: Model của bạn dùng channelMarketingId làm field trung gian
        channelMarketingId: data.channelMarketingId || null,
      },
      include: {
        channelMarketing: true
      }
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (err) {
    console.error('Error creating customer:', err);
    
    // Trình bày lỗi chi tiết hơn để dễ debug
    return NextResponse.json(
      { error: 'Failed to create customer', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}