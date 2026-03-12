'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [types, setTypes] = useState<TypeOption[]>([]);

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

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const [contractRes, customersRes, typesRes] = await Promise.all([
        fetch(`/api/contracts/${id}`),
        fetch('/api/customers'),
        fetch('/api/types'),
      ]);

      const contractData = await contractRes.json();
      const customerData = await customersRes.json();
      const typeData = await typesRes.json();

      setCustomers(customerData);
      setTypes(typeData);

      const type = typeData.find((t: TypeOption) => t.id === contractData.typeId);

      const price = type?.price || 0;
      const p = contractData.promote || 0;
      const final = price - p;

      setBasePrice(price);
      setPromote(p);
      setFinalPrice(final);

      setForm({
        customerId: contractData.customerId || '',
        typeId: contractData.typeId || '',
        no: contractData.no || '',
        promote: p,
        price: final,
        dateContract: contractData.dateContract
          ? contractData.dateContract.split('T')[0]
          : new Date().toISOString().split('T')[0],
      });

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const selectedCustomer = customers.find(c => c.id === form.customerId);
  const selectedType = types.find(t => t.id === form.typeId);

  const filteredCustomers = customerQuery === ""
    ? customers
    : customers.filter(c =>
        c.fullName.toLowerCase().includes(customerQuery.toLowerCase()) ||
        c.phone.includes(customerQuery)
      );

  const filteredTypes = typeQuery === ""
    ? types
    : types.filter(t =>
        t.name.toLowerCase().includes(typeQuery.toLowerCase())
      );

  // chọn gói
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

  // thay đổi promote
  const handlePromoteChange = (value: string) => {
    const p = Number(value) || 0;

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
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update contract');

      router.push('/contracts');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật hợp đồng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Cập nhật hợp đồng</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Customer */}
          <div>
            <label className="block mb-1 font-medium">Khách hàng *</label>
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
            <label className="block mb-1 font-medium">Loại hợp đồng *</label>
            <Combobox value={selectedType || null} onChange={handleTypeSelect}>
              <div className="relative">
                <Combobox.Input
                  className="w-full border px-2 py-1 rounded"
                  displayValue={(t: TypeOption) => t ? t.name : ""}
                  onChange={(e) => setTypeQuery(e.target.value)}
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
            <label className="block mb-1 font-medium">Giá gốc</label>
            <input
              value={formatMoney(basePrice)}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Khuyến mại */}
          <div>
            <label className="block mb-1 font-medium">Khuyến mại</label>
            <input
              type="number"
              value={promote}
              onChange={(e) => handlePromoteChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Thành tiền */}
          <div>
            <label className="block mb-1 font-medium">Thành tiền</label>
            <input
              value={formatMoney(finalPrice)}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-green-50 font-semibold"
            />
          </div>

          {/* Contract No */}
          <div>
            <label className="block mb-1 font-medium">Mã hợp đồng</label>
            <input
              type="text"
              name="no"
              value={form.no}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block mb-1 font-medium">Ngày hợp đồng</label>
            <input
              type="date"
              name="dateContract"
              value={form.dateContract}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/contracts')}
              className="px-4 py-2 border rounded-lg"
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
            >
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}