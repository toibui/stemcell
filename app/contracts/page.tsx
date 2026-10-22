'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';

type Renew = {
  renewNo: number;
  startDate: string;
  endDate: string;
};

type Contract = {
  id: string;
  no?: string;
  promote?: number;
  price?: number;
  dateContract: string;

  customer: {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
  };

  type: {
    name: string;
    price: number;
    duration?: number;
  };

  renews: Renew[];
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchContracts = () => {
    fetch('/api/contracts')
      .then(res => {
        if (!res.ok) throw new Error('Không tải được danh sách hợp đồng');
        return res.json();
      })
      .then(data => {
        setContracts(data);
        setLoadError('');
      })
      .catch((error: unknown) => {
        console.error('Error loading contracts:', error);
        setLoadError(error instanceof Error ? error.message : 'Không tải được danh sách hợp đồng');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString('vi-VN') : '-';

  const formatMoney = (money?: number) =>
    money ? money.toLocaleString('vi-VN') + ' đ' : '-';

  const getEndDate = (c: Contract) => {
    const latestRenew = c.renews?.[0];

    if (latestRenew) {
      return new Date(latestRenew.endDate);
    }

    if (c.type.duration) {
      const d = new Date(c.dateContract);
      d.setFullYear(d.getFullYear() + c.type.duration);
      return d;
    }

    return null;
  };

  const getStatus = (endDate: Date | null) => {
    if (!endDate) return { text: '-', color: '', key: 'unknown' };

    const now = new Date();
    const diffMonths =
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths <= 0) {
      return { text: 'Hết hạn', color: 'text-red-600', key: 'expired' };
    }

    if (diffMonths <= 6) {
      return { text: 'Sắp hết hạn', color: 'text-amber-600', key: 'expiring' };
    }

    return { text: 'Còn hạn', color: 'text-teal-700', key: 'active' };
  };

  const filteredContracts = contracts.filter(c => {
    const term = search.trim().toLocaleLowerCase('vi');
    const matchesSearch = !term || [
      c.customer.fullName,
      c.customer.phone,
      c.no ?? '',
      c.type.name
    ].some(value => value.toLocaleLowerCase('vi').includes(term));
    const matchesStatus =
      statusFilter === 'all' || getStatus(getEndDate(c)).key === statusFilter;
    const matchesType = typeFilter === 'all' || c.type.name === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const contractTypes = [...new Set(contracts.map(c => c.type.name))];

  // 🔥 XÓA CONTRACT
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Bạn có chắc muốn xóa hợp đồng này?');

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Xóa thành công');
        fetchContracts(); // reload lại list
      } else {
        alert('Xóa thất bại');
      }
    } catch {
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý hợp đồng</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredContracts.length} / {contracts.length} hợp đồng
          </p>
        </div>

        <Link
          href="/contracts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Thêm hợp đồng
        </Link>
      </div>

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_200px_220px]">
          <label className="relative block">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên khách hàng, số điện thoại, số HĐ..."
              aria-label="Tìm hợp đồng"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <label className="relative">
            <SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Lọc theo tình trạng"
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="active">Còn hạn</option>
              <option value="expiring">Sắp hết hạn</option>
              <option value="expired">Hết hạn</option>
              <option value="unknown">Chưa xác định hạn</option>
            </select>
          </label>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            aria-label="Lọc theo gói"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">Tất cả gói lưu trữ</option>
            {contractTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </section>

      {loadError && (
        <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </p>
      )}

      <div className="bg-white rounded-xl shadow border overflow-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Khách hàng</th>
              <th className="p-4">Số HĐ</th>
              <th className="p-4">Gói</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Ngày ký</th>
              <th className="p-4">Hết hạn</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Gia hạn</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-500">
                  Không tìm thấy hợp đồng phù hợp với bộ lọc.
                </td>
              </tr>
            ) : filteredContracts.map(c => {
              const endDate = getEndDate(c);
              const status = getStatus(endDate);
              const latestRenew = c.renews?.[0];

              return (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-teal-50/50">

                  <td className="p-4">
                    <div className="font-bold">
                      {c.customer.fullName}
                    </div>
                    <div className="text-blue-600 text-sm">
                      {c.customer.phone}
                    </div>
                  </td>

                  <td className="p-4">{c.no || '-'}</td>

                  <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                      {c.type.name}
                    </span>
                  </td>

                  <td className="p-4 text-green-600 font-semibold">
                    {formatMoney(c.price)}
                  </td>

                  <td className="p-4">
                    {formatDate(c.dateContract)}
                  </td>

                  <td className="p-4">
                    {endDate ? formatDate(endDate.toISOString()) : '-'}
                  </td>

                  <td className={`p-4 font-semibold ${status.color}`}>
                    {status.text}
                  </td>

                  {/* RENEW */}
                  <td className="p-4 text-center">
                    {latestRenew && (
                      <div className="text-xs text-gray-500 mb-1">
                        Lần #{latestRenew.renewNo}
                      </div>
                    )}

                    {status.text !== 'Còn hạn' && (
                      <Link
                        href={`/renew-contract/new?contractId=${c.id}`}
                        className="text-green-600 hover:underline"
                      >
                        Gia hạn
                      </Link>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="p-4 text-center space-x-2">

                    {/* EDIT */}
                    <Link
                      href={`/contracts/${c.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </Link>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>

                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

      </div>

    </div>
  );
}