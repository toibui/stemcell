'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type BirthTracking = {
  id: string;
  edd?: string;
  actualBirthAt?: string;
  hospitalName?: string;
  birthType?: string;
  babiesCount: number;
  status: string;
  contract: {
    id: string;
    customer: {
      id: string;
      fullName: string;
      phone: string;
    };
  };
};

export default function BirthTrackingPage() {
  const [births, setBirths] = useState<BirthTracking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/births')
      .then(res => res.json())
      .then(data => {
        setBirths(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá?')) return;

    await fetch(`/api/births/${id}`, { method: 'DELETE' });
    setBirths(prev => prev.filter(b => b.id !== id));
  };

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString('vi-VN') : '-';

  if (loading) {
    return <div className="p-4 text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Birth Tracking</h1>

        <Link
          href="/birthtracking/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          + New Birth Tracking
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">EDD</th>
              <th className="p-3 text-left">Actual Birth</th>
              <th className="p-3 text-left">Hospital</th>
              <th className="p-3 text-center">Babies</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {births.map(b => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">
                  {b.contract.customer.fullName}
                </td>
                <td className="p-3">
                  {b.contract.customer.phone}
                </td>
                <td className="p-3">{formatDate(b.edd)}</td>
                <td className="p-3">
                  {formatDate(b.actualBirthAt)}
                </td>
                <td className="p-3">{b.hospitalName || '-'}</td>
                <td className="p-3 text-center">
                  {b.babiesCount}
                </td>
                <td className="p-3">{b.status}</td>
                <td className="p-3 text-center space-x-2">
                  <Link
                    href={`/birthtracking/${b.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {births.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-6 text-gray-400"
                >
                  Chưa có Birth Tracking nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}