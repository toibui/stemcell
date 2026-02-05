'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Staff = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  role: string;
  isActive: boolean;
};
const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'administration', label: 'Hành chính' },
  { value: 'collection', label: 'Thu mẫu' },
  { value: 'processing', label: 'Xử lý' },
  { value: 'quality_control', label: 'Kiểm tra chất lượng' },
  { value: 'storage', label: 'Lưu trữ' },
];
export default function EditStaffPage() {
  const router = useRouter();
  const { id } = useParams(); // Lấy id từ route params
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/staffs/${id}`)
      .then(res => res.json())
      .then(data => {
        setStaff(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!staff) return <div>Staff not found</div>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const name = target.name;

    let value: string | boolean;
    if (target instanceof HTMLInputElement) {
      value = target.type === 'checkbox' ? target.checked : target.value;
    } else {
      value = target.value; // select
    }

    setStaff(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/staffs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff),
      });

      if (!res.ok) {
        throw new Error('Failed to update staff');
      }

      router.push('/staffs'); // quay lại danh sách staff
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi cập nhật nhân viên.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Staff</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {/* Full Name */}
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={staff.fullName}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={staff.phone || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={staff.email || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Role */}
        <select name="role" value={staff.role} onChange={handleChange} className="w-full border px-2 py-1 rounded">
            {roleOptions.map(r => (
                <option key={r.value} value={r.value}>
                {r.label}
                </option>
            ))}
        </select>

        {/* Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={staff.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label>Active</label>
        </div>

        {/* Submit */}
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
