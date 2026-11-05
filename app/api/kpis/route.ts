// app/api/kpis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const yearParam = url.searchParams.get("year");
    const filterYear = yearParam ? parseInt(yearParam) : null;

    const fromDate = filterYear ? new Date(filterYear, 0, 1) : undefined;
    const toDate = filterYear ? new Date(filterYear + 1, 0, 1) : undefined;

    // --- Targets ---
    const targets = await prisma.target.findMany({
      where: filterYear ? { year: filterYear } : {},
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    // --- Contract (initial revenue) ---
    const contracts = await prisma.contract.findMany({
      select: {
        dateContract: true,
        price: true,
        outside: { select: { price: true } }
      },
      where: filterYear
        ? {
            dateContract: {
              gte: fromDate,
              lt: toDate,
            },
          }
        : {},
    });

    // --- Renew (renewal revenue) ---
    const renews = await prisma.renewContract.findMany({
      select: { startDate: true, price: true },
      where: filterYear
        ? {
            startDate: {
              gte: fromDate,
              lt: toDate,
            },
          }
        : {},
    });

    // --- Reconciliation (project research revenue) ---
    const reconciliations = await prisma.reconciliation.findMany({
      select: { reconciliationDate: true, amount: true },
      where: filterYear
        ? {
            reconciliationDate: {
              gte: fromDate,
              lt: toDate,
            },
          }
        : {},
    });

    // 🧠 Gộp revenue từ Contract, Renew và Reconciliation
    const actualRevenueMap = new Map<string, number>();

    // 1. Contract
    contracts.forEach(c => {
      const year = c.dateContract.getFullYear();
      const month = c.dateContract.getMonth() + 1;
      const key = `${year}-${month}`;
      const prev = actualRevenueMap.get(key) || 0;
      actualRevenueMap.set(
        key,
        prev + Number(c.price || 0) + Number(c.outside?.price || 0)
      );
    });

    // 2. Renew
    renews.forEach(r => {
      if (!r.price) return;
      const year = r.startDate.getFullYear();
      const month = r.startDate.getMonth() + 1;
      const key = `${year}-${month}`;
      const prev = actualRevenueMap.get(key) || 0;
      actualRevenueMap.set(key, prev + Number(r.price));
    });

    // 3. Reconciliation (Đối soát dự án)
    reconciliations.forEach(rec => {
      if (!rec.amount) return;
      const year = rec.reconciliationDate.getFullYear();
      const month = rec.reconciliationDate.getMonth() + 1;
      const key = `${year}-${month}`;
      const prev = actualRevenueMap.get(key) || 0;
      actualRevenueMap.set(key, prev + Number(rec.amount));
    });

    // --- Monthly ---
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

    // --- Yearly ---
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

  } catch (err: unknown) {
    console.error("GET /api/kpis error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}