'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Staff = {
  fullName: string;
  phone?: string;
  email?: string;
  role: string;
  password: string;
  isActive: boolean;
};
const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Nhân viên' },
];

export default function CreateStaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'admin', // default role, thay đổi theo enum StaffRole của bạn
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const name = target.name;

    let value: string | boolean;
    if (target instanceof HTMLInputElement) {
      value = target.type === 'checkbox' ? target.checked : target.value;
    } else {
      // HTMLSelectElement
      value = target.value;
    }

    setStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/staffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff),
      });

      if (!res.ok) {
        throw new Error('Failed to create staff');
      }

      router.push('/staffs'); // quay lại danh sách staff sau khi tạo
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tạo nhân viên.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Staff</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {/* Full Name */}
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={staff.fullName}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={staff.phone || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={staff.email || ''}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={staff.password}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
            minLength={6}
          />
        </div>

        {/* Role */}
        <select name="role" value={staff.role} onChange={handleChange} className="w-full border px-2 py-1 rounded">
            {roleOptions.map(r => (
                <option key={r.value} value={r.value}>
                {r.label}
                </option>
            ))}
        </select>


        {/* Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={staff.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label>Active</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {saving ? 'Saving...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
