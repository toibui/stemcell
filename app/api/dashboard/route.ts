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

    // Chuẩn hóa thời gian
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
      revenueResult
    ] = await Promise.all([

      // 1️⃣ Tổng khách hàng tạo mới
      prisma.customer.count({
        where: {
          createdAt: {
            gte: fromDate,
            lte: toDate
          }
        }
      }),

      // 2️⃣ Tổng số cuộc tư vấn
      prisma.consulting.count({
        where: {
          createdAt: {
            gte: fromDate,
            lte: toDate
          }
        }
      }),

      // 3️⃣ Số khách hàng được tư vấn (unique customerId)
      (async () => {
        const grouped = await prisma.consulting.groupBy({
          by: ["customerId"],
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate
            }
          }
        })

        return grouped.length
      })(),

      // 4️⃣ Tổng hợp đồng được ký
      prisma.contract.count({
        where: {
          dateContract: {
            gte: fromDate,
            lte: toDate
          }
        }
      }),

      // 5️⃣ Tổng mẫu được lấy
      prisma.birthTracking.count({
        where: {
          actualBirthAt: {
            not: null,
            gte: fromDate,
            lte: toDate
          }
        }
      }),

      // 6️⃣ Tổng doanh thu
      prisma.contract.aggregate({
        _sum: {
          price: true
        },
        where: {
          dateContract: {
            gte: fromDate,
            lte: toDate
          }
        }
      })
    ])

    const revenue = revenueResult._sum.price || 0

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
        revenue,

        // KPI
        consultRate: Number(consultRate.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
        sampleRate: Number(sampleRate.toFixed(2))
      }
    })
  } catch (error: any) {
    console.error("Dashboard API Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error"
      },
      { status: 500 }
    )
  }
}