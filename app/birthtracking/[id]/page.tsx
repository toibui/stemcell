'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type BirthTrackingForm = {
  id: string;
  contractId?: string;
  edd?: string; // ISO date string
  actualBirthAt?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  birthType?: string;
  babiesCount?: number;
  status: string;
  note?: string;
};

export default function EditBirthTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [birthTracking, setBirthTracking] = useState<BirthTrackingForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/births/${id}`);
        if (!res.ok) throw new Error("BirthTracking not found");
        const data = await res.json();
        // Convert DateTimes to ISO strings for input
        setBirthTracking({
          ...data,
          edd: data.edd ? new Date(data.edd).toISOString().slice(0, 10) : undefined,
          actualBirthAt: data.actualBirthAt ? new Date(data.actualBirthAt).toISOString().slice(0, 10) : undefined
        });
      } catch (err) {
        console.error(err);
        alert("Không tìm thấy dữ liệu.");
        router.push('/birthtracking');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!birthTracking) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBirthTracking(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/births/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthTracking)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Update failed");
      }

      router.push('/birthtracking');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Có lỗi xảy ra khi cập nhật dữ liệu sinh.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Edit Birth Tracking
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

        {/* Hospital Name */}
        <div>
          <label className="block mb-1">Hospital Name</label>
          <input
            name="hospitalName"
            value={birthTracking.hospitalName || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            placeholder="Hospital Name"
          />
        </div>

        {/* Hospital Address */}
        <div>
          <label className="block mb-1">Hospital Address</label>
          <input
            name="hospitalAddress"
            value={birthTracking.hospitalAddress || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            placeholder="Hospital Address"
          />
        </div>

        {/* EDD */}
        <div>
          <label className="block mb-1">Estimated Delivery Date (EDD)</label>
          <input
            type="date"
            name="edd"
            value={birthTracking.edd || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Actual Birth */}
        <div>
          <label className="block mb-1">Actual Birth Date</label>
          <input
            type="date"
            name="actualBirthAt"
            value={birthTracking.actualBirthAt || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Birth Type */}
        <div>
          <label className="block mb-1">Birth Type</label>
          <input
            name="birthType"
            value={birthTracking.birthType || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            placeholder="Birth Type"
          />
        </div>

        {/* Babies Count */}
        <div>
          <label className="block mb-1">Babies Count</label>
          <input
            type="number"
            name="babiesCount"
            value={birthTracking.babiesCount || 1}
            min={1}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1">Status</label>
          <select
            name="status"
            value={birthTracking.status}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="PLANNED">Planned</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block mb-1">Note</label>
          <textarea
            name="note"
            value={birthTracking.note || ''}
            onChange={handleChange}
            rows={4}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}