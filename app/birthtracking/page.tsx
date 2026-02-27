'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type BirthTracking = {
  id: string;
  customer: {
    id: string;
    fullName: string;
    phone: string;
  };
  edd?: string;
  actualBirthDate?: string;
  hospitalName?: string;
  birthType?: string;
  babiesCount: number;
  status: string;
};

export default function BirthTrackingPage() {
  const [births, setBirths] = useState<BirthTracking[]>([]);

  useEffect(() => {
    fetch('/api/births')
      .then(res => res.json())
      .then(setBirths);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    await fetch(`/api/births/${id}`, {
      method: 'DELETE'
    });

    setBirths(births.filter(b => b.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Birth Tracking</h1>

      <Link
        href="/birthtracking/new"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        New Birth Tracking
      </Link>

      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Customer</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">EDD</th>
            <th className="border px-2 py-1">Birth Date</th>
            <th className="border px-2 py-1">Hospital</th>
            <th className="border px-2 py-1">Babies</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>

        <tbody>
          {births.map(b => (
            <tr key={b.id} className="border-t">
              <td className="px-2 py-1">{b.customer.fullName}</td>
              <td className="px-2 py-1">{b.customer.phone}</td>
              <td className="px-2 py-1">
                {b.edd ? new Date(b.edd).toLocaleDateString() : '-'}
              </td>
              <td className="px-2 py-1">
                {b.actualBirthDate
                  ? new Date(b.actualBirthDate).toLocaleDateString()
                  : '-'}
              </td>
              <td className="px-2 py-1">{b.hospitalName || '-'}</td>
              <td className="px-2 py-1 text-center">{b.babiesCount}</td>
              <td className="px-2 py-1">{b.status}</td>
              <td className="px-2 py-1">
                <Link
                  href={`/birthtracking/${b.id}`}
                  className="text-blue-500 mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {births.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                No birth tracking records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
