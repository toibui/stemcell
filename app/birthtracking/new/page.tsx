'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Combobox } from '@headlessui/react';

type CustomerOption = {
  id: string;
  fullName: string;
  phone: string;
};

type BirthTrackingForm = {
  customerId: string;
  edd?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  birthType?: string;
  babiesCount: number;
  status: string;
  note?: string;
};

function calculateGestationalWeek(edd?: string) {
  if (!edd) return null;

  const eddDate = new Date(edd);
  const today = new Date();

  const diffDays = Math.floor(
    (eddDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const currentWeek = 40 - Math.floor(diffDays / 7);

  return currentWeek;
}

export default function CreateBirthTrackingPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const [form, setForm] = useState<BirthTrackingForm>({
    customerId: '',
    babiesCount: 1,
    status: 'planned',
  });

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then(setCustomers);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === 'babiesCount' ? Number(value) : value,
    }));
  };

  const selectedCustomer = customers.find(
    (c) => c.id === form.customerId
  );

  const filteredCustomers =
    query === ''
      ? customers
      : customers.filter(
          (c) =>
            c.fullName.toLowerCase().includes(query.toLowerCase()) ||
            c.phone.includes(query)
        );

  const gestationalWeek = calculateGestationalWeek(form.edd);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      const res = await fetch('/api/births', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      router.push('/birthtracking');
    } catch {
      alert('Có lỗi xảy ra khi tạo Birth Tracking');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">
          New Birth Tracking
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Customer
            </label>

            <Combobox
              value={selectedCustomer || null}
              onChange={(customer: CustomerOption | null) =>
                setForm((prev) => ({
                  ...prev,
                  customerId: customer?.id ?? '',
                }))
              }
            >
              <div className="relative">
                <Combobox.Input
                  className="w-full border rounded-lg px-3 py-2"
                  displayValue={(customer: CustomerOption) =>
                    customer
                      ? `${customer.fullName} (${customer.phone})`
                      : ''
                  }
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search customer..."
                  required
                />

                <Combobox.Options className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow max-h-60 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">
                      No customers found
                    </div>
                  ) : (
                    filteredCustomers.map((c) => (
                      <Combobox.Option
                        key={c.id}
                        value={c}
                        className={({ active }) =>
                          `px-3 py-2 cursor-pointer ${
                            active ? 'bg-blue-100' : ''
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

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* EDD */}
            <div>
              <label className="block text-sm mb-1">EDD</label>

              <input
                type="date"
                name="edd"
                value={form.edd || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />

              {gestationalWeek && (
                <div className="text-sm text-gray-500 mt-1">
                  Thai hiện tại: <b>{gestationalWeek} tuần</b>
                </div>
              )}

              {gestationalWeek && gestationalWeek >= 36 && gestationalWeek < 40 && (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded">
                  ⚠ Thai ≥ 36 tuần — cần chuẩn bị và dán barcode
                </div>
              )}

              {gestationalWeek && gestationalWeek >= 40 && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                  🚨 Thai ≥ 40 tuần — có thể sinh bất cứ lúc nào
                </div>
              )}
            </div>

            {/* Babies */}
            <div>
              <label className="block text-sm mb-1">
                Babies Count
              </label>

              <input
                type="number"
                min={1}
                name="babiesCount"
                value={form.babiesCount}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Birth Type */}
            <div>
              <label className="block text-sm mb-1">
                Birth Type
              </label>

              <select
                name="birthType"
                value={form.birthType || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select</option>
                <option value="normal">Normal</option>
                <option value="c-section">C-Section</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm mb-1">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="planned">Planned</option>
                <option value="contacted">Contacted</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Hospital */}
          <div>
            <label className="block text-sm mb-1">
              Hospital Name
            </label>

            <input
              name="hospitalName"
              value={form.hospitalName || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Hospital Address
            </label>

            <input
              name="hospitalAddress"
              value={form.hospitalAddress || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm mb-1">Note</label>

            <textarea
              name="note"
              rows={3}
              value={form.note || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              {saving ? 'Saving...' : 'Create'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/birthtracking')}
              className="border px-5 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}