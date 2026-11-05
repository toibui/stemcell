'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type BarcodeStatus = 'NOT_DUE' | 'NOT_ATTACHED' | 'ATTACHED';

type BirthTrackingForm = {
  id: string;
  contractId?: string;
  edd?: string;
  actualBirthAt?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  birthType?: string;
  babiesCount?: number;
  barcodeStatus: BarcodeStatus;
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

  return 40 - Math.floor(diffDays / 7);
}

export default function EditBirthTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [birthTracking, setBirthTracking] =
    useState<BirthTrackingForm | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/births/${id}`);
        if (!res.ok) throw new Error('BirthTracking not found');

        const data = await res.json();

        setBirthTracking({
          ...data,
          edd: data.edd
            ? new Date(data.edd).toISOString().slice(0, 10)
            : undefined,
          actualBirthAt: data.actualBirthAt
            ? new Date(data.actualBirthAt).toISOString().slice(0, 10)
            : undefined
        });
      } catch (err) {
        console.error(err);
        alert('Không tìm thấy dữ liệu.');
        router.push('/birthtracking');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!birthTracking) return null;

  const gestationalWeek = calculateGestationalWeek(birthTracking.edd);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setBirthTracking(prev => {
      if (!prev) return null;

      return {
        ...prev,
        [name]: name === 'babiesCount' ? Number(value) : value
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!birthTracking) return;

    try {
      const payload = {
        ...birthTracking,
        edd: birthTracking.edd
          ? new Date(birthTracking.edd)
          : null,
        actualBirthAt: birthTracking.actualBirthAt
          ? new Date(birthTracking.actualBirthAt)
          : null,
        babiesCount: birthTracking.babiesCount
          ? Number(birthTracking.babiesCount)
          : 1
      };

      const res = await fetch(`/api/births/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }

      router.push('/birthtracking');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6">

        <h1 className="text-2xl font-bold mb-6">
          Edit Birth Tracking
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-2 gap-4">

            {/* EDD */}
            <div>
              <label className="block text-sm mb-1">
                EDD
              </label>

              <input
                type="date"
                name="edd"
                value={birthTracking.edd || ''}
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
                  ⚠ Thai ≥ 36 tuần — cần chuẩn bị barcode
                </div>
              )}

              {gestationalWeek && gestationalWeek >= 40 && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                  🚨 Thai ≥ 40 tuần — có thể sinh bất cứ lúc nào
                </div>
              )}
            </div>

            {/* Actual Birth */}
            <div>
              <label className="block text-sm mb-1">
                Actual Birth Date
              </label>

              <input
                type="date"
                name="actualBirthAt"
                value={birthTracking.actualBirthAt || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Babies */}
            <div>
              <label className="block text-sm mb-1">
                Babies Count
              </label>

              <input
                type="number"
                name="babiesCount"
                min={1}
                value={birthTracking.babiesCount || 1}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Barcode Status */}
            <div>
              <label className="block text-sm mb-1">
                Barcode Status
              </label>

              <select
                name="barcodeStatus"
                value={birthTracking.barcodeStatus}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="NOT_DUE">Chưa đến ngày</option>
                <option value="NOT_ATTACHED">Chưa dán</option>
                <option value="ATTACHED">Đã dán</option>
              </select>
            </div>

            {/* Birth Type */}
            <div>
              <label className="block text-sm mb-1">
                Birth Type
              </label>

              <select
                name="birthType"
                value={birthTracking.birthType || ''}
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
                value={birthTracking.status}
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

          <div>
            <label className="block text-sm mb-1">
              Hospital Name
            </label>

            <input
              name="hospitalName"
              value={birthTracking.hospitalName || ''}
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
              value={birthTracking.hospitalAddress || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Note
            </label>

            <textarea
              name="note"
              rows={3}
              value={birthTracking.note || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              {saving ? 'Saving...' : 'Save'}
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