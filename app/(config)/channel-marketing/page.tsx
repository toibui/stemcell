'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ChannelMarketing = {
  id: string;
  name: string;
};

export default function ChannelMarketingPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<ChannelMarketing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/channel-marketing')
      .then(res => res.json())
      .then(data => {
        setChannels(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá?')) return;

    await fetch(`/api/channel-marketing/${id}`, {
      method: 'DELETE',
    });

    setChannels(prev => prev.filter(c => c.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Channel Marketing
          </h1>

          <button
            onClick={() => router.push('/channel-marketing/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Thêm mới
          </button>
        </div>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Tên</th>
              <th className="p-3 border w-40">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {channels.map(channel => (
              <tr key={channel.id}>
                <td className="p-3 border">{channel.name}</td>
                <td className="p-3 border space-x-2">
                  <button
                    onClick={() =>
                      router.push(`/channel-marketing/${channel.id}`)
                    }
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(channel.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}