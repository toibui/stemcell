'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type TargetForm = {
  year: number;
  month: number;
  monthlyTarget: number;
};

export default function EditTargetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TargetForm>({
    year: new Date().getFullYear(),
    month: 1,
    monthlyTarget: 0,
  });

  // Load target data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const res = await fetch(`/api/targets/${id}`);
      const target = await res.json();

      setForm({
        year: target.year,
        month: target.month,
        monthlyTarget: Number(target.monthlyTarget),
      });

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/targets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      router.push('/targets');
    } catch {
      alert('Có lỗi xảy ra khi cập nhật target.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Cập nhật Target</h1>

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
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
            >
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}