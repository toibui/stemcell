// /app/api/customers/need-consulting/route.ts

import { prisma } from "@/lib/prisma";
import { startOfWeek, subDays } from "date-fns";

export async function GET() {
  const today = new Date();
  const oneWeekAgo = subDays(today, 7);

  const startWeek = startOfWeek(today, { weekStartsOn: 1 }); // tuần bắt đầu từ thứ 2

  const customers = await prisma.customer.findMany({
    where: {
      edd: {
        gte: oneWeekAgo, // chưa quá 1 tuần sau dự sinh
      },
      NOT: {
        consulting: {
          some: {
            createdAt: {
              gte: startWeek, // đã tư vấn trong tuần này
            },
          },
        },
      },
    },
    include: {
      consulting: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1, // lấy tư vấn gần nhất
      },
    },
  });

  const result = customers.map(c => ({
    id: c.id,
    fullName: c.fullName,
    phone: c.phone,
    edd: c.edd,
    lastConsultingDate: c.consulting[0]?.createdAt ?? null,
    lastConsultingContent: c.consulting[0]?.Content ?? null,
  }));

  return Response.json(result);
}