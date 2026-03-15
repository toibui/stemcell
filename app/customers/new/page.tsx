'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ChannelMarketing = {
  id: string;
  name: string;
};

type CustomerForm = {
  fullName: string;
  phone: string;
  email?: string;
  pid?: string;
  address?: string;
  dateOfBirth?: string;
  edd?: string;
  channelMarketingId?: string;
  // --- Thêm 3 trường mới vào Type ---
  idno?: string;
  iddate?: string;
  idplace?: string;
};

export default function CreateCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [channels, setChannels] = useState<ChannelMarketing[]>([]);

  const [form, setForm] = useState<CustomerForm>({
    fullName: '',
    phone: '',
    email: '',
    pid: '',
    address: '',
    dateOfBirth: '',
    edd: '',
    channelMarketingId: '',
    // --- Khởi tạo giá trị mặc định ---
    idno: '',
    iddate: '',
    idplace: '',
  });

  useEffect(() => {
    fetch('/api/channel-marketing')
      .then(res => res.json())
      .then(setChannels);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dateOfBirth: form.dateOfBirth || null,
          edd: form.edd || null,
          // Ép kiểu ngày cho iddate
          iddate: form.iddate || null, 
          channelMarketingId: form.channelMarketingId || null,
        }),
      });

      if (!res.ok) throw new Error();

      router.push('/customers');
    } catch {
      alert('Có lỗi xảy ra khi tạo khách hàng.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">
          Thêm khách hàng mới
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grid Layout cho Họ tên và Số điện thoại */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Số điện thoại *</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* --- KHU VỰC THÊM MỚI: Định danh cá nhân --- */}
          <div className="p-4 bg-blue-50 rounded-lg space-y-4">
            <p className="font-semibold text-blue-700 text-sm uppercase tracking-wider">Thông tin định danh</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-sm">Số CMND/CCCD/Hộ chiếu</label>
                <input
                  type="text"
                  name="idno"
                  value={form.idno}
                  onChange={handleChange}
                  placeholder="Nhập số định danh"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Ngày cấp</label>
                <input
                  type="date"
                  name="iddate"
                  value={form.iddate}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm">Nơi cấp</label>
              <input
                type="text"
                name="idplace"
                value={form.idplace}
                onChange={handleChange}
                placeholder="Ví dụ: Cục Cảnh sát QLHC về trật tự xã hội"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* ------------------------------------------ */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block mb-1 font-medium text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm">PID</label>
              <input
                type="text"
                name="pid"
                value={form.pid}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-sm">Ngày sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm">Ngày dự sinh (EDD)</label>
              <input
                type="date"
                name="edd"
                value={form.edd}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Nguồn marketing</label>
            <select
              name="channelMarketingId"
              value={form.channelMarketingId}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn nguồn --</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t">
            <button
              type="button"
              onClick={() => router.push('/customers')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md disabled:opacity-50 transition"
            >
              {saving ? 'Đang lưu...' : 'Tạo khách hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}