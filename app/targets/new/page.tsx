'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTargetPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: 1,
    monthlyTarget: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      router.push('/targets'); // Quay về danh sách target
    } catch {
      alert('Có lỗi xảy ra khi tạo target.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Thêm Target mới</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Năm */}
          <div>
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

          {/* Tháng */}
          <div>
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

          {/* Target tháng */}
          <div>
            <label className="block mb-1 font-medium">Target tháng *</label>
            <input
              type="number"
              name="monthlyTarget"
              value={form.monthlyTarget}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/targets')}
              className="px-4 py-2 border rounded-lg"
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
            >
              {saving ? 'Đang lưu...' : 'Tạo Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}