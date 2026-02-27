import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all contracts (kèm Customer và BirthTracking nếu có)
export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        customer: true,
        birthTracking: true, // 1-1 relation với BirthTracking
        type: true            // thông tin loại contract
      },
      orderBy: {
        dateContract: 'desc'  // sắp xếp theo ngày contract
      }
    });

    return NextResponse.json(contracts);
  } catch (err) {
    console.error('Error fetching contracts:', err);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

// POST create new contract
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 1️⃣ Kiểm tra customerId và typeId
    const customerExists = await prisma.customer.findUnique({ where: { id: data.customerId } });
    const typeExists = await prisma.type.findUnique({ where: { id: data.typeId } });

    if (!customerExists || !typeExists) {
      return NextResponse.json(
        { error: 'customerId hoặc typeId không hợp lệ' },
        { status: 400 }
      );
    }

    // 2️⃣ Validate dateContract
    let contractDate;
    if (data.dateContract) {
      contractDate = new Date(data.dateContract);
      if (isNaN(contractDate.getTime())) {
        return NextResponse.json(
          { error: 'dateContract không hợp lệ' },
          { status: 400 }
        );
      }
    }

    // 3️⃣ Tạo Contract và BirthTracking cùng lúc
    const newContract = await prisma.contract.create({
      data: {
        customerId: data.customerId,
        typeId: data.typeId,
        no: data.no || null,
        dateContract: contractDate,
        birthTracking: {
          create: {
            status: 'planned', // giá trị mặc định cho BirthStatus
            babiesCount: data.babiesCount || 1,
            hospitalName: data.hospitalName || null,
            hospitalAddress: data.hospitalAddress || null,
            edd: data.edd ? new Date(data.edd) : null
          }
        }
      },
      include: {
        customer: true,
        type: true,
        birthTracking: true
      }
    });

    return NextResponse.json(newContract, { status: 201 });
  } catch (err) {
    console.error('Error creating contract:', err);
    return NextResponse.json(
      { error: 'Tạo contract thất bại', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}