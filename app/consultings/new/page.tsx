'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Combobox } from "@headlessui/react";

type CustomerOption = { id: string; fullName: string; phone: string };
type StaffOption = { id: string; fullName: string };

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

  const [customerQuery, setCustomerQuery] = useState("");
  const [staffQuery, setStaffQuery] = useState("");

  const [form, setForm] = useState<ConsultingForm>({
    customerId: '',
    staffid: '',
    Content: ''
  });

  // Load customers and staffs
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);

    fetch('/api/staffs')
      .then(res => res.json())
      .then(setStaffs);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const selectedCustomer = customers.find(c => c.id === form.customerId);
  const selectedStaff = staffs.find(s => s.id === form.staffid);

  const filteredCustomers = customerQuery === ""
    ? customers
    : customers.filter(c =>
        c.fullName.toLowerCase().includes(customerQuery.toLowerCase()) ||
        c.phone.includes(customerQuery)
      );

  const filteredStaffs = staffQuery === ""
    ? staffs
    : staffs.filter(s =>
        s.fullName.toLowerCase().includes(staffQuery.toLowerCase())
      );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/consultings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Failed to create consulting');

      router.push('/consultings');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi tạo buổi tư vấn');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Create New Consulting
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

        {/* Customer Combobox */}
        <div>
          <label className="block mb-1">Customer *</label>
          <Combobox
            value={selectedCustomer || null}
            onChange={(customer: CustomerOption | null) =>
              setForm(prev => ({ ...prev, customerId: customer?.id ?? '' }))
            }
          >
            <div className="relative">
              <Combobox.Input
                className="w-full border px-2 py-1 rounded"
                displayValue={(c: CustomerOption) =>
                  c ? `${c.fullName} (${c.phone})` : ""
                }
                onChange={(e) => setCustomerQuery(e.target.value)}
                placeholder="Search customer..."
                required
              />
              <Combobox.Options className="absolute z-10 w-full border mt-1 max-h-60 overflow-y-auto bg-white rounded shadow">
                {filteredCustomers.length === 0 ? (
                  <div className="px-2 py-1 text-gray-500">No customers found</div>
                ) : (
                  filteredCustomers.map(c => (
                    <Combobox.Option
                      key={c.id}
                      value={c}
                      className={({ active }) =>
                        `px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""}`
                      }
                    >
                      {c.fullName} ({c.phone})
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* Staff Combobox */}
        <div>
          <label className="block mb-1">Staff *</label>
          <Combobox
            value={selectedStaff || null}
            onChange={(staff: StaffOption | null) =>
              setForm(prev => ({ ...prev, staffid: staff?.id ?? '' }))
            }
          >
            <div className="relative">
              <Combobox.Input
                className="w-full border px-2 py-1 rounded"
                displayValue={(s: StaffOption) => s ? s.fullName : ""}
                onChange={(e) => setStaffQuery(e.target.value)}
                placeholder="Search staff..."
                required
              />
              <Combobox.Options className="absolute z-10 w-full border mt-1 max-h-60 overflow-y-auto bg-white rounded shadow">
                {filteredStaffs.length === 0 ? (
                  <div className="px-2 py-1 text-gray-500">No staffs found</div>
                ) : (
                  filteredStaffs.map(s => (
                    <Combobox.Option
                      key={s.id}
                      value={s}
                      className={({ active }) =>
                        `px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""}`
                      }
                    >
                      {s.fullName}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* Content */}
        <div>
          <label className="block mb-1">Content</label>
          <textarea
            name="Content"
            value={form.Content}
            onChange={handleChange}
            rows={4}
            className="w-full border px-2 py-1 rounded"
          />
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