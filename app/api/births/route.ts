import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET: tất cả ca sinh

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        births: true, // relation "births" tồn tại, TypeScript sẽ chấp nhận
      },
    });
    return NextResponse.json(customers);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
// POST: tạo ca sinh mới
export async function POST(req: Request) {
  const data = await req.json();

  if (!data.customerId || !data.status) {
    return NextResponse.json({ error: "customerId và status bắt buộc" }, { status: 400 });
  }

  const birth = await prisma.birthTracking.create({
    data: {
      customerId: data.customerId,
      edd: data.edd ? new Date(data.edd) : undefined,
      actualBirthDate: data.actualBirthDate ? new Date(data.actualBirthDate) : undefined,
      actualBirthTime: data.actualBirthTime ? data.actualBirthTime : undefined,
      hospitalName: data.hospitalName,
      hospitalAddress: data.hospitalAddress,
      birthType: data.birthType,
      babiesCount: data.babiesCount ?? 1,
      status: data.status,
      note: data.note,
    },
  });

  return NextResponse.json(birth);
}

// PATCH: update ca sinh
export async function PATCH(req: Request) {
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: "id bắt buộc" }, { status: 400 });

  const birth = await prisma.birthTracking.update({
    where: { id },
    data: {
      edd: data.edd ? new Date(data.edd) : undefined,
      actualBirthDate: data.actualBirthDate ? new Date(data.actualBirthDate) : undefined,
      actualBirthTime: data.actualBirthTime,
      hospitalName: data.hospitalName,
      hospitalAddress: data.hospitalAddress,
      birthType: data.birthType,
      babiesCount: data.babiesCount,
      status: data.status,
      note: data.note,
    },
  });

  return NextResponse.json(birth);
}

// DELETE: xóa ca sinh
export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id bắt buộc" }, { status: 400 });

  await prisma.birthTracking.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
