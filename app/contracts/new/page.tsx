'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

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

export default function CreateContractPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [types, setTypes] = useState<TypeOption[]>([]);
  const [saving, setSaving] = useState(false);

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

  // Load data
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);

    fetch('/api/types')
      .then(res => res.json())
      .then(setTypes);
  }, []);

  const selectedCustomer = customers.find(c => c.id === form.customerId);
  const selectedType = types.find(t => t.id === form.typeId);

  const filteredCustomers =
    customerQuery === ""
      ? customers
      : customers.filter(c =>
          c.fullName.toLowerCase().includes(customerQuery.toLowerCase()) ||
          c.phone.includes(customerQuery)
        );

  const filteredTypes =
    typeQuery === ""
      ? types
      : types.filter(t =>
          t.name.toLowerCase().includes(typeQuery.toLowerCase())
        );

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Tạo hợp đồng</h1>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl bg-white p-6 rounded-xl shadow">

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
          <label className="block mb-1 font-medium">Gói *</label>

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
                    Không tìm thấy
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
          <label className="block mb-1">Thành tiền</label>
          <input
            value={formatMoney(finalPrice)}
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
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {saving ? 'Đang lưu...' : 'Tạo hợp đồng'}
        </button>

      </form>
    </div>
  );
}