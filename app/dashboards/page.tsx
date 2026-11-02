"use client"

import { useEffect, useState } from "react"
import {
  MessageSquare,
  FileText,
  FlaskConical,
  Users,
  UserCheck,
  ClipboardList,
  Baby,
  Calendar,
  Download,
  Activity,
  FolderKanban
} from "lucide-react"
import ExcelJS from "exceljs"

import KPICard from "@/components/dashboard/KPICard"
import MetricCard from "@/components/dashboard/MetricCard"
import FunnelChart from "@/components/dashboard/FunnelChart"

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

function parseDisplayDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return formatDate(date)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value)
}

interface DashboardData {
  totalCustomers: number
  totalUniqueConsultedCustomers: number
  totalConsultings: number
  totalContracts: number
  totalSamples: number
  renewCount: number
  reconciliationCount: number
  
  // 💰 Tách bạch doanh thu
  contractRevenue: number
  renewRevenue: number
  reconciliationRevenue: number
  revenue: number

  consultRate: number
  conversionRate: number
  sampleRate: number
}

interface ContractReportItem {
  contractNo: string | null
  customerName: string
  customerPhone: string
  typeName: string
  date: string
  amount: number
  transactionType: "Hợp đồng mới" | "Gia hạn" | "Đối soát dự án"
  renewalNumber: number | null
}

function styleReportSheet(
  worksheet: ExcelJS.Worksheet,
  columnCount: number,
  headerRow: number
) {
  const title = worksheet.getRow(1)
  worksheet.mergeCells(1, 1, 1, columnCount)
  title.height = 34
  title.getCell(1).font = { name: "Aptos Display", bold: true, size: 18, color: { argb: "FFFFFFFF" } }
  title.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F766E" } }
  title.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 }

  if (headerRow > 2) {
    const subtitle = worksheet.getRow(2)
    subtitle.height = 24
    for (let column = 1; column <= columnCount; column += 1) {
      const cell = subtitle.getCell(column)
      cell.font = { name: "Aptos", size: 10, color: { argb: "FF475569" }, italic: true }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } }
      cell.alignment = { vertical: "middle", indent: column === 1 ? 1 : 0 }
    }
  }

  const header = worksheet.getRow(headerRow)
  header.height = 30
  header.eachCell((cell) => {
    cell.font = { name: "Aptos", bold: true, size: 10, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } }
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    cell.border = { bottom: { style: "medium", color: { argb: "FF0F766E" } } }
  })

  for (let rowNumber = headerRow + 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    row.height = 22
    const isMonthlyTotal = row.getCell(2).value === "TỔNG THÁNG"
    row.eachCell((cell) => {
      cell.font = { name: "Aptos", size: 10, ...(isMonthlyTotal ? { bold: true } : {}) }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isMonthlyTotal ? "FFCCFBF1" : rowNumber % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF" }
      }
      cell.alignment = {
        vertical: "middle",
        horizontal: typeof cell.value === "number" ? "right" : "left",
        wrapText: true
      }
      cell.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } }
    })
  }

  worksheet.views = [{ state: "frozen", ySplit: headerRow }]
  worksheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
  }
  worksheet.properties.defaultRowHeight = 22
  worksheet.autoFilter = `A${headerRow}:${String.fromCharCode(64 + columnCount)}${worksheet.rowCount}`
}

export default function DashboardPage() {
  const today = new Date()
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

  const [from, setFrom] = useState(formatDate(firstDayOfYear))
  const [to, setTo] = useState(formatDate(today))
  const [fromInput, setFromInput] = useState(formatDisplayDate(formatDate(firstDayOfYear)))
  const [toInput, setToInput] = useState(formatDisplayDate(formatDate(today)))
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    if (!from || !to || from > to) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/dashboard?from=${from}&to=${to}`)
        if (!res.ok) throw new Error("Failed to fetch dashboard data")

        const result = await res.json()
        setData(result.data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [from, to])

  const patientRevenueTotal =
    (data?.contractRevenue || 0) + (data?.renewRevenue || 0)

  const setPreset = (type: "month" | "30days" | "year") => {
    const now = new Date()
    let startDate = from

    if (type === "month") {
      startDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
    }

    if (type === "30days") {
      const past = new Date()
      past.setDate(now.getDate() - 30)
      startDate = formatDate(past)
    }

    if (type === "year") {
      startDate = formatDate(new Date(now.getFullYear(), 0, 1))
    }

    const endDate = formatDate(now)
    setFrom(startDate)
    setTo(endDate)
    setFromInput(formatDisplayDate(startDate))
    setToInput(formatDisplayDate(endDate))
  }

  const parsedFromInput = parseDisplayDate(fromInput)
  const parsedToInput = parseDisplayDate(toInput)
  const dateInputError = !parsedFromInput
    ? "Ngày bắt đầu không hợp lệ. Hãy nhập theo dạng ngày/tháng/năm."
    : !parsedToInput
      ? "Ngày kết thúc không hợp lệ. Hãy nhập theo dạng ngày/tháng/năm."
      : parsedFromInput > parsedToInput
        ? "Ngày kết thúc không thể trước ngày bắt đầu."
        : null
  const hasInvalidDateRange = Boolean(dateInputError)

  const exportToExcel = async () => {
    if (!data || dateInputError || hasInvalidDateRange) return

    try {
      setExportError(null)
      setExporting(true)
      const reportResponse = await fetch(
        `/api/dashboard/report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      )
      if (!reportResponse.ok) {
        const result = await reportResponse.json()
        throw new Error(result.error || "Không thể tải chi tiết hợp đồng")
      }

      const report = (await reportResponse.json()) as {
        contracts: Array<{
          no: string | null
          customer: { fullName: string; phone: string }
          type: { name: string | null }
          dateContract: string
          price: number | null
        }>
        renewals: Array<{
          renewNo: number
          contract: {
            no: string | null
            customer: { fullName: string; phone: string }
          }
          type: { name: string | null }
          startDate: string
          price: number
        }>
        reconciliations: Array<{
          title: string
          amount: number
          type: string | null
          reconciliationDate: string
          note: string | null
        }>
      }
      const reportItems: ContractReportItem[] = [
        ...report.contracts.map((contract) => ({
          contractNo: contract.no,
          customerName: contract.customer.fullName,
          customerPhone: contract.customer.phone,
          typeName: contract.type.name || "Chưa phân loại",
          date: contract.dateContract,
          amount: contract.price || 0,
          transactionType: "Hợp đồng mới" as const,
          renewalNumber: null
        })),
        ...report.renewals.map((renewal) => ({
          contractNo: renewal.contract.no,
          customerName: renewal.contract.customer.fullName,
          customerPhone: renewal.contract.customer.phone,
          typeName: renewal.type.name || "Chưa phân loại",
          date: renewal.startDate,
          amount: renewal.price,
          transactionType: "Gia hạn" as const,
          renewalNumber: renewal.renewNo
        })),
        ...report.reconciliations.map((reconciliation) => ({
          contractNo: null,
          customerName: "",
          customerPhone: "",
          typeName: reconciliation.title,
          date: reconciliation.reconciliationDate,
          amount: reconciliation.amount,
          transactionType: "Đối soát dự án" as const,
          renewalNumber: null
        }))
      ]
      reportItems.sort((a, b) => a.date.localeCompare(b.date))

      const workbook = new ExcelJS.Workbook()
      const dashboardSheet = workbook.addWorksheet("Dashboard")
      dashboardSheet.addRows([
        ["Báo cáo Dashboard"],
        ["Từ ngày", from, "Đến ngày", to],
        [],
        ["Nhóm", "Chỉ số", "Giá trị", "Đơn vị"],
        ["Doanh thu", "Tổng doanh thu gộp", data.revenue, "VND"],
        ["Doanh thu", "Doanh thu hợp đồng mới", data.contractRevenue, "VND"],
        ["Doanh thu", "Doanh thu gia hạn", data.renewRevenue, "VND"],
        ["Doanh thu", "Doanh thu đối soát dự án", data.reconciliationRevenue, "VND"],
        ["Doanh thu", "Doanh thu bệnh nhân (hợp đồng + gia hạn)", patientRevenueTotal, "VND"],
        ["Khách hàng", "Khách hàng", data.totalCustomers, "khách"],
        ["Khách hàng", "Khách hàng được tư vấn", data.totalUniqueConsultedCustomers, "khách"],
        ["Tư vấn", "Tổng tư vấn", data.totalConsultings, "lượt"],
        ["Hợp đồng", "Hợp đồng mới", data.totalContracts, "hợp đồng"],
        ["Hợp đồng", "Số lần gia hạn", data.renewCount, "lần"],
        ["Mẫu", "Mẫu đã lấy", data.totalSamples, "mẫu"],
        ["Đối soát", "Số khoản đối soát dự án", data.reconciliationCount, "khoản"],
        ["Tỷ lệ", "Tỷ lệ tư vấn", data.consultRate, "%"],
        ["Tỷ lệ", "Tỷ lệ chuyển đổi", data.conversionRate, "hợp đồng/khách"],
        ["Tỷ lệ", "Tỷ lệ lấy mẫu", data.sampleRate, "%"]
      ])
      dashboardSheet.columns = [
        { width: 16 },
        { width: 48 },
        { width: 18 },
        { width: 20 }
      ]
      for (let row = 5; row <= 9; row += 1) {
        dashboardSheet.getCell(row, 3).numFmt = "#,##0"
      }

      const monthlyTotals = new Map<string, { count: number; amount: number }>()
      for (const item of reportItems) {
        const month = item.date.slice(0, 7)
        const key = JSON.stringify([month, item.transactionType, item.typeName])
        const total = monthlyTotals.get(key) || { count: 0, amount: 0 }
        total.count += 1
        total.amount += item.amount
        monthlyTotals.set(key, total)
      }

      const monthlySheet = workbook.addWorksheet("Tổng hợp theo tháng")
      monthlySheet.addRows([
        ["Tổng tiền theo tháng và loại hợp đồng"],
        ["Khoảng ngày", `${formatDisplayDate(from)} - ${formatDisplayDate(to)}`],
        [],
        ["Tháng", "Loại giao dịch", "Loại hợp đồng", "Số lượng", "Tổng tiền (VND)"]
      ])
      const monthRows = Array.from(monthlyTotals.entries())
        .map(([key, total]) => {
          const [month, transactionType, typeName] = JSON.parse(key) as [string, string, string]
          return { month, transactionType, typeName, ...total }
        })
        .sort((a, b) =>
          a.month.localeCompare(b.month) ||
          a.transactionType.localeCompare(b.transactionType, "vi") ||
          a.typeName.localeCompare(b.typeName, "vi")
        )
      const monthRowsWithTotals: Array<{
        month: string
        transactionType: string
        typeName: string
        count: number
        amount: number
        isMonthlyTotal?: boolean
      }> = []
      for (let index = 0; index < monthRows.length;) {
        const month = monthRows[index].month
        const rowsForMonth: typeof monthRows = []
        while (monthRows[index]?.month === month) {
          rowsForMonth.push(monthRows[index])
          index += 1
        }
        monthRowsWithTotals.push(
          ...rowsForMonth,
          {
            month,
            transactionType: "TỔNG THÁNG",
            typeName: "",
            count: rowsForMonth.reduce((sum, row) => sum + row.count, 0),
            amount: rowsForMonth.reduce((sum, row) => sum + row.amount, 0),
            isMonthlyTotal: true
          }
        )
      }
      monthlySheet.addRows(monthRowsWithTotals.map((row) => [
        row.month,
        row.transactionType,
        row.typeName,
        row.count,
        row.amount
      ]))
      monthlySheet.columns = [
        { width: 14 },
        { width: 20 },
        { width: 36 },
        { width: 14 },
        { width: 22 }
      ]
      for (let row = 5; row <= monthlySheet.rowCount; row += 1) {
        monthlySheet.getCell(row, 5).numFmt = "#,##0"
      }

      const detailsSheet = workbook.addWorksheet("Chi tiết hợp đồng")
      detailsSheet.addRows([
        ["Chi tiết hợp đồng và gia hạn"],
        ["Kỳ báo cáo", `${formatDisplayDate(from)} - ${formatDisplayDate(to)}`],
        []
      ])
      detailsSheet.addRow([
        "Loại giao dịch",
        "Mã hợp đồng",
        "Lần gia hạn",
        "Họ tên khách hàng",
        "Số điện thoại",
        "Loại hợp đồng",
        "Ngày ký / bắt đầu gia hạn",
        "Số tiền (VND)"
      ])
      for (const item of reportItems) {
        if (item.transactionType === "Đối soát dự án") continue
        const row = detailsSheet.addRow([
          item.transactionType,
          item.contractNo || "",
          item.renewalNumber ?? "",
          item.customerName,
          item.customerPhone,
          item.typeName,
          new Date(item.date),
          item.amount
        ])
        row.getCell(7).numFmt = "dd/mm/yyyy"
        row.getCell(8).numFmt = "#,##0"
        row.getCell(5).numFmt = "@"
      }
      detailsSheet.columns = [
        { width: 20 },
        { width: 20 },
        { width: 14 },
        { width: 32 },
        { width: 20 },
        { width: 36 },
        { width: 26 },
        { width: 20 }
      ]
      const reconciliationSheet = workbook.addWorksheet("Đối soát dự án")
      reconciliationSheet.addRows([
        ["Chi tiết đối soát dự án"],
        ["Kỳ báo cáo", `${formatDisplayDate(from)} - ${formatDisplayDate(to)}`],
        []
      ])
      reconciliationSheet.addRow([
        "Tên khoản đối soát",
        "Loại",
        "Ngày đối soát",
        "Số tiền (VND)",
        "Ghi chú"
      ])
      for (const item of report.reconciliations) {
        const row = reconciliationSheet.addRow([
          item.title,
          item.type || "",
          new Date(item.reconciliationDate),
          item.amount,
          item.note || ""
        ])
        row.getCell(3).numFmt = "dd/mm/yyyy"
        row.getCell(4).numFmt = "#,##0"
      }
      reconciliationSheet.columns = [
        { width: 36 },
        { width: 24 },
        { width: 18 },
        { width: 20 },
        { width: 48 }
      ]
      styleReportSheet(dashboardSheet, 4, 4)
      styleReportSheet(monthlySheet, 5, 4)
      styleReportSheet(detailsSheet, 8, 4)
      styleReportSheet(reconciliationSheet, 5, 4)

      const file = await workbook.xlsx.writeBuffer()
      const url = URL.createObjectURL(
        new Blob([file], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })
      )
      const link = document.createElement("a")
      link.href = url
      link.download = `bao-cao-dashboard_${from}_${to}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : "Không thể xuất file Excel")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-400 animate-pulse">
        Đang tải dữ liệu...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        {error}
      </div>
    )
  }

  if (!data) return null

  const funnelData = [
    { name: "Khách hàng", value: data.totalCustomers, color: "#0f766e" },
    { name: "KH tư vấn", value: data.totalUniqueConsultedCustomers, color: "#159a8c" },
    { name: "Hợp đồng", value: data.totalContracts, color: "#43b5a5" },
    { name: "Mẫu lấy", value: data.totalSamples, color: "#8bd3c7" }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-[1600px] mx-auto space-y-10">

        {/* HEADER */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Sales & Revenue Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium">
              Trung tâm Tế bào gốc Phenikaa - Quản lý tài chính & vận hành
            </p>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setPreset("month")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition">
                Tháng này
              </button>
              <button onClick={() => setPreset("30days")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition">
                30 ngày
              </button>
              <button onClick={() => setPreset("year")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition">
                Năm nay
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  value={fromInput}
                  onChange={(e) => {
                    const value = e.target.value
                    const parsed = parseDisplayDate(value)
                    setFromInput(value)
                    if (parsed) {
                      setFrom(parsed)
                    }
                  }}
                  aria-label="Từ ngày, nhập theo dạng ngày/tháng/năm"
                  className="w-[100px] bg-transparent text-sm font-semibold focus:outline-none"
                />
                <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-emerald-600">
                  <Calendar size={16} />
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => {
                      const value = e.target.value
                      if (!value) return
                      setFrom(value)
                      setFromInput(formatDisplayDate(value))
                    }}
                    aria-label="Chọn ngày bắt đầu trên lịch"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  value={toInput}
                  onChange={(e) => {
                    const value = e.target.value
                    const parsed = parseDisplayDate(value)
                    setToInput(value)
                    if (parsed) {
                      setTo(parsed)
                    }
                  }}
                  aria-label="Đến ngày, nhập theo dạng ngày/tháng/năm"
                  className="w-[100px] bg-transparent text-sm font-semibold focus:outline-none"
                />
                <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-emerald-600">
                  <Calendar size={16} />
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => {
                      const value = e.target.value
                      if (!value) return
                      setTo(value)
                      setToInput(formatDisplayDate(value))
                    }}
                    aria-label="Chọn ngày kết thúc trên lịch"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </div>
            <button
              type="button"
              onClick={exportToExcel}
              disabled={!data || loading || exporting || Boolean(dateInputError) || hasInvalidDateRange}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              {exporting ? "Đang xuất..." : "Xuất Excel"}
            </button>
          </div>
          {exportError && (
            <p role="alert" className="w-full text-right text-sm text-red-600">
              {exportError}
            </p>
          )}
          {dateInputError && (
            <p role="alert" className="w-full text-right text-sm text-red-600">
              {dateInputError}
            </p>
          )}
        </section>

        {/* 💰 REVENUE BREAKDOWN SECTION */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 ml-2 flex items-center gap-2">
            <Activity size={20} className="text-emerald-600" /> Phân tích dòng tiền & Doanh thu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. TỔNG DOANH THU GỘP */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Tổng doanh thu gộp</p>
                <h2 className="text-3xl font-black mt-2 text-emerald-400">
                  {formatCurrency(data.revenue)}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-700">
                Bao gồm: Hợp đồng bệnh nhân + Nghiên cứu dự án
              </p>
            </div>

            {/* 2. DÒNG TIỀN BỆNH NHÂN */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5">
                    <Baby size={16} /> Thu nhập từ Bệnh nhân
                  </p>
                  <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    Hợp đồng & Gia hạn
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-3">
                  {formatCurrency(patientRevenueTotal)}
                </h2>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>Hợp đồng mới: <b>{formatCurrency(data.contractRevenue)}</b></span>
                <span>Gia hạn: <b>{formatCurrency(data.renewRevenue)}</b></span>
              </div>
            </div>

            {/* 3. DÒNG TIỀN DỰ ÁN */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-purple-600 flex items-center gap-1.5">
                    <FolderKanban size={16} /> Đối soát Nghiên cứu Dự án
                  </p>
                  <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    Quỹ dự án
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-3">
                  {formatCurrency(data.reconciliationRevenue)}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
                Khoản thu từ đối soát dòng tiền nghiên cứu độc lập
              </p>
            </div>

          </div>
        </div>

        {/* KPI CARDS */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 ml-2">
          Chỉ số hiệu suất vận hành
        </h2>

        <section className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex flex-nowrap gap-4 min-w-full">
            <KPICard title="Khách hàng" value={data.totalCustomers} icon={<Users size={20} />} color="green" />
            <KPICard title="Khách hàng (tư vấn)" value={data.totalUniqueConsultedCustomers} icon={<UserCheck size={20} />} color="purple" />
            <KPICard title="Tổng tư vấn" value={data.totalConsultings} icon={<ClipboardList size={20} />} color="blue" />
            <KPICard title="Hợp đồng" value={data.totalContracts} icon={<FileText size={20} />} color="orange" />
            <KPICard title="Mẫu lấy" value={data.totalSamples} icon={<Baby size={20} />} color="red" />
          </div>
        </section>

        {/* METRIC CARDS */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 ml-2">
          Thống kê tỷ lệ
        </h2>

        <section className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex flex-nowrap gap-4 min-w-max">
            <MetricCard
              label="Process"
              value={`${data.consultRate}%`}
              sub="Tư vấn khách / Khách mới"
              variant="indigo"
              icon={<MessageSquare size={16} />}
            />
            <MetricCard
              label="Consulting rate"
              value={`${data.conversionRate}`}
              sub="Hợp đồng / Khách tư vấn"
              variant="amber"
              icon={<FileText size={16} />}
            />
            <MetricCard
              label="Sample rate"
              value={`${data.sampleRate}%`}
              sub="Mẫu / Hợp đồng"
              variant="rose"
              icon={<FlaskConical size={16} />}
            />
          </div>
        </section>

        {/* FUNNEL CHART */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Biểu đồ các chỉ số</h2>
            <p className="mt-1 text-sm text-slate-500">Tổng quan hành trình khách hàng và mẫu lưu trữ</p>
          </div>

          <FunnelChart data={funnelData} />
        </section>

      </div>
    </div>
  )
}