'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Combobox } from "@headlessui/react";
import { BABY_COUNT_OPTIONS, TYPE_GROUP_OPTIONS } from '@/lib/type-options';

// 👉 GIỮ NGUYÊN toàn bộ type của bạn
type Renew = {
  renewNo: number;
  startDate: string;
  endDate: string;
};

type ContractOption = {
  id: string;
  no?: string;
  typeId: string;
  dateContract: string;
  type: TypeOption;
  customer: {
    fullName: string;
    phone: string;
  };
  renews?: Renew[];
};

type TypeOption = {
  id: string;
  name: string;
  price: number;
  duration?: number;
  typegroup: string | null;
  countbaby: string | null;
};

type RenewForm = {
  contractId: string;
  typeId: string;
  basePrice: number;
  promote: number;
  price: number;
  startDate: string;
  endDate: string;
};

const getEndDate = (startDate: string, duration: number) => {
  const date = new Date(`${startDate}T00:00:00`);
  date.setFullYear(date.getFullYear() + duration);
  return date.toISOString().split('T')[0];
};

export default function RenewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const contractIdFromUrl = searchParams.get('contractId');

  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [types, setTypes] = useState<TypeOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [contractQuery, setContractQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");
  const [babyCountFilter, setBabyCountFilter] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");

  const [basePrice, setBasePrice] = useState(0);
  const [promote, setPromote] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [error, setError] = useState('');

  const [form, setForm] = useState<RenewForm>({
    contractId: '',
    typeId: '',
    basePrice: 0,
    promote: 0,
    price: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  // 🔥 LOAD DATA
  useEffect(() => {
    Promise.all([
      fetch('/api/contracts').then(async res => {
        if (!res.ok) throw new Error('Không tải được danh sách hợp đồng');
        return res.json();
      }),
      fetch('/api/types').then(async res => {
        if (!res.ok) throw new Error('Không tải được danh sách gói dịch vụ');
        return res.json();
      })
    ]).then(([contractsData, typesData]) => {
      setContracts(contractsData);
      setTypes(typesData);

      if (contractIdFromUrl) {
        const contract = contractsData.find((c: ContractOption) => c.id === contractIdFromUrl);

        if (contract) {
          const lastEnd =
            contract.renews?.[0]?.endDate ||
            contract.dateContract;
          const type = typesData.find((t: TypeOption) => t.id === contract.typeId);
          setBabyCountFilter(type?.countbaby ?? '');
          setServiceTypeFilter(type?.typegroup ?? '');
          const startDate = lastEnd.split('T')[0];
          const endDate = type?.duration
            ? getEndDate(startDate, type.duration)
            : '';

          setForm(prev => ({
            ...prev,
            contractId: contractIdFromUrl,
            typeId: type?.id ?? '',
            basePrice: type?.price ?? 0,
            price: type?.price ?? 0,
            startDate,
            endDate
          }));
          setBasePrice(type?.price ?? 0);
          setFinalPrice(type?.price ?? 0);
        }
      }
    }).catch(err => {
      console.error('Error loading renewal form:', err);
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu');
    });
  }, [contractIdFromUrl]);

  const selectedContract = contracts.find(c => c.id === form.contractId);
  const selectedType = types.find(t => t.id === form.typeId);
  const serviceTypeOptions = [...new Set([
    ...TYPE_GROUP_OPTIONS,
    ...types.map(type => type.typegroup).filter((value): value is string => Boolean(value))
  ])];

  const filteredContracts =
    contractQuery === ""
      ? contracts
      : contracts.filter(c =>
          c.customer.fullName.toLowerCase().includes(contractQuery.toLowerCase()) ||
          c.customer.phone.includes(contractQuery) ||
          c.no?.toLowerCase().includes(contractQuery)
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
    setForm(prev => ({ ...prev, typeId: '', basePrice: 0, promote: 0, price: 0, endDate: '' }));
  };

  const handleContractSelect = (c: ContractOption | null) => {
    const type = types.find(t => t.id === c?.typeId);
    setBabyCountFilter(type?.countbaby ?? '');
    setServiceTypeFilter(type?.typegroup ?? '');
    const price = type?.price ?? 0;
    setForm(prev => ({
      ...prev,
      contractId: c?.id ?? '',
      typeId: type?.id ?? '',
      basePrice: price,
      price,
      endDate: type?.duration ? getEndDate(form.startDate, type.duration) : ''
    }));
    setBasePrice(price);
    setPromote(0);
    setFinalPrice(price);
  };

  const handleTypeSelect = (t: TypeOption | null) => {
    const price = t?.price ?? 0;
    const discount = Math.min(promote, price);
    const final = price - discount;

    setBasePrice(price);
    setPromote(discount);
    setFinalPrice(final);

    const endDate = t?.duration ? getEndDate(form.startDate, t.duration) : '';

    setForm(prev => ({
      ...prev,
      typeId: t?.id ?? '',
      basePrice: price,
      promote: discount,
      price: final,
      endDate
    }));
  };

  const handlePromoteChange = (value: string) => {
    let p = Math.max(Number(value) || 0, 0);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'startDate' && selectedType?.duration) {
      setForm(prev => ({
        ...prev,
        startDate: value,
        endDate: getEndDate(value, selectedType.duration)
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatMoney = (money?: number) =>
    money?.toLocaleString('vi-VN') + ' đ';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.contractId || !form.typeId || !form.startDate || !form.endDate) {
      setError('Vui lòng chọn hợp đồng, gói gia hạn và ngày bắt đầu/kết thúc.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/renew-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || result.details || 'Tạo gia hạn thất bại');
      }

      router.push('/renew-contract');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Có lỗi khi tạo gia hạn');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tạo gia hạn hợp đồng</h1>
          <p className="mt-1 text-sm text-slate-500">Chọn hợp đồng, số thai và loại dịch vụ để lọc gói gia hạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-7">

          {/* 👉 giữ nguyên UI của bạn */}
          <div>
            <label className="block mb-1 font-medium">Hợp đồng *</label>

            <Combobox
              value={selectedContract || null}
              onChange={handleContractSelect}
              disabled={!!contractIdFromUrl}
            >
              <div className="relative">
                <Combobox.Input
                  disabled={!!contractIdFromUrl}
                  className="w-full border px-2 py-1 rounded"
                  displayValue={(c: ContractOption) =>
                    c ? `${c.customer.fullName} (${c.customer.phone}) - ${c.no || ''}` : ""
                  }
                  onChange={(e) => setContractQuery(e.target.value)}
                />
                <Combobox.Options className="absolute z-10 w-full border mt-1 bg-white shadow max-h-60 overflow-auto">
                  {filteredContracts.map(c => (
                    <Combobox.Option key={c.id} value={c}>
                      {c.customer.fullName} ({c.customer.phone}) - {c.no}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>

          <div>
            <label className="block mb-1 font-medium">Gói gia hạn *</label>
            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="renew-baby-filter" className="mb-1 block text-sm font-medium">Số thai</label>
                <select
                  id="renew-baby-filter"
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
                <label htmlFor="renew-service-filter" className="mb-1 block text-sm font-medium">Loại dịch vụ</label>
                <select
                  id="renew-service-filter"
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
            <Combobox value={selectedType || null} onChange={handleTypeSelect}>
              <div className="relative">
                <Combobox.Input
                  className="w-full border px-2 py-1 rounded"
                  displayValue={(t: TypeOption) => t ? t.name : ''}
                  onChange={(e) => setTypeQuery(e.target.value)}
                />
                <Combobox.Options className="absolute z-10 w-full border mt-1 bg-white shadow max-h-60 overflow-auto">
                  {filteredTypes.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Không có gói phù hợp với lựa chọn</div>
                  ) : filteredTypes.map(t => (
                    <Combobox.Option key={t.id} value={t}>
                      {t.name} - {formatMoney(t.price)}
                      {t.typegroup && ` · ${t.typegroup}`}
                      {t.countbaby && ` · ${t.countbaby} bé`}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
            <p className="mt-2 text-xs text-slate-500">
              {selectedType
                ? `${selectedType.countbaby === '2' ? 'Thai đôi' : selectedType.countbaby === '1' ? 'Thai đơn' : 'Chưa phân loại'} · ${selectedType.typegroup || 'Chưa phân loại dịch vụ'}`
                : 'Chọn số thai và loại dịch vụ để lọc gói phù hợp.'}
            </p>
          </div>

          <div>
            <label className="block mb-1 font-medium">Giá gói</label>
            <input
              value={formatMoney(basePrice)}
              readOnly
              className="w-full border px-2 py-1 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Giảm giá</label>
            <input
              type="number"
              min="0"
              max={basePrice}
              value={promote}
              onChange={e => handlePromoteChange(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Thành tiền</label>
            <input
              value={formatMoney(finalPrice)}
              readOnly
              className="w-full border px-2 py-1 rounded bg-green-50"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Ngày bắt đầu *</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Ngày kết thúc *</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white md:col-span-2 md:justify-self-end">
            {saving ? 'Đang lưu...' : 'Tạo gia hạn'}
          </button>

        </form>
      </div>
    </div>
  );
}