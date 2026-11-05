'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Consulting = {
  id: string;
  Content?: string;
  createdAt: string;
  customer: {
    fullName: string;
    phone: string;
  };
  staff: {
    fullName: string;
  };
};

export default function ConsultingsPage() {
  const [consultings, setConsultings] = useState<Consulting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/consultings')
      .then(res => res.json())
      .then(data => {
        setConsultings(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xoá buổi tư vấn này?');
    if (!confirmDelete) return;

    await fetch(`/api/consultings/${id}`, { method: 'DELETE' });
    setConsultings(prev => prev.filter(c => c.id !== id));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Danh sách buổi tư vấn</h1>
        <Link
          href="/consultings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Thêm buổi tư vấn
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : consultings.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          Chưa có buổi tư vấn nào
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3 text-left">Khách hàng</th>
                  <th className="p-3 text-left">Điện thoại</th>
                  <th className="p-3 text-left">Nhân viên</th>
                  <th className="p-3 text-left">Nội dung</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {consultings.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{c.customer.fullName}</td>
                    <td className="p-3">{c.customer.phone}</td>
                    <td className="p-3">{c.staff.fullName}</td>
                    <td className="p-3">{c.Content || '-'}</td>
                    <td className="p-3">{formatDate(c.createdAt)}</td>
                    <td className="p-3 text-center space-x-3">
                      <Link
                        href={`/consultings/${c.id}`}
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