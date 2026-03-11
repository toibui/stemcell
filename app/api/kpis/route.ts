// app/api/kpis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const yearParam = url.searchParams.get("year");
    const filterYear = yearParam ? parseInt(yearParam) : null;

    // --- Lấy tất cả target theo tháng, có filter year nếu truyền ---
    const targets = await prisma.target.findMany({
      where: filterYear ? { year: filterYear } : {},
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    // --- Lấy doanh thu thực tế theo tháng từ hợp đồng, filter nếu cần ---
    const contracts = await prisma.contract.findMany({
      select: { dateContract: true, price: true },
      where: filterYear
        ? {
            dateContract: {
              gte: new Date(filterYear, 0, 1),
              lt: new Date(filterYear + 1, 0, 1),
            },
          }
        : {},
    });

    // Tính doanh thu theo {year, month}
    const actualRevenueMap = new Map<string, number>();
    contracts.forEach(c => {
      if (!c.price) return;
      const year = c.dateContract.getFullYear();
      const month = c.dateContract.getMonth() + 1;
      const key = `${year}-${month}`;
      const prev = actualRevenueMap.get(key) || 0;
      actualRevenueMap.set(key, prev + Number(c.price));
    });

    // --- Tạo array monthlyComparison ---
    const monthly = targets.map(t => {
      const key = `${t.year}-${t.month}`;
      const actualRevenue = actualRevenueMap.get(key) || 0;
      return {
        year: t.year,
        month: t.month,
        monthlyTarget: t.monthlyTarget,
        actualRevenue,
        difference: actualRevenue - t.monthlyTarget,
      };
    });

    // --- Tính yearly ---
    const yearlyMap = new Map<number, { yearlyTarget: number; actualRevenue: number }>();
    monthly.forEach(m => {
      const y = m.year;
      const prev = yearlyMap.get(y) || { yearlyTarget: 0, actualRevenue: 0 };
      yearlyMap.set(y, {
        yearlyTarget: prev.yearlyTarget + m.monthlyTarget,
        actualRevenue: prev.actualRevenue + m.actualRevenue,
      });
    });

    const yearly = Array.from(yearlyMap.entries()).map(([year, v]) => ({
      year,
      yearlyTarget: v.yearlyTarget,
      actualRevenue: v.actualRevenue,
      difference: v.actualRevenue - v.yearlyTarget,
    }));

    return NextResponse.json({ monthly, yearly });
  } catch (err: any) {
    console.error("GET /api/kpis error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}