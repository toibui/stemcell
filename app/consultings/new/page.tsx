'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type CustomerOption = {
  id: string;
  fullName: string;
  phone: string;
  edd: string | null;
  lastConsultingDate: string | null;
  lastConsultingContent: string | null;
};

type StaffOption = {
  id: string;
  fullName: string;
};

type ConsultingForm = {
  customerId: string;
  staffid: string;
  Content?: string;
};

export default function CreateConsultingPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [staffs, setStaffs] = useState<StaffOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ConsultingForm>({
    customerId: '',
    staffid: '',
    Content: ''
  });

  useEffect(() => {
    fetch('/api/consultings/need-consulting')
      .then(res => res.json())
      .then(setCustomers);

    fetch('/api/staffs')
      .then(res => res.json())
      .then(setStaffs);
  }, []);

  const selectedCustomer = customers.find(c => c.id === form.customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) {
      alert("Vui lòng chọn khách hàng");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/consultings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error();

      router.push('/consultings');
    } catch {
      alert('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Create New Consulting
      </h1>

      <div className="grid grid-cols-2 gap-8">

        {/* LEFT SIDE - CUSTOMER LIST */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Danh sách khách cần tư vấn
          </h2>

          <div className="border rounded max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Họ tên</th>
                  <th className="p-2 text-left">SĐT</th>
                  <th className="p-2 text-left">EDD</th>
                  <th className="p-2 text-left">Tư vấn gần nhất</th>
                </tr>
              </thead>

              <tbody>
                {customers.map(c => {
                  const isSelected = c.id === form.customerId;

                  return (
                    <tr
                      key={c.id}
                      onClick={() =>
                        setForm(prev => ({ ...prev, customerId: c.id }))
                      }
                      className={`cursor-pointer border-t ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-2 font-medium">
                        {c.fullName}
                        {c.lastConsultingContent && (
                          <div className="text-xs text-gray-500 italic truncate max-w-[200px]">
                            "{c.lastConsultingContent}"
                          </div>
                        )}
                      </td>

                      <td className="p-2">{c.phone}</td>

                      <td className="p-2">
                        {c.edd
                          ? new Date(c.edd).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-2">
                        {c.lastConsultingDate
                          ? new Date(c.lastConsultingDate).toLocaleDateString()
                          : "Chưa từng"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {customers.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                Không có khách cần tư vấn 🎉
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Tạo buổi tư vấn
          </h2>

          {selectedCustomer ? (
            <div className="mb-4 p-3 border rounded bg-blue-50 text-sm">
              <div className="font-semibold">
                {selectedCustomer.fullName}
              </div>
              <div>SĐT: {selectedCustomer.phone}</div>
              <div>
                EDD:{" "}
                {selectedCustomer.edd
                  ? new Date(selectedCustomer.edd).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          ) : (
            <div className="mb-4 text-gray-500 text-sm">
              Chọn khách hàng từ danh sách bên trái
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block mb-1">Staff *</label>
              <select
                className="w-full border px-2 py-2 rounded"
                value={form.staffid}
                onChange={e =>
                  setForm(prev => ({ ...prev, staffid: e.target.value }))
                }
                required
              >
                <option value="">Chọn staff</option>
                {staffs.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Content</label>
              <textarea
                value={form.Content}
                onChange={e =>
                  setForm(prev => ({ ...prev, Content: e.target.value }))
                }
                rows={4}
                className="w-full border px-2 py-2 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {saving ? "Saving..." : "Create Consulting"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}