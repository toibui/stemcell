'use client';

import { useEffect, useState } from 'react';

type Outside = {
  id: string;
  name: string;
  price: number | string;
  description: string | null;
};

type OutsideForm = {
  name: string;
  price: string;
  description: string;
};

const emptyForm: OutsideForm = { name: '', price: '', description: '' };

export default function OutsidesPage() {
  const [outsides, setOutsides] = useState<Outside[]>([]);
  const [form, setForm] = useState<OutsideForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchOutsides = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/outsides');
      if (!response.ok) throw new Error('Không thể tải danh sách chi phí ngoại viện');
      const data: Outside[] = await response.json();
      setOutsides(data.sort((first, second) => Number(first.price) - Number(second.price)));
    } catch (fetchError) {
      console.error('Error loading outsides:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOutsides();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  };

  const handleEdit = (outside: Outside) => {
    setEditingId(outside.id);
    setForm({
      name: outside.name,
      price: String(outside.price),
      description: outside.description ?? ''
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(
        editingId ? `/api/outsides/${editingId}` : '/api/outsides',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, price: Number(form.price) })
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Không thể lưu chi phí ngoại viện');
      }

      resetForm();
      await fetchOutsides();
    } catch (saveError) {
      console.error('Error saving outside:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (outside: Outside) => {
    if (!confirm(`Bạn có chắc muốn xoá "${outside.name}"?`)) return;

    setError('');
    try {
      const response = await fetch(`/api/outsides/${outside.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Không thể xoá chi phí ngoại viện');
      }

      setOutsides(previous => previous.filter(item => item.id !== outside.id));
      if (editingId === outside.id) resetForm();
    } catch (deleteError) {
      console.error('Error deleting outside:', deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl bg-white p-6 shadow">
          <h1 className="mb-6 text-2xl font-bold">Quản lý chi phí ngoại viện</h1>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="outside-name" className="mb-1 block font-medium">
                Tên/khoảng cách *
              </label>
              <input
                id="outside-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="outside-price" className="mb-1 block font-medium">
                Chi phí (VND) *
              </label>
              <input
                id="outside-price"
                name="price"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="outside-description" className="mb-1 block font-medium">
                Mô tả
              </label>
              <textarea
                id="outside-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-3 md:col-span-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-4 py-2"
                >
                  Huỷ
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mức phí'}
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3">Tên/khoảng cách</th>
                  <th className="p-3">Chi phí</th>
                  <th className="p-3">Mô tả</th>
                  <th className="p-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-6 text-center">Đang tải...</td></tr>
                ) : outsides.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Chưa có mức phí ngoại viện</td></tr>
                ) : outsides.map(outside => (
                  <tr key={outside.id} className="border-t">
                    <td className="p-3 font-medium">{outside.name}</td>
                    <td className="p-3">{Number(outside.price).toLocaleString('vi-VN')} đ</td>
                    <td className="p-3">{outside.description || '-'}</td>
                    <td className="space-x-3 whitespace-nowrap p-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(outside)}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(outside)}
                        className="text-red-600 hover:underline"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}