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
  address?: string;
  dateOfBirth?: string;
  edd?: string;
  channelMarketingId?: string;
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
    address: '',
    dateOfBirth: '',
    edd: '',
    channelMarketingId: '',
  });

  // Load data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
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
        address: customer.address || '',
        dateOfBirth: customer.dateOfBirth
          ? customer.dateOfBirth.split('T')[0]
          : '',
        edd: customer.edd
          ? customer.edd.split('T')[0]
          : '',
        channelMarketingId: customer.channelMarketingId || '',
      });

      setLoading(false);
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
        <h1 className="text-2xl font-bold mb-6">
          Cập nhật khách hàng
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block mb-1 font-medium">
              Họ và tên *
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-medium">
              Số điện thoại *
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block mb-1 font-medium">
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block mb-1 font-medium">
              Ngày sinh
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* EDD */}
          <div>
            <label className="block mb-1 font-medium">
              Ngày dự sinh (EDD)
            </label>
            <input
              type="date"
              name="edd"
              value={form.edd}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Channel Marketing */}
          <div>
            <label className="block mb-1 font-medium">
              Nguồn marketing
            </label>
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

          {/* Buttons */}
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/customers')}
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