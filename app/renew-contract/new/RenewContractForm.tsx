'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Combobox } from "@headlessui/react";

// 👉 GIỮ NGUYÊN toàn bộ type của bạn
type Renew = {
  renewNo: number;
  startDate: string;
  endDate: string;
};

type ContractOption = {
  id: string;
  no?: string;
  dateContract: string;
  customer: {
    fullName: string;
    phone: string;
  };
  renewContracts?: Renew[];
};

type TypeOption = {
  id: string;
  name: string;
  price: number;
  duration?: number;
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

export default function RenewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const contractIdFromUrl = searchParams.get('contractId');

  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [types, setTypes] = useState<TypeOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [contractQuery, setContractQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");

  const [basePrice, setBasePrice] = useState(0);
  const [promote, setPromote] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

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
      fetch('/api/contracts').then(res => res.json()),
      fetch('/api/types').then(res => res.json())
    ]).then(([contractsData, typesData]) => {
      setContracts(contractsData);
      setTypes(typesData);

      if (contractIdFromUrl) {
        const contract = contractsData.find((c: ContractOption) => c.id === contractIdFromUrl);

        if (contract) {
          const lastEnd =
            contract.renewContracts?.[0]?.endDate ||
            contract.dateContract;

          setForm(prev => ({
            ...prev,
            contractId: contractIdFromUrl,
            startDate: lastEnd.split('T')[0]
          }));
        }
      }
    });
  }, [contractIdFromUrl]);

  const selectedContract = contracts.find(c => c.id === form.contractId);
  const selectedType = types.find(t => t.id === form.typeId);

  const filteredContracts =
    contractQuery === ""
      ? contracts
      : contracts.filter(c =>
          c.customer.fullName.toLowerCase().includes(contractQuery.toLowerCase()) ||
          c.customer.phone.includes(contractQuery) ||
          c.no?.toLowerCase().includes(contractQuery)
        );

  const filteredTypes =
    typeQuery === ""
      ? types
      : types.filter(t =>
          t.name.toLowerCase().includes(typeQuery.toLowerCase())
        );

  const handleContractSelect = (c: ContractOption | null) => {
    setForm(prev => ({
      ...prev,
      contractId: c?.id ?? ''
    }));
  };

  const handleTypeSelect = (t: TypeOption | null) => {
    const price = t?.price ?? 0;
    const final = price - promote;

    setBasePrice(price);
    setFinalPrice(final);

    let endDate = '';
    if (t?.duration) {
      const d = new Date(form.startDate);
      d.setFullYear(d.getFullYear() + t.duration);
      endDate = d.toISOString().split('T')[0];
    }

    setForm(prev => ({
      ...prev,
      typeId: t?.id ?? '',
      basePrice: price,
      price: final,
      endDate
    }));
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'startDate' && selectedType?.duration) {
      const d = new Date(value);
      d.setFullYear(d.getFullYear() + selectedType.duration);

      setForm(prev => ({
        ...prev,
        startDate: value,
        endDate: d.toISOString().split('T')[0]
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
    setSaving(true);

    try {
      const res = await fetch('/api/renew-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Failed');

      router.push('/renew-contracts');
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo gia hạn');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">

        <h1 className="text-2xl font-bold mb-6">
          Tạo gia hạn hợp đồng
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

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

          {/* 👉 các field khác giữ nguyên */}
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            {saving ? 'Đang lưu...' : 'Tạo gia hạn'}
          </button>

        </form>
      </div>
    </div>
  );
}