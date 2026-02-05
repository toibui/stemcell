'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Customer = {
  fullName: string;
  phone: string;
  email?: string;
  status: string;
};

export default function CreateCustomerPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>({
    fullName: '',
    phone: '',
    email: '',
    status: 'Chờ tư vấn', // default
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });

      if (!res.ok) {
        throw new Error('Failed to create customer');
      }

      router.push('/customers'); // quay lại danh sách sau khi tạo
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tạo khách hàng.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Customer</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={customer.fullName}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={customer.phone}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={customer.email}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select
            name="status"
            value={customer.status}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="Chờ tư vấn">Chờ tư vấn</option>
            <option value="Đã tư vấn, Khách hàng từ chối">Đã tư vấn, Khách hàng từ chối</option>
            <option value="Đã tư vấn, chưa ký hợp đồng">Đã tư vấn, chưa ký hợp đồng</option>
            <option value="Đã ký hợp đồng">Đã ký hợp đồng</option>
            <option value="Đang theo dõi sinh">Đang theo dõi sinh</option>
            <option value="Đang xử lý mẫu">Đang xử lý mẫu</option>
            <option value="Mẫu đã lưu trữ">Mẫu đã lưu trữ</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {saving ? 'Saving...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
