'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
  // --- Thêm 3 trường mới ---
  idno?: string;
  iddate?: string;
  idplace?: string;
};

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
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
    idno: '',
    iddate: '',
    idplace: '',
  });

  // Load data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [customerRes, channelRes] = await Promise.all([
          fetch(`/api/customers/${id}`),
          fetch('/api/channel-marketing'),
        ]);

        const customer = await customerRes.json();
        const channelData = await channelRes.json();

        setChannels(channelData);

        setForm({
          fullName: customer.fullName || '',
          phone: customer.phone || '',
          email: customer.email || '',
          pid: customer.pid || '',
          address: customer.address || '',
          dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
          edd: customer.edd ? customer.edd.split('T')[0] : '',
          channelMarketingId: customer.channelMarketingId || '',
          // --- Gán giá trị cũ cho 3 trường mới ---
          idno: customer.idno || '',
          iddate: customer.iddate ? customer.iddate.split('T')[0] : '',
          idplace: customer.idplace || '',
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          email: form.email || null,
          address: form.address || null,
          dateOfBirth: form.dateOfBirth || null,
          edd: form.edd || null,
          pid: form.pid || null,
          // Cập nhật giá trị mới gửi lên API
          iddate: form.iddate || null,
          idno: form.idno || null,
          idplace: form.idplace || null,
          channelMarketingId: form.channelMarketingId || null,
        }),
      });

      if (!res.ok) throw new Error();

      router.push('/customers');
    } catch {
      alert('Có lỗi xảy ra khi cập nhật khách hàng.');
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
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Cập nhật khách hàng
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* --- KHU VỰC THÔNG TIN ĐỊNH DANH (MỚI) --- */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
            <p className="font-semibold text-gray-700 text-sm uppercase">Định danh cá nhân</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-600">Số CMND/CCCD</label>
                <input
                  type="text"
                  name="idno"
                  value={form.idno}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-600">Ngày cấp</label>
                <input
                  type="date"
                  name="iddate"
                  value={form.iddate}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-600">Nơi cấp</label>
              <input
                type="text"
                name="idplace"
                value={form.idplace}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-600">PID</label>
              <input
                type="text"
                name="pid"
                value={form.pid}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-600">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-600">Ngày sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-600">Ngày dự sinh (EDD)</label>
              <input
                type="date"
                name="edd"
                value={form.edd}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-600">Nguồn marketing</label>
            <select
              name="channelMarketingId"
              value={form.channelMarketingId}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Chọn nguồn --</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-6 flex justify-end space-x-3 border-t">
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
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow disabled:opacity-50 transition"
            >
              {saving ? 'Đang lưu...' : 'Cập nhật khách hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}