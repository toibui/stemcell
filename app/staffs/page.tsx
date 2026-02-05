'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Staff = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  role: string;
  isActive: boolean;
};

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    fetch('/api/staffs')
      .then(res => res.json())
      .then(setStaffList);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff?')) return;
    await fetch(`/api/staffs/${id}`, { method: 'DELETE' });
    setStaffList(staffList.filter(s => s.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Staff</h1>
      <Link
        href="/staffs/new"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        New Staff
      </Link>

      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Active</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map(s => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="p-2 border">{s.fullName}</td>
              <td className="p-2 border">{s.phone || '-'}</td>
              <td className="p-2 border">{s.email || '-'}</td>
              <td className="p-2 border">{s.role}</td>
              <td className="p-2 border">{s.isActive ? 'Yes' : 'No'}</td>
              <td className="p-2 border">
                <Link
                  href={`/staffs/${s.id}`}
                  className="text-blue-500 mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
