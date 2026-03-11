'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Target = {
  id: string;
  year: number;
  month: number;
  monthlyTarget: number;
};

export default function TargetPage() {
  const router = useRouter();

  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ year: number; month: number; monthlyTarget: number }>({
    year: new Date().getFullYear(),
    month: 1,
    monthlyTarget: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load target list
  const fetchTargets = async () => {
    setLoading(true);
    const res = await fetch('/api/targets');
    const data = await res.json();
    setTargets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) }));
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId ? `/api/targets/${editingId}` : '/api/targets';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      setForm({ year: new Date().getFullYear(), month: 1, monthlyTarget: 0 });
      setEditingId(null);
      fetchTargets();
    } catch {
      alert('Có lỗi xảy ra khi lưu target.');
    } finally {
      setSaving(false);
    }
  };


  const handleEdit = (target: Target) => {
    setForm({
      year: target.year,
      month: target.month,
      monthlyTarget: Number(target.monthlyTarget),
    });
    setEditingId(target.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa target này không?')) return;
    await fetch(`/api/targets/${id}`, { method: 'DELETE' });
    fetchTargets();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Quản lý Target</h1>

        {/* Form Tạo / Sửa */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Năm *</label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-medium">Tháng *</label>
              <select
                name="month"
                value={form.month}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-medium">Target tháng *</label>
              <input
                type="number"
                name="monthlyTarget"
                value={form.monthlyTarget ? formatVND(form.monthlyTarget) : ''}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ year: new Date().getFullYear(), month: 1, monthlyTarget: 0 });
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Huỷ
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
            >
              {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>

        {/* Table danh sách target */}
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Năm</th>
                <th className="px-4 py-2 text-left">Tháng</th>
                <th className="px-4 py-2 text-left">Target tháng</th>
                <th className="px-4 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {targets.map(target => (
                <tr key={target.id} className="border-t">
                  <td className="px-4 py-2">{target.year}</td>
                  <td className="px-4 py-2">{target.month}</td>
                  <td className="px-4 py-2">{formatVND(target.monthlyTarget)}
                    
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(target)}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(target.id)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {targets.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                    Chưa có target nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}