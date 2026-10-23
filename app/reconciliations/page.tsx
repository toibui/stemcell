'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Plus, Calendar, Trash2, Edit } from 'lucide-react';

type Staff = {
  id: string;
  fullName: string;
  email: string;
};

type Reconciliation = {
  id: string;
  title: string;
  amount: number | string;
  type: string;
  reconciliationDate: string;
  note?: string;
  staff?: Staff;
};

export default function ReconciliationsPage() {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Bộ lọc
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const fetchReconciliations = () => {
    setLoading(true);
    let url = '/api/reconciliations';
    const params = new URLSearchParams();
    
    if (monthFilter) params.append('month', monthFilter);
    if (yearFilter) params.append('year', yearFilter);
    if (typeFilter !== 'all') params.append('type', typeFilter);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Không tải được danh sách đối soát');
        return res.json();
      })
      .then(data => {
        setReconciliations(data);
        setLoadError('');
      })
      .catch((error: unknown) => {
        console.error('Error loading reconciliations:', error);
        setLoadError(error instanceof Error ? error.message : 'Không tải được danh sách đối soát');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReconciliations();
  }, [monthFilter, yearFilter, typeFilter]);

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString('vi-VN') : '-';

  const formatMoney = (money?: number | string) =>
    money ? Number(money).toLocaleString('vi-VN') + ' đ' : '0 đ';

  // Lọc theo từ khóa tìm kiếm (title hoặc ghi chú)
  const filteredReconciliations = reconciliations.filter(item => {
    const term = search.trim().toLocaleLowerCase('vi');
    if (!term) return true;
    return (
      item.title.toLocaleLowerCase('vi').includes(term) ||
      (item.note && item.note.toLocaleLowerCase('vi').includes(term)) ||
      (item.staff?.fullName && item.staff.fullName.toLocaleLowerCase('vi').includes(term))
    );
  });

  // Tính tổng tiền các khoản đang hiển thị
  const totalAmount = filteredReconciliations.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // Xóa khoản đối soát
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Bạn có chắc muốn xóa khoản đối soát này?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/reconciliations/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Xóa thành công');
        fetchReconciliations();
      } else {
        alert('Xóa thất bại');
      }
    } catch {
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đối soát dòng tiền dự án</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng số: <span className="font-semibold text-slate-700">{filteredReconciliations.length}</span> khoản | Tổng tiền: <span className="font-semibold text-emerald-600">{formatMoney(totalAmount)}</span>
          </p>
        </div>

        <Link
          href="/reconciliations/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 font-medium transition shadow-sm"
        >
          <Plus size={18} /> Thêm đối soát mới
        </Link>
      </div>

      {/* FILTERS SECTION */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(200px,1fr)_160px_160px_180px]">
          {/* Tìm kiếm */}
          <label className="relative block">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo nội dung, ghi chú, nhân viên..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {/* Lọc loại */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả loại</option>
              <option value="PROJECT_RESEARCH">Nghiên cứu dự án</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          {/* Lọc Tháng */}
          <div className="relative">
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tất cả các tháng</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Năm */}
          <div className="relative">
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tất cả năm</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>
      </section>

      {loadError && (
        <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </p>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 text-left">Nội dung / Dự án</th>
              <th className="p-4 text-left">Loại</th>
              <th className="p-4 text-left">Số tiền</th>
              <th className="p-4 text-left">Ngày đối soát</th>
              <th className="p-4 text-left">Nhân viên nhập</th>
              <th className="p-4 text-left">Ghi chú</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredReconciliations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  Không tìm thấy khoản đối soát nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredReconciliations.map(item => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-blue-50/50 transition">
                  <td className="p-4 font-semibold text-slate-800">
                    {item.title}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.type === 'PROJECT_RESEARCH' 
                        ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.type === 'PROJECT_RESEARCH' ? 'Nghiên cứu dự án' : 'Khác'}
                    </span>
                  </td>
                  <td className="p-4 text-emerald-600 font-bold">
                    {formatMoney(item.amount)}
                  </td>
                  <td className="p-4 text-slate-600">
                    {formatDate(item.reconciliationDate)}
                  </td>
                  <td className="p-4 text-slate-600">
                    {item.staff?.fullName || '-'}
                  </td>
                  <td className="p-4 text-slate-500 max-w-xs truncate">
                    {item.note || '-'}
                  </td>
                  <td className="p-4 text-center space-x-3">
                    <Link
                      href={`/reconciliations/${item.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                    >
                      <Edit size={16} /> Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}