'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Customer = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  edd?: string;
  births?: any[];
  consulting?: any[];
  contract?: any[];
  channelMarketing?: {
    name: string;
  } | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xoá khách hàng này?');
    if (!confirmDelete) return;

    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Danh sách khách hàng</h1>
        <Link
          href="/customers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Thêm khách hàng
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          Chưa có khách hàng nào
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3 text-left">Họ tên</th>
                  <th className="p-3 text-left">Điện thoại</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Ngày sinh</th>
                  <th className="p-3 text-left">EDD</th>
                  <th className="p-3 text-left">Nguồn</th>
                  <th className="p-3 text-center">Số lần tư vấn</th>
                  <th className="p-3 text-center">Ngày sinh thực tế</th>
                  <th className="p-3 text-center">Số hợp đồng</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr
                    key={c.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium">{c.fullName}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">{c.email || '-'}</td>
                    <td className="p-3">{formatDate(c.dateOfBirth)}</td>
                    <td className="p-3">
                      {c.edd ? (
                        <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs">
                          {formatDate(c.edd)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3">
                      {c.channelMarketing?.name || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                        {c.consulting?.length || 0}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                        {c.births && c.births.length > 0
                          ? new Date(
                              // Lấy phần tử mới nhất (mới nhất theo thứ tự trong mảng)
                              c.births[c.births.length - 1].actualBirthAt
                            ).toLocaleDateString('vi-VN')
                          : '-'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                        {c.contract && c.contract.length > 0
                          ? `${c.contract[c.contract.length - 1].no} (${new Date(
                              c.contract[c.contract.length - 1].dateContract
                            ).toLocaleDateString('vi-VN')})`
                          : '-'}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-3">
                      <Link
                        href={`/customers/${c.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-500 hover:underline"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}