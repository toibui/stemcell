'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BABY_COUNT_OPTIONS, TYPE_GROUP_OPTIONS } from '@/lib/type-options';

export default function CreateTypePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(''); // thêm state price
  const [duration, setDuration] = useState(''); // thêm state duration
  const [typegroup, setTypegroup] = useState('');
  const [countbaby, setCountbaby] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          price: price ? parseFloat(price) : null, // convert string -> number
          duration: duration ? parseInt(duration) : null, // convert string -> number
          typegroup: typegroup || null,
          countbaby: countbaby || null,
        }),
      });

      if (!res.ok) throw new Error();

      router.push('/types');
    } catch {
      alert('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">
          Thêm Type
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          {/* Tên loại */}
          <div>
            <label className="block mb-1 font-medium">
              Tên loại hợp đồng *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Giá hợp đồng */}
          <div>
            <label className="block mb-1 font-medium">
              Giá hợp đồng *
            </label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              step="0.01" // nếu muốn decimal
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Số năm */}
          <div>
            <label className="block mb-1 font-medium">
              Số năm *
            </label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              required
              step="1" // nếu muốn number
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Nhóm Type</label>
            <select
              value={typegroup}
              onChange={e => setTypegroup(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Chọn nhóm Type</option>
              {TYPE_GROUP_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Số bé</label>
            <select
              value={countbaby}
              onChange={e => setCountbaby(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Chọn số bé</option>
              {BABY_COUNT_OPTIONS.map(option => (
                <option key={option} value={option}>{option === '1' ? 'Thai đơn' : 'Thai đôi'}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 md:col-span-2">
            <button
              type="button"
              onClick={() => router.push('/types')}
              className="px-4 py-2 border rounded-lg"
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}