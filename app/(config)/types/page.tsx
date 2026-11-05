'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TYPE_GROUP_OPTIONS } from '@/lib/type-options';

type TypeItem = {
  id: string;
  name: string;
  price: number;
  duration: number;
  typegroup: string | null;
  countbaby: string | null;
};

export default function TypesPage() {
  const router = useRouter();
  const [types, setTypes] = useState<TypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [babyCountFilter, setBabyCountFilter] = useState('');
  const [typeGroupFilter, setTypeGroupFilter] = useState('');

  // Fetch tất cả Types
  useEffect(() => {
    fetch('/api/types')
      .then(res => res.json())
      .then(data => {
        setTypes(data);
        setLoading(false);
      });
  }, []);

  // Xoá Type
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá?')) return;

    await fetch(`/api/types/${id}`, {
      method: 'DELETE',
    });

    setTypes(prev => prev.filter(t => t.id !== id));
  };

  const filteredTypes = types.filter(type =>
    (!babyCountFilter || type.countbaby === babyCountFilter) &&
    (!typeGroupFilter || type.typegroup === typeGroupFilter)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Types
          </h1>

          <button
            onClick={() => router.push('/types/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Thêm mới
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="baby-count-filter" className="mb-1 block text-sm font-medium">Lọc theo thai</label>
            <select
              id="baby-count-filter"
              value={babyCountFilter}
              onChange={e => setBabyCountFilter(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="1">Thai đơn</option>
              <option value="2">Thai đôi</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="type-group-filter" className="mb-1 block text-sm font-medium">Lọc theo gói</label>
            <select
              id="type-group-filter"
              value={typeGroupFilter}
              onChange={e => setTypeGroupFilter(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">Tất cả</option>
              {TYPE_GROUP_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Tên gói</th>
              <th className="p-3 border">Giá gói</th>
              <th className="p-3 border">Số năm</th>
              <th className="p-3 border">Nhóm Type</th>
              <th className="p-3 border">Số bé</th>
              <th className="p-3 border w-40">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTypes.map(type => (
              <tr key={type.id}>
                <td className="p-3 border">{type.name}</td>
                  <td className="p-3 border">
                    {type.price ? Number(type.price).toLocaleString('vi-VN') : ''}
                  </td>
                  <td className="p-3 border">
                    {type.duration}
                  </td>
                  <td className="p-3 border">{type.typegroup || '-'}</td>
                  <td className="p-3 border">{type.countbaby || '-'}</td>

                <td className="p-3 border space-x-2">
                  <button
                    onClick={() => router.push(`/types/${type.id}`)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(type.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {filteredTypes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-center text-gray-500">
                  {types.length === 0 ? 'Chưa có type nào' : 'Không có Type phù hợp với bộ lọc'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}