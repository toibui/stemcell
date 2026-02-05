'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Customer = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  status: string;
  births?: any[];
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    setCustomers(customers.filter(c => c.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <Link href="/customers/new" className="bg-blue-500 text-white px-4 py-2 rounded">New Customer</Link>
      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Status</th>
            <th>Births</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.fullName}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>{c.status}</td>
              <td>{c.births?.length || 0}</td>
              <td>
                <Link href={`/customers/${c.id}`} className="text-blue-500 mr-2">Edit</Link>
                <button onClick={() => handleDelete(c.id)} className="text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
