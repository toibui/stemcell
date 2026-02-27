'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type CustomerOption = {
  id: string;
  fullName: string;
  phone: string;
};

type BirthTrackingForm = {
  id: string;
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

export default function EditBirthTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [birth, setBirth] = useState<BirthTrackingForm | null>(null);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/births/${id}`).then(res => res.json()),
      fetch('/api/customers').then(res => res.json())
    ]).then(([birthData, customersData]) => {

      let datePart = '';
      let timePart = '';

      if (birthData.actualBirthAt) {
        const dt = new Date(birthData.actualBirthAt);
        datePart = dt.toISOString().split('T')[0];
        timePart = dt.toISOString().substring(11, 16);
      }

      setBirth({
        ...birthData,
        edd: birthData.edd?.split('T')[0] ?? '',
        actualBirthDate: datePart,
        actualBirthTime: timePart
      });

      setCustomers(customersData);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!birth) return <div>BirthTracking not found</div>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBirth(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // ✅ Gộp date + time thành actualBirthAt
    let actualBirthAt: string | null = null;

    if (birth.actualBirthDate) {
      actualBirthAt = birth.actualBirthTime
        ? new Date(`${birth.actualBirthDate}T${birth.actualBirthTime}`).toISOString()
        : new Date(birth.actualBirthDate).toISOString();
    }

    await fetch(`/api/births/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: birth.customerId,
        edd: birth.edd || null,
        actualBirthAt,
        hospitalName: birth.hospitalName,
        hospitalAddress: birth.hospitalAddress,
        birthType: birth.birthType,
        babiesCount: Number(birth.babiesCount),
        status: birth.status,
        note: birth.note
      })
    });

    setSaving(false);
    router.push('/birthtracking');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Birth Tracking</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

        <div>
          <label className="block mb-1">Customer</label>
          <select
            name="customerId"
            value={birth.customerId}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">EDD</label>
          <input
            type="date"
            name="edd"
            value={birth.edd || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Actual Birth Date</label>
          <input
            type="date"
            name="actualBirthDate"
            value={birth.actualBirthDate || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Actual Birth Time</label>
          <input
            type="time"
            name="actualBirthTime"
            value={birth.actualBirthTime || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Hospital Name</label>
          <input
            type="text"
            name="hospitalName"
            value={birth.hospitalName || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Hospital Address</label>
          <input
            type="text"
            name="hospitalAddress"
            value={birth.hospitalAddress || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Birth Type</label>
          <input
            type="text"
            name="birthType"
            value={birth.birthType || ''}
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
            value={birth.babiesCount}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Status</label>
          <select
            name="status"
            value={birth.status}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="planned">Planned</option>
            <option value="contacted">Contacted</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Note</label>
          <textarea
            name="note"
            value={birth.note || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            rows={3}
          />
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