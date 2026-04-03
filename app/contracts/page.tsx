'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Renew = {
  renewNo: number;
  startDate: string;
  endDate: string;
};

type Contract = {
  id: string;
  no?: string;
  promote?: number;
  price?: number;
  dateContract: string;

  customer: {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
  };

  type: {
    name: string;
    price: number;
    duration?: number;
  };

  renewContracts: Renew[];
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => {
        setContracts(data);
        setLoading(false);
      });
  }, []);

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString('vi-VN') : '-';

  const formatMoney = (money?: number) =>
    money ? money.toLocaleString('vi-VN') + ' đ' : '-';

  // 🔥 tính ngày hết hạn
  const getEndDate = (c: Contract) => {
    const latestRenew = c.renewContracts?.[0];

    if (latestRenew) {
      return new Date(latestRenew.endDate);
    }

    if (c.type.duration) {
      const d = new Date(c.dateContract);
      d.setFullYear(d.getFullYear() + c.type.duration);
      return d;
    }

    return null;
  };

  // 🔥 trạng thái hợp đồng
  const getStatus = (endDate: Date | null) => {
    if (!endDate) return { text: '-', color: '' };

    const now = new Date();
    const diffMonths =
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths <= 0) {
      return { text: 'Hết hạn', color: 'text-red-500' };
    }

    if (diffMonths <= 6) {
      return { text: 'Sắp hết hạn', color: 'text-orange-500' };
    }

    return { text: 'Còn hạn', color: 'text-green-600' };
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-2xl font-bold mb-6">
        Quản lý hợp đồng
      </h1>

      <div className="bg-white rounded-xl shadow border overflow-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Khách hàng</th>
              <th className="p-4">Số HĐ</th>
              <th className="p-4">Gói</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Ngày ký</th>
              <th className="p-4">Hết hạn</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Gia hạn</th>
            </tr>
          </thead>

          <tbody>

            {contracts.map(c => {
              const endDate = getEndDate(c);
              const status = getStatus(endDate);
              const latestRenew = c.renewContracts?.[0];

              return (
                <tr key={c.id} className="border-t hover:bg-blue-50">

                  {/* CUSTOMER */}
                  <td className="p-4">
                    <div className="font-bold">
                      {c.customer.fullName}
                    </div>
                    <div className="text-blue-600 text-sm">
                      {c.customer.phone}
                    </div>
                  </td>

                  {/* NO */}
                  <td className="p-4">{c.no || '-'}</td>

                  {/* TYPE */}
                  <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                      {c.type.name}
                    </span>
                  </td>

                  {/* PRICE */}
                  <td className="p-4 text-green-600 font-semibold">
                    {formatMoney(c.price)}
                  </td>

                  {/* DATE */}
                  <td className="p-4">
                    {formatDate(c.dateContract)}
                  </td>

                  {/* END DATE */}
                  <td className="p-4">
                    {endDate ? formatDate(endDate.toISOString()) : '-'}
                  </td>

                  {/* STATUS */}
                  <td className={`p-4 font-semibold ${status.color}`}>
                    {status.text}
                  </td>

                  {/* RENEW */}
                  <td className="p-4 text-center">

                    {latestRenew && (
                      <div className="text-xs text-gray-500 mb-1">
                        Lần #{latestRenew.renewNo}
                      </div>
                    )}

                    {status.text !== 'Còn hạn' && (
                      <Link
                        href={`/renew-contract/new?contractId=${c.id}`}
                        className="text-green-600 hover:underline"
                      >
                        Gia hạn
                      </Link>
                    )}

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}