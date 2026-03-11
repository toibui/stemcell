'use client'

import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

interface MonthlyComparison {
  year: number
  month: number
  monthlyTarget: number
  actualRevenue: number
  difference: number
}

interface YearlyComparison {
  year: number
  yearlyTarget: number
  actualRevenue: number
  difference: number
}

interface RevenueComparisonData {
  monthly: MonthlyComparison[]
  yearly: YearlyComparison[]
}

export default function RevenueComparisonPage() {
  const today = new Date()
  const currentYear = today.getFullYear() // năm hiện tại

  const [year, setYear] = useState(currentYear) // state year mặc định
  const [data, setData] = useState<RevenueComparisonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (yearParam?: number) => {
    try {
      setLoading(true)
      setError(null)
      // Gửi query ?year nếu có
      const url = yearParam ? `/api/kpis?year=${yearParam}` : '/api/kpis'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch revenue comparison')
      const result = await res.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load dữ liệu khi mount + khi year thay đổi
  useEffect(() => {
    fetchData(year)
  }, [year])

  if (loading) {
    return <div className="p-10 text-center text-slate-400 animate-pulse">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-[1600px] mx-auto space-y-10">

        <h1 className="text-2xl font-black text-slate-900 mb-4">So sánh doanh thu / Target</h1>

        {/* YEAR FILTER */}
        <div className="mb-6 flex items-center gap-3">
          <Calendar size={16} className="text-slate-400" />
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-1"
          >
            {/* Bạn có thể thêm nhiều năm tuỳ ý */}
            {Array.from({ length: 5 }).map((_, i) => {
              const y = currentYear - i
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            })}
          </select>
        </div>

        {/* MONTHLY COMPARISON TABLE */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Theo tháng</h2>
          <table className="min-w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-2 border">Năm</th>
                <th className="px-4 py-2 border">Tháng</th>
                <th className="px-4 py-2 border">Target</th>
                <th className="px-4 py-2 border">Doanh thu thực tế</th>
                <th className="px-4 py-2 border">Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              {data.monthly.map(target => (
                <tr key={`${target.year}-${target.month}`} className="hover:bg-slate-50">
                  <td className="px-4 py-2 border">{target.year}</td>
                  <td className="px-4 py-2 border">{target.month}</td>
                  <td className="px-4 py-2 border font-semibold">{formatCurrency(target.monthlyTarget)}</td>
                  <td className="px-4 py-2 border font-semibold">{formatCurrency(target.actualRevenue)}</td>
                  <td
                    className={`px-4 py-2 border font-semibold ${
                      target.difference >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(target.difference)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* YEARLY COMPARISON TABLE */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Theo năm</h2>
          <table className="min-w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-2 border">Năm</th>
                <th className="px-4 py-2 border">Target cả năm</th>
                <th className="px-4 py-2 border">Doanh thu thực tế</th>
                <th className="px-4 py-2 border">Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              {data.yearly.map(target => (
                <tr key={target.year} className="hover:bg-slate-50">
                  <td className="px-4 py-2 border">{target.year}</td>
                  <td className="px-4 py-2 border font-semibold">{formatCurrency(target.yearlyTarget)}</td>
                  <td className="px-4 py-2 border font-semibold">{formatCurrency(target.actualRevenue)}</td>
                  <td
                    className={`px-4 py-2 border font-semibold ${
                      target.difference >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(target.difference)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}