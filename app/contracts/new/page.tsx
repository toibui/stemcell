'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Combobox } from "@headlessui/react";

type CustomerOption = { id: string; fullName: string; phone: string };

type TypeOption = {
  id: string;
  name: string;
  price: number;
};

type ContractForm = {
  customerId: string;
  typeId: string;
  no?: string;
  dateContract?: string;
  promote?: number;
  price?: number;
};

export default function CreateContractPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [types, setTypes] = useState<TypeOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [customerQuery, setCustomerQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");

  const [basePrice, setBasePrice] = useState(0);
  const [promote, setPromote] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const [form, setForm] = useState<ContractForm>({
    customerId: '',
    typeId: '',
    no: '',
    dateContract: new Date().toISOString().split('T')[0],
    promote: 0,
    price: 0
  });

  // Load data
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);

    fetch('/api/types')
      .then(res => res.json())
      .then(setTypes);
  }, []);

  const selectedCustomer = customers.find(c => c.id === form.customerId);
  const selectedType = types.find(t => t.id === form.typeId);

  const filteredCustomers =
    customerQuery === ""
      ? customers
      : customers.filter(c =>
          c.fullName.toLowerCase().includes(customerQuery.toLowerCase()) ||
          c.phone.includes(customerQuery)
        );

  const filteredTypes =
    typeQuery === ""
      ? types
      : types.filter(t =>
          t.name.toLowerCase().includes(typeQuery.toLowerCase())
        );

  // Chọn gói
  const handleTypeSelect = (t: TypeOption | null) => {
    const price = t?.price ?? 0;

    const final = price - promote;

    setBasePrice(price);
    setFinalPrice(final);

    setForm(prev => ({
      ...prev,
      typeId: t?.id ?? '',
      price: final
    }));
  };

  // Nhập khuyến mại
  const handlePromoteChange = (value: string) => {
    let p = Number(value) || 0;

    if (p > basePrice) p = basePrice;

    const final = basePrice - p;

    setPromote(p);
    setFinalPrice(final);

    setForm(prev => ({
      ...prev,
      promote: p,
      price: final
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatMoney = (money?: number) =>
    money?.toLocaleString('vi-VN') + ' đ';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          promote,
          price: finalPrice
        })
      });

      if (!res.ok) throw new Error('Failed to create contract');

      router.push('/contracts');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi tạo hợp đồng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Contract</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

        {/* Customer */}
        <div>
          <label className="block mb-1">Customer *</label>

          <Combobox
            value={selectedCustomer || null}
            onChange={(c: CustomerOption | null) =>
              setForm(prev => ({ ...prev, customerId: c?.id ?? '' }))
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

                {filteredCustomers.map(c => (
                  <Combobox.Option
                    key={c.id}
                    value={c}
                    className={({ active }) =>
                      `px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""}`
                    }
                  >
                    {c.fullName} ({c.phone})
                  </Combobox.Option>
                ))}

              </Combobox.Options>

            </div>
          </Combobox>
        </div>

        {/* Type */}
        <div>
          <label className="block mb-1">Contract Type *</label>

          <Combobox value={selectedType || null} onChange={handleTypeSelect}>
            <div className="relative">

              <Combobox.Input
                className="w-full border px-2 py-1 rounded"
                displayValue={(t: TypeOption) => t ? t.name : ""}
                onChange={(e) => setTypeQuery(e.target.value)}
                placeholder="Search type..."
                required
              />

              <Combobox.Options className="absolute z-10 w-full border mt-1 max-h-60 overflow-y-auto bg-white rounded shadow">

                {filteredTypes.map(t => (
                  <Combobox.Option
                    key={t.id}
                    value={t}
                    className={({ active }) =>
                      `px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""}`
                    }
                  >
                    {t.name} - {formatMoney(t.price)}
                  </Combobox.Option>
                ))}

              </Combobox.Options>

            </div>
          </Combobox>
        </div>

        {/* Giá gốc */}
        <div>
          <label className="block mb-1">Giá gốc</label>
          <input
            value={formatMoney(basePrice)}
            readOnly
            className="w-full border px-2 py-1 rounded bg-gray-100"
          />
        </div>

        {/* Khuyến mại */}
        <div>
          <label className="block mb-1">Khuyến mại</label>
          <input
            type="number"
            value={promote}
            onChange={(e) => handlePromoteChange(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Thành tiền */}
        <div>
          <label className="block mb-1">Thành tiền</label>
          <input
            value={formatMoney(finalPrice)}
            readOnly
            className="w-full border px-2 py-1 rounded bg-green-50 font-semibold"
          />
        </div>

        {/* Contract No */}
        <div>
          <label className="block mb-1">Contract No</label>
          <input
            type="text"
            name="no"
            value={form.no}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Date Contract */}
        <div>
          <label className="block mb-1">Contract Date</label>
          <input
            type="date"
            name="dateContract"
            value={form.dateContract}
            onChange={handleChange}
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