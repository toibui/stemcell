'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Contract = {
  id: string;
  no?: string;
  dateContract: string;
  createdAt: string;
  customer: {
    fullName: string;
    phone: string;
  };
  type: {
    name: string;
  };
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => {
        setContracts(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xoá hợp đồng này?');
    if (!confirmDelete) return;

    await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Danh sách hợp đồng</h1>
        <Link
          href="/contracts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Thêm hợp đồng
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          Chưa có hợp đồng nào
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3 text-left">Khách hàng</th>
                  <th className="p-3 text-left">Điện thoại</th>
                  <th className="p-3 text-left">Mã hợp đồng</th>
                  <th className="p-3 text-left">Loại hợp đồng</th>
                  <th className="p-3 text-left">Ngày hợp đồng</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{c.customer.fullName}</td>
                    <td className="p-3">{c.customer.phone}</td>
                    <td className="p-3">{c.no || '-'}</td>
                    <td className="p-3">{c.type.name}</td>
                    <td className="p-3">{formatDate(c.dateContract)}</td>
                    <td className="p-3">{formatDate(c.createdAt)}</td>
                    <td className="p-3 text-center space-x-3">
                      <Link
                        href={`/contracts/${c.id}`}
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