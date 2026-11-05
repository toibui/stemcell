import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function parseDate(value: string | null, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  if (endOfDay) date.setHours(23, 59, 59, 999)
  return date
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = parseDate(searchParams.get("from"))
  const to = parseDate(searchParams.get("to"), true)

  if (!from || !to || from > to) {
    return NextResponse.json(
      { error: "Khoảng ngày không hợp lệ" },
      { status: 400 }
    )
  }

  try {
    const [contracts, renewals, reconciliations] = await Promise.all([
      prisma.contract.findMany({
        where: { dateContract: { gte: from, lte: to } },
        select: {
          no: true,
          dateContract: true,
          price: true,
          outside: { select: { price: true } },
          customer: { select: { fullName: true, phone: true } },
          type: { select: { name: true } }
        },
        orderBy: { dateContract: "asc" }
      }),
      prisma.renewContract.findMany({
        where: { startDate: { gte: from, lte: to } },
        select: {
          renewNo: true,
          startDate: true,
          price: true,
          contract: {
            select: {
              no: true,
              customer: { select: { fullName: true, phone: true } }
            }
          },
          type: { select: { name: true } }
        },
        orderBy: { startDate: "asc" }
      }),
      prisma.reconciliation.findMany({
        where: { reconciliationDate: { gte: from, lte: to } },
        select: {
          title: true,
          amount: true,
          type: true,
          reconciliationDate: true,
          note: true
        },
        orderBy: { reconciliationDate: "asc" }
      })
    ])

    return NextResponse.json({
      contracts: contracts.map((contract) => ({
        ...contract,
        price: Number(contract.price || 0) + Number(contract.outside?.price || 0)
      })),
      renewals: renewals.map((renewal) => ({
        ...renewal,
        price: Number(renewal.price)
      })),
      reconciliations: reconciliations.map((reconciliation) => ({
        ...reconciliation,
        amount: Number(reconciliation.amount)
      }))
    })
  } catch (error) {
    console.error("Dashboard report API Error:", error)
    return NextResponse.json(
      { error: "Không thể tải dữ liệu báo cáo hợp đồng" },
      { status: 500 }
    )
  }
}
