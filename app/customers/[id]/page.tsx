'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

type Customer = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  status: string;
  births?: any[];
};

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams(); // Lấy id từ route params
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/customers/${id}`)
      .then(res => res.json())
      .then(data => {
        setCustomer(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    setSaving(false);
    router.push('/customers'); // quay lại trang danh sách
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Customer</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={customer.fullName}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
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
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={customer.email || ''}
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
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
