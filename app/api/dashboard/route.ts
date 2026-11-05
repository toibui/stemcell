import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing from/to query params" },
        { status: 400 }
      )
    }

    const fromDate = new Date(from)
    fromDate.setHours(0, 0, 0, 0)

    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)

    const [
      totalCustomers,
      totalConsultings,
      totalUniqueConsultedCustomers,
      totalContracts,
      totalSamples,
      contractsForRevenue,
      renewRevenue,
      renewCount,
      // 👇 Thêm truy vấn tổng tiền đối soát dự án theo khoảng thời gian
      reconciliationRevenue,
      reconciliationCount
    ] = await Promise.all([

      // 1️⃣ Khách hàng
      prisma.customer.count({
        where: {
          createdAt: { gte: fromDate, lte: toDate }
        }
      }),

      // 2️⃣ Tư vấn
      prisma.consulting.count({
        where: {
          createdAt: { gte: fromDate, lte: toDate }
        }
      }),

      // 3️⃣ Unique consulted
      (async () => {
        const grouped = await prisma.consulting.groupBy({
          by: ["customerId"],
          where: {
            createdAt: { gte: fromDate, lte: toDate }
          }
        })
        return grouped.length
      })(),

      // 4️⃣ Contract mới
      prisma.contract.count({
        where: {
          dateContract: { gte: fromDate, lte: toDate }
        }
      }),

      // 5️⃣ Sample
      prisma.birthTracking.count({
        where: {
          actualBirthAt: {
            not: null,
            gte: fromDate,
            lte: toDate
          }
        }
      }),

      // 💰 6️⃣ Doanh thu contract
      prisma.contract.findMany({
        select: {
          price: true,
          outside: { select: { price: true } }
        },
        where: {
          dateContract: { gte: fromDate, lte: toDate }
        }
      }),

      // 💰 7️⃣ Doanh thu renew
      prisma.renewContract.aggregate({
        _sum: { price: true },
        where: {
          startDate: { gte: fromDate, lte: toDate }
        }
      }),

      // 🔢 8️⃣ Số lần renew
      prisma.renewContract.count({
        where: {
          startDate: { gte: fromDate, lte: toDate }
        }
      }),

      // 💰 9️⃣ Doanh thu đối soát dự án (Reconciliation)
      prisma.reconciliation.aggregate({
        _sum: { amount: true },
        where: {
          reconciliationDate: { gte: fromDate, lte: toDate }
        }
      }),

      // 🔢 🔟 Số lượng khoản đối soát
      prisma.reconciliation.count({
        where: {
          reconciliationDate: { gte: fromDate, lte: toDate }
        }
      })
    ])

    const toNumber = (val: unknown) => Number(val || 0);

    const contractBaseRevenue = contractsForRevenue.reduce(
      (total, contract) => total + toNumber(contract.price),
      0
    );
    const outsideRevenue = contractsForRevenue.reduce(
      (total, contract) => total + toNumber(contract.outside?.price),
      0
    );
    const contractRevenue = contractBaseRevenue + outsideRevenue;

    // 💰 Tổng doanh thu gộp (Hợp đồng + Renew + Đối soát dự án)
    const revenue =
      contractRevenue +
      toNumber(renewRevenue._sum.price) +
      toNumber(reconciliationRevenue._sum.amount);

    const totalDeals = totalContracts + renewCount

    // 📊 KPI
    const consultRate =
      totalCustomers > 0
        ? (totalUniqueConsultedCustomers / totalCustomers) * 100
        : 0

    const conversionRate =
      totalUniqueConsultedCustomers > 0
        ? totalContracts / totalUniqueConsultedCustomers
        : 0

    const sampleRate =
      totalContracts > 0
        ? (totalSamples / totalContracts) * 100
        : 0

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalConsultings,
        totalUniqueConsultedCustomers,
        totalContracts,
        totalSamples,

        renewCount,
        totalDeals,

        // 👇 Trả về chi tiết các nguồn doanh thu để tiện hiển thị trên giao diện nếu cần
        contractRevenue,
        outsideRevenue,
        renewRevenue: toNumber(renewRevenue._sum.price),
        reconciliationRevenue: toNumber(reconciliationRevenue._sum.amount),
        reconciliationCount,

        revenue, // Tổng doanh thu tổng hợp

        consultRate: Number(consultRate.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
        sampleRate: Number(sampleRate.toFixed(2))
      }
    })
  } catch (error: unknown) {
    console.error("Dashboard API Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error"
      },
      { status: 500 }
    )
  }
}