'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function OfficesPage() {
  const supabase = createClient();

  const [form, setForm] = useState({
    name: '',
    address: '',
    email: '',
    phone_number: '',
    parent_id: '',
  });

  const [offices, setOffices] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [parentName, setParentName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      setStatus('يرجى إدخال اسم الدائرة');
      return;
    }

    const { error } = await supabase.from('offices').insert({
      name: form.name,
      address: form.address || null,
      email: form.email || null,
      phone_number: form.phone_number || null,
      parent_id: form.parent_id || null,
    });

    if (error) {
      setStatus('حدث خطأ أثناء الإضافة');
    } else {
      setStatus('تمت الإضافة بنجاح');
      setForm({ name: '', address: '', email: '', phone_number: '', parent_id: '' });
      setParentName('');
    }
  };

  useEffect(() => {
    const fetchOffices = async () => {
      const { data, error } = await supabase.from('offices').select('id, name');
      if (!error && data) {
        setOffices(data);
      }
    };

    fetchOffices();
  }, []);

  useEffect(() => {
    const fetchParentName = async () => {
      if (!form.parent_id) {
        setParentName('');
        return;
      }

      const { data, error } = await supabase
        .from('offices')
        .select('name')
        .eq('id', form.parent_id)
        .single();

      if (error || !data) {
        setParentName('❌ لم يتم العثور على دائرة بهذا المعرف');
      } else {
        setParentName(`✅ الدائرة الأم: ${data.name}`);
      }
    };

    fetchParentName();
  }, [form.parent_id]);

  return (
    <main className="max-w-xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">إضافة دائرة جديدة</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">اسم الدائرة</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="أدخل اسم الدائرة"
          />
        </div>

        <div>
          <label className="block mb-1">العنوان</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="أدخل العنوان"
          />
        </div>

        <div>
          <label className="block mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="أدخل البريد الإلكتروني"
          />
        </div>

        <div>
          <label className="block mb-1">رقم الهاتف</label>
          <input
            type="text"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="أدخل رقم الهاتف"
          />
        </div>

        <div>
          <label className="block mb-1">الدائرة الأم (اختياري)</label>
          <select
            name="parent_id"
            value={form.parent_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="">اختر الدائرة</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
          {parentName && <p className="text-sm mt-1">{parentName}</p>}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          إضافة
        </button>
      </form>

      {status && <p className="mt-4 text-green-600 font-medium">{status}</p>}
    </main>
  );
}
