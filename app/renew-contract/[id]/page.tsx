'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Combobox } from "@headlessui/react";

type ContractOption = {
  id: string;
  no?: string;
  customer: {
    fullName: string;
    phone: string;
  };
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

export default function EditRenewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [types, setTypes] = useState<TypeOption[]>([]);

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
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const [renewRes, contractsRes, typesRes] = await Promise.all([
        fetch(`/api/renew-contracts/${id}`),
        fetch('/api/contracts'),
        fetch('/api/types'),
      ]);

      const renewData = await renewRes.json();
      const contractsData = await contractsRes.json();
      const typesData = await typesRes.json();

      setContracts(contractsData);
      setTypes(typesData);

      setBasePrice(renewData.basePrice || 0);
      setPromote(renewData.promote || 0);
      setFinalPrice(renewData.price || 0);

      setForm({
        contractId: renewData.contractId,
        typeId: renewData.typeId,
        basePrice: renewData.basePrice || 0,
        promote: renewData.promote || 0,
        price: renewData.price,
        startDate: renewData.startDate.split('T')[0],
        endDate: renewData.endDate.split('T')[0]
      });

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const selectedContract = contracts.find(c => c.id === form.contractId);
  const selectedType = types.find(t => t.id === form.typeId);

  const filteredContracts = contractQuery === ""
    ? contracts
    : contracts.filter(c =>
        c.customer.fullName.toLowerCase().includes(contractQuery.toLowerCase()) ||
        c.customer.phone.includes(contractQuery) ||
        c.no?.toLowerCase().includes(contractQuery)
      );

  const filteredTypes = typeQuery === ""
    ? types
    : types.filter(t =>
        t.name.toLowerCase().includes(typeQuery.toLowerCase())
      );

  // chọn contract
  const handleContractSelect = (c: ContractOption | null) => {
    setForm(prev => ({
      ...prev,
      contractId: c?.id ?? ''
    }));
  };

  // 🔥 chọn type
  const handleTypeSelect = (t: TypeOption | null) => {
    const price = t?.price ?? 0;
    const final = price - promote;

    setBasePrice(price);
    setFinalPrice(final);

    let endDate = form.endDate;

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

  // 🔥 promote
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

  // change input
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
      const res = await fetch(`/api/renew-contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update renew');

      router.push('/renew-contracts');
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi cập nhật gia hạn');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">

        <h1 className="text-2xl font-bold mb-6">
          Cập nhật gia hạn
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* CONTRACT */}
          <Combobox value={selectedContract || null} onChange={handleContractSelect}>
            <Combobox.Input
              className="w-full border px-2 py-1 rounded"
              displayValue={(c: ContractOption) =>
                c ? `${c.customer.fullName} (${c.customer.phone})` : ""
              }
              onChange={(e) => setContractQuery(e.target.value)}
            />
            <Combobox.Options className="border mt-1 bg-white">
              {filteredContracts.map(c => (
                <Combobox.Option key={c.id} value={c}>
                  {c.customer.fullName} ({c.customer.phone})
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>

          {/* TYPE */}
          <Combobox value={selectedType || null} onChange={handleTypeSelect}>
            <Combobox.Input
              className="w-full border px-2 py-1 rounded"
              displayValue={(t: TypeOption) => t ? t.name : ""}
              onChange={(e) => setTypeQuery(e.target.value)}
            />
            <Combobox.Options className="border mt-1 bg-white">
              {filteredTypes.map(t => (
                <Combobox.Option key={t.id} value={t}>
                  {t.name} - {formatMoney(t.price)}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>

          {/* PRICE BLOCK */}
          <input value={formatMoney(basePrice)} readOnly className="w-full border px-2 py-1 bg-gray-100"/>
          <input type="number" value={promote} onChange={(e)=>handlePromoteChange(e.target.value)} className="w-full border px-2 py-1"/>
          <input value={formatMoney(finalPrice)} readOnly className="w-full border px-2 py-1 bg-green-50"/>

          {/* DATE */}
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full border px-2 py-1"/>
          <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border px-2 py-1"/>

          <button className="bg-green-600 text-white px-4 py-2 rounded">
            {saving ? 'Đang lưu...' : 'Cập nhật'}
          </button>

        </form>

      </div>
    </div>
  );
}