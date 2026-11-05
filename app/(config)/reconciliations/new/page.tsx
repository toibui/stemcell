'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

type StaffOption = {
  id: string;
  fullName: string;
  email: string;
};

type ReconciliationForm = {
  title: string;
  amount: number | string;
  type: string;
  reconciliationDate: string;
  staffId: string;
  note: string;
};

export default function CreateReconciliationPage() {
  const router = useRouter();

  const [staffs, setStaffs] = useState<StaffOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [staffQuery, setStaffQuery] = useState('');

  const [form, setForm] = useState<ReconciliationForm>({
    title: '',
    amount: '',
    type: 'PROJECT_RESEARCH',
    reconciliationDate: new Date().toISOString().split('T')[0],
    staffId: '',
    note: '',
  });

  // Load danh sách nhân viên để chọn người nhập/phụ trách
  useEffect(() => {
    fetch('/api/staffs')
      .then(res => {
        if (!res.ok) return [];
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setStaffs(data);
      })
      .catch(err => console.error('Lỗi khi tải danh sách nhân viên:', err));
  }, []);

  const selectedStaff = staffs.find(s => s.id === form.staffId);

  const filteredStaffs =
    staffQuery === ''
      ? staffs
      : staffs.filter(s =>
          s.fullName.toLowerCase().includes(staffQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(staffQuery.toLowerCase())
        );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('Vui lòng nhập tên/nội dung đối soát');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/reconciliations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          staffId: form.staffId || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create reconciliation');
      }

      alert('Thêm mới đối soát thành công!');
      router.push('/reconciliations');
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo đối soát');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Thêm mới khoản đối soát dòng tiền
          </h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow md:grid-cols-2">
          {/* NỘI DUNG / TÊN DỰ ÁN */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-slate-700">
              Nội dung / Tên dự án *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="VD: Đối soát kinh phí nghiên cứu dự án Tháng 10..."
              required
              className="w-full border border-slate-200 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* SỐ TIỀN & LOẠI */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Số tiền (VNĐ) *
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
                className="w-full border border-slate-200 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-emerald-600"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-slate-700">
                Loại đối soát
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border border-slate-200 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="PROJECT_RESEARCH">Nghiên cứu dự án</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          {/* NGÀY ĐỐI SOÁT */}
          <div>
            <label className="block mb-1 font-medium text-slate-700">
              Ngày ghi nhận đối soát *
            </label>
            <input
              type="date"
              name="reconciliationDate"
              value={form.reconciliationDate}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              * Số tiền sẽ được tính vào thu nhập của tháng/năm thuộc ngày này.
            </p>
          </div>

          {/* NHÂN VIÊN PHỤ TRÁCH (COMBOBOX) */}
          <div>
            <label className="block mb-1 font-medium text-slate-700">
              Nhân viên nhập / Phụ trách
            </label>

            <Combobox
              value={selectedStaff || null}
              onChange={(s: StaffOption | null) =>
                setForm(prev => ({ ...prev, staffId: s?.id ?? '' }))
              }
            >
              <div className="relative">
                <div className="relative">
                  <Combobox.Input
                    className="w-full border border-slate-200 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    displayValue={(s: StaffOption) => (s ? s.fullName : '')}
                    onChange={e => setStaffQuery(e.target.value)}
                    placeholder="Chọn nhân viên..."
                  />

                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>
                </div>

                <Combobox.Options className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredStaffs.length === 0 ? (
                    <div className="p-2 text-gray-500 text-sm">Không tìm thấy nhân viên</div>
                  ) : (
                    filteredStaffs.map(s => (
                      <Combobox.Option
                        key={s.id}
                        value={s}
                        className={({ active }) =>
                          `px-3 py-2 cursor-pointer flex justify-between ${
                            active ? 'bg-blue-100' : ''
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <div>
                              <div className="font-medium text-sm">{s.fullName}</div>
                              <div className="text-xs text-gray-500">{s.email}</div>
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

          {/* GHI CHÚ */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-slate-700">
              Ghi chú
            </label>
            <textarea
              name="note"
              rows={3}
              value={form.note}
              onChange={handleChange}
              placeholder="Nhập ghi chú thêm nếu có..."
              className="w-full border border-slate-200 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-300 md:col-span-2"
          >
            {saving ? 'Đang lưu...' : 'Lưu khoản đối soát'}
          </button>
        </form>
      </div>
    </div>
  );
}