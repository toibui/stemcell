'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Customer = { id: string; fullName: string };
type Staff = { id: string; fullName: string };

type ConsultingForm = {
  customerId: string;
  staffid: string;
  Content?: string;
};

export default function EditConsultingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [form, setForm] = useState<ConsultingForm>({
    customerId: '',
    staffid: '',
    Content: '',
  });

  // Load data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const [consultingRes, customersRes, staffsRes] = await Promise.all([
        fetch(`/api/consultings/${id}`),
        fetch('/api/customers'),
        fetch('/api/staffs'),
      ]);

      const consulting = await consultingRes.json();
      const customerData = await customersRes.json();
      const staffData = await staffsRes.json();

      setCustomers(customerData);
      setStaffs(staffData);

      setForm({
        customerId: consulting.customerId || '',
        staffid: consulting.staffid || '',
        Content: consulting.Content || '',
      });

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/consultings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      router.push('/consultings');
    } catch {
      alert('Có lỗi xảy ra khi cập nhật buổi tư vấn.');
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
        <h1 className="text-2xl font-bold mb-6">Cập nhật buổi tư vấn</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer */}
          <div>
            <label className="block mb-1 font-medium">Khách hàng *</label>
            <select
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Staff */}
          <div>
            <label className="block mb-1 font-medium">Nhân viên *</label>
            <select
              name="staffid"
              value={form.staffid}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Chọn nhân viên --</option>
              {staffs.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block mb-1 font-medium">Nội dung</label>
            <textarea
              name="Content"
              value={form.Content}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/consultings')}
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