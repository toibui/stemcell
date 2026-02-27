'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Combobox } from "@headlessui/react";

type CustomerOption = {
  id: string;
  fullName: string;
  phone: string;
};

type BirthTrackingForm = {
  customerId: string;
  edd?: string;
  actualBirthDate?: string;
  actualBirthTime?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  birthType?: string;
  babiesCount: number;
  status: string;
  note?: string;
};

export default function CreateBirthTrackingPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<BirthTrackingForm>({
    customerId: '',
    babiesCount: 1,
    status: 'planned'
  });

  // Load customers
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'babiesCount' ? Number(value) : value
    }));
  };

  const selectedCustomer = customers.find(
    c => c.id === form.customerId
  );

  const filteredCustomers =
    query === ""
      ? customers
      : customers.filter(c =>
          c.fullName.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query)
        );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/births', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        throw new Error('Failed to create birth tracking');
      }

      router.push('/birthtracking');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi tạo Birth Tracking');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Create New Birth Tracking
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

        {/* Customer Combobox */}
        <div>
          <label className="block mb-1">Customer</label>

            <Combobox
              value={selectedCustomer || null}
              onChange={(customer: CustomerOption | null) =>
                setForm(prev => ({
                  ...prev,
                  customerId: customer?.id ?? ''
                }))
              }
            >
            <div className="relative">
              <Combobox.Input
                className="w-full border px-2 py-1 rounded"
                displayValue={(customer: CustomerOption) =>
                  customer
                    ? `${customer.fullName} (${customer.phone})`
                    : ""
                }
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer..."
                required
              />

              <Combobox.Options className="absolute z-10 w-full border mt-1 max-h-60 overflow-y-auto bg-white rounded shadow">
                {filteredCustomers.length === 0 ? (
                  <div className="px-2 py-1 text-gray-500">
                    No customers found
                  </div>
                ) : (
                  filteredCustomers.map(c => (
                    <Combobox.Option
                      key={c.id}
                      value={c}
                      className={({ active }) =>
                        `px-2 py-1 cursor-pointer ${
                          active ? "bg-blue-100" : ""
                        }`
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

        {/* Các field còn lại giữ nguyên */}

        <div>
          <label className="block mb-1">EDD</label>
          <input
            type="date"
            name="edd"
            value={form.edd || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Babies Count</label>
          <input
            type="number"
            min={1}
            name="babiesCount"
            value={form.babiesCount}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="planned">Planned</option>
            <option value="contacted">Contacted</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
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