'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { BABY_COUNT_OPTIONS, TYPE_GROUP_OPTIONS } from '@/lib/type-options';

type CustomerOption = { id: string; fullName: string; phone: string };

type TypeOption = {
  id: string;
  name: string;
  price: number;
  typegroup: string | null;
  countbaby: string | null;
};

type OutsideOption = {
  id: string;
  name: string;
  price: number | string;
  description: string | null;
};

type ContractForm = {
  customerId: string;
  typeId: string;
  no?: string;
  dateContract?: string;
  promote?: number;
  price?: number;
  isOutside: boolean;
  outsideId: string;
};

export default function CreateContractPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [types, setTypes] = useState<TypeOption[]>([]);
  const [outsides, setOutsides] = useState<OutsideOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [customerQuery, setCustomerQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");
  const [babyCountFilter, setBabyCountFilter] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");

  const [basePrice, setBasePrice] = useState(0);
  const [promote, setPromote] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const [form, setForm] = useState<ContractForm>({
    customerId: '',
    typeId: '',
    no: '',
    dateContract: new Date().toISOString().split('T')[0],
    promote: 0,
    price: 0,
    isOutside: false,
    outsideId: ''
  });

  // Load data
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);

    fetch('/api/types')
      .then(res => res.json())
      .then(setTypes);

    fetch('/api/outsides')
      .then(res => res.json())
      .then(setOutsides);
  }, []);

  const selectedCustomer = customers.find(c => c.id === form.customerId);
  const selectedType = types.find(t => t.id === form.typeId);
  const selectedOutside = outsides.find(outside => outside.id === form.outsideId);
  const serviceTypeOptions = [...new Set([
    ...TYPE_GROUP_OPTIONS,
    ...types.map(type => type.typegroup).filter((value): value is string => Boolean(value))
  ])];
  const totalPrice =
    finalPrice + (form.isOutside ? Number(selectedOutside?.price ?? 0) : 0);

  const filteredCustomers =
    customerQuery === ""
      ? customers
      : customers.filter(c =>
          c.fullName.toLowerCase().includes(customerQuery.toLowerCase()) ||
          c.phone.includes(customerQuery)
        );

  const filteredTypes =
    types.filter(t =>
      (!babyCountFilter || t.countbaby === babyCountFilter) &&
      (!serviceTypeFilter || t.typegroup === serviceTypeFilter) &&
      (!typeQuery ||
        t.name.toLowerCase().includes(typeQuery.toLowerCase()) ||
        t.typegroup?.toLowerCase().includes(typeQuery.toLowerCase()) ||
        t.countbaby?.includes(typeQuery))
    );

  const clearSelectedType = () => {
    setTypeQuery('');
    setBasePrice(0);
    setPromote(0);
    setFinalPrice(0);
    setForm(prev => ({ ...prev, typeId: '', promote: 0, price: 0 }));
  };

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

      if (!res.ok) throw new Error('Failed');

      router.push('/contracts');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi tạo hợp đồng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tạo hợp đồng</h1>
          <p className="mt-1 text-sm text-slate-500">Chọn khách hàng, thai kỳ và gói dịch vụ để lập hợp đồng.</p>
        </div>

      <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-7">

        {/* CUSTOMER */}
        <div>
          <label className="block mb-1 font-medium">Khách hàng *</label>

          <Combobox
            value={selectedCustomer || null}
            onChange={(c: CustomerOption | null) =>
              setForm(prev => ({ ...prev, customerId: c?.id ?? '' }))
            }
          >
            <div className="relative">

              <div className="relative">
                <Combobox.Input
                  className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                  displayValue={(c: CustomerOption) =>
                    c ? `${c.fullName} (${c.phone})` : ""
                  }
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  placeholder="Tìm khách hàng..."
                />

                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </Combobox.Button>
              </div>

              <Combobox.Options className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">

                {filteredCustomers.length === 0 ? (
                  <div className="p-2 text-gray-500 text-sm">
                    Không tìm thấy
                  </div>
                ) : (
                  filteredCustomers.map(c => (
                    <Combobox.Option
                      key={c.id}
                      value={c}
                      className={({ active }) =>
                        `px-3 py-2 cursor-pointer flex justify-between ${
                          active ? 'bg-blue-100' : ''
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div>
                            <div className="font-medium">{c.fullName}</div>
                            <div className="text-xs text-gray-500">{c.phone}</div>
                          </div>
                          {selected && <CheckIcon className="h-5 w-5 text-blue-600" />}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}

              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* TYPE */}
        <div>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="contract-baby-filter" className="mb-1 block text-sm font-medium">Số thai</label>
              <select
                id="contract-baby-filter"
                value={babyCountFilter}
                onChange={event => {
                  setBabyCountFilter(event.target.value);
                  clearSelectedType();
                }}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Tất cả</option>
                {BABY_COUNT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option === '1' ? 'Thai đơn' : 'Thai đôi'}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contract-service-filter" className="mb-1 block text-sm font-medium">Loại dịch vụ</label>
              <select
                id="contract-service-filter"
                value={serviceTypeFilter}
                onChange={event => {
                  setServiceTypeFilter(event.target.value);
                  clearSelectedType();
                }}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Tất cả dịch vụ</option>
                {serviceTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="mb-1 block font-medium">Gói lưu trữ *</label>

          <Combobox value={selectedType || null} onChange={handleTypeSelect}>
            <div className="relative">

              <div className="relative">
                <Combobox.Input
                  className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                  displayValue={(t: TypeOption) => t ? t.name : ""}
                  onChange={(e) => setTypeQuery(e.target.value)}
                  placeholder="Tìm gói..."
                />

                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </Combobox.Button>
              </div>

              <Combobox.Options className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">

                {filteredTypes.length === 0 ? (
                  <div className="p-2 text-gray-500 text-sm">
                    Không có gói phù hợp với lựa chọn
                  </div>
                ) : (
                  filteredTypes.map(t => (
                    <Combobox.Option
                      key={t.id}
                      value={t}
                      className={({ active }) =>
                        `px-3 py-2 cursor-pointer flex justify-between ${
                          active ? 'bg-blue-100' : ''
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div>
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-gray-500">
                              {formatMoney(t.price)}
                              {t.typegroup && ` · ${t.typegroup}`}
                              {t.countbaby && ` · ${t.countbaby} bé`}
                            </div>
                          </div>
                          {selected && <CheckIcon className="h-5 w-5 text-blue-600" />}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}

              </Combobox.Options>
            </div>
          </Combobox>
          <p className="mt-2 text-xs text-slate-500">
            {selectedType
              ? `${selectedType.countbaby === '2' ? 'Thai đôi' : selectedType.countbaby === '1' ? 'Thai đơn' : 'Chưa phân loại'} · ${selectedType.typegroup || 'Chưa phân loại dịch vụ'}`
              : 'Chọn số thai và loại dịch vụ để lọc gói phù hợp.'}
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={form.isOutside}
              onChange={event => setForm(previous => ({
                ...previous,
                isOutside: event.target.checked,
                outsideId: event.target.checked ? previous.outsideId : ''
              }))}
            />
            Lấy mẫu ngoại viện
          </label>
          {form.isOutside && (
            <div>
              <label htmlFor="outsideId" className="mb-1 block">
                Mức chi phí ngoại viện *
              </label>
              <select
                id="outsideId"
                value={form.outsideId}
                onChange={event => setForm(previous => ({ ...previous, outsideId: event.target.value }))}
                required
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Chọn mức chi phí</option>
                {outsides.map(outside => (
                  <option key={outside.id} value={outside.id}>
                    {outside.name} — {Number(outside.price).toLocaleString('vi-VN')} đ
                  </option>
                ))}
              </select>
              {selectedOutside && (
                <p className="mt-1 text-sm text-gray-600">
                  Chi phí ngoại viện: {Number(selectedOutside.price).toLocaleString('vi-VN')} đ
                </p>
              )}
              {outsides.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  Chưa có mức phí. Hãy tạo mức phí trong trang quản lý ngoại viện.
                </p>
              )}
            </div>
          )}
        </div>

        {/* PRICE */}
        <div>
          <label className="block mb-1">Giá gốc</label>
          <input value={formatMoney(basePrice)} readOnly className="w-full border px-2 py-2 rounded bg-gray-100" />
        </div>

        <div>
          <label className="block mb-1">Khuyến mại</label>
          <input
            type="number"
            value={promote}
            onChange={(e) => handlePromoteChange(e.target.value)}
            className="w-full border px-2 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Thành tiền (gói + ngoại viện)</label>
          <input
            value={formatMoney(totalPrice)}
            readOnly
            className="w-full border px-2 py-2 rounded bg-green-50 font-semibold"
          />
        </div>

        {/* NO */}
        <div>
          <label className="block mb-1">Số hợp đồng</label>
          <input
            type="text"
            name="no"
            value={form.no}
            onChange={handleChange}
            className="w-full border px-2 py-2 rounded"
          />
        </div>

        {/* DATE */}
        <div>
          <label className="block mb-1">Ngày ký</label>
          <input
            type="date"
            name="dateContract"
            value={form.dateContract}
            onChange={handleChange}
            className="w-full border px-2 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 md:col-span-2"
        >
          {saving ? 'Đang lưu...' : 'Tạo hợp đồng'}
        </button>

      </form>
      </div>
    </div>
  );
}