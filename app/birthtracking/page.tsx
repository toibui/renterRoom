'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type BarcodeStatus = 'NOT_DUE' | 'NOT_ATTACHED' | 'ATTACHED';

type Customer = {
  id: string;
  fullName?: string;
  phone?: string;
  edd?: string; // 👈 EDD chuyển sang customer
};

type BirthTracking = {
  id: string;
  actualBirthAt?: string;
  hospitalName?: string;
  birthType?: string;
  babiesCount: number;
  barcodeStatus?: BarcodeStatus;
  status: string;

  contract?: {
    id: string;
    customer?: Customer;
  } | null;
};

const barcodeText: Record<BarcodeStatus, string> = {
  NOT_DUE: 'Chưa đến ngày',
  NOT_ATTACHED: 'Chưa dán',
  ATTACHED: 'Đã dán',
};

/**
 * Tính tuần thai
 */
function calculateGestationalWeek(edd?: string) {
  if (!edd) return 0;

  const eddDate = new Date(edd);
  const today = new Date();

  const diffDays = Math.floor(
    (eddDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return 40 - Math.floor(diffDays / 7);
}

/**
 * Logic barcode
 */
function calculateBarcodeStatus(
  edd?: string,
  dbStatus?: BarcodeStatus
): BarcodeStatus {
  if (dbStatus === 'ATTACHED') return 'ATTACHED';

  if (!edd) return dbStatus || 'NOT_DUE';

  const week = calculateGestationalWeek(edd);

  if (week >= 36) return 'NOT_ATTACHED';

  return 'NOT_DUE';
}

export default function BirthTrackingPage() {
  const [births, setBirths] = useState<BirthTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [barcodeFilter, setBarcodeFilter] = useState('');

  const fetchBirths = async () => {
    setLoading(true);

    try {
      let url = '/api/births';

      if (barcodeFilter && barcodeFilter !== 'UPCOMING') {
        url += `?barcodeStatus=${barcodeFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      let filtered = data;

      // Filter sắp sinh (>= 38 tuần)
      if (barcodeFilter === 'UPCOMING') {
        filtered = data.filter((b: BirthTracking) => {
          const edd = b.contract?.customer?.edd;
          const week = calculateGestationalWeek(edd);

          return week >= 38 && !b.actualBirthAt;
        });
      }

      setBirths(filtered);
    } catch (err) {
      console.error('Fetch births error', err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBirths();
  }, [barcodeFilter]);

  const handleDelete = async (id: string) => {
    const ok = confirm('Bạn có chắc muốn xoá?');
    if (!ok) return;

    await fetch(`/api/births/${id}`, {
      method: 'DELETE',
    });

    setBirths((prev) => prev.filter((b) => b.id !== id));
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <div className="p-4 text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Birth Tracking</h1>

        <Link
          href="/birthtracking/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          + New Birth Tracking
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <select
          className="border rounded-lg px-3 py-2"
          value={barcodeFilter}
          onChange={(e) => setBarcodeFilter(e.target.value)}
        >
          <option value="">Tất cả Barcode</option>
          <option value="NOT_DUE">Chưa đến ngày</option>
          <option value="NOT_ATTACHED">Chưa dán</option>
          <option value="ATTACHED">Đã dán</option>
          <option value="UPCOMING">Sắp sinh (≥ 38 tuần)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-center">Barcode</th>
              <th className="p-3 text-left">Ngày dự sinh</th>
              <th className="p-3 text-left">Tuần thai</th>
              <th className="p-3 text-left">Ngày sinh thực tế</th>
              <th className="p-3 text-left">Hospital</th>
              <th className="p-3 text-center">Babies</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {births.map((b) => {
              const customer = b.contract?.customer;
              const edd = customer?.edd;

              const week = calculateGestationalWeek(edd);

              const barcodeStatus = calculateBarcodeStatus(
                edd,
                b.barcodeStatus
              );

              return (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    {customer?.fullName || '-'}
                  </td>

                  <td className="p-3">{customer?.phone || '-'}</td>

                  {/* Barcode */}
                  <td className="p-3 text-center">
                    {barcodeStatus === 'NOT_DUE' && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {barcodeText.NOT_DUE}
                      </span>
                    )}

                    {barcodeStatus === 'NOT_ATTACHED' && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        {barcodeText.NOT_ATTACHED}
                      </span>
                    )}

                    {barcodeStatus === 'ATTACHED' && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        {barcodeText.ATTACHED}
                      </span>
                    )}
                  </td>

                  {/* EDD từ customer */}
                  <td className="p-3">{formatDate(edd)}</td>

                  {/* Tuần thai */}
                  <td className="p-3">
                    {week > 0 ? `${week} tuần` : '-'}
                  </td>

                  <td className="p-3">
                    {formatDate(b.actualBirthAt)}
                  </td>

                  <td className="p-3">{b.hospitalName || '-'}</td>

                  <td className="p-3 text-center">{b.babiesCount}</td>

                  <td className="p-3">{b.status}</td>

                  <td className="p-3 text-center space-x-2">
                    <Link
                      href={`/birthtracking/${b.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {births.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-400">
                  Chưa có Birth Tracking nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}