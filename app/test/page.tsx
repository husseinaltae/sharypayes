'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function CardInfoInput() {
  const supabase = createClient();

  const [form, setForm] = useState({
    // New office-related fields
    name: '',
    address: '',
    email: '',
    phone_number: '',
    parent_id: '',

    // Existing card-related fields
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({
    // For new inputs (optional, you can add validation if needed)
    name: '',
    address: '',
    email: '',
    phone_number: '',
    parent_id: '',

    // Existing errors
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // For example purpose, offices data and parentName state
  const [offices, setOffices] = useState([
    // Replace this with real data fetch from supabase if needed
    { id: '1', name: 'دائرة 1' },
    { id: '2', name: 'دائرة 2' },
  ]);
  const parentName = offices.find((o) => o.id === form.parent_id)?.name || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Special handling for cardNumber, expiryDate, cvv
    if (name === 'cardNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
      const formatted = digitsOnly.replace(/(.{4})/g, '$1-').replace(/-$/, '');
      setForm((prev) => ({ ...prev, cardNumber: formatted }));
      setErrors((prev) => ({ ...prev, cardNumber: '' }));
    } else if (name === 'expiryDate') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      let formatted = digits;
      if (digits.length >= 3) {
        const mm = digits.slice(0, 2);
        const yy = digits.slice(2);
        formatted = `${mm}/${yy}`;
      }
      setForm((prev) => ({ ...prev, expiryDate: formatted }));
      setErrors((prev) => ({ ...prev, expiryDate: '' }));
    } else if (name === 'cvv') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 3);
      setForm((prev) => ({ ...prev, cvv: digitsOnly }));
      setErrors((prev) => ({ ...prev, cvv: '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const getRawCardNumber = () => form.cardNumber.replace(/-/g, '');

  const validate = () => {
    const rawCard = getRawCardNumber();
    const mm = parseInt(form.expiryDate.slice(0, 2));
    const isValidExpiry = /^\d{2}\/\d{2}$/.test(form.expiryDate) && mm >= 1 && mm <= 12;

    const newErrors = {
      // You can add validation for new inputs here if needed
      name: form.name.trim() ? '' : 'اسم الدائرة مطلوب',
      address: form.address.trim() ? '' : 'العنوان مطلوب',
      email:
        form.email.trim() && /\S+@\S+\.\S+/.test(form.email)
          ? ''
          : 'البريد الإلكتروني غير صحيح',
      phone_number: form.phone_number.trim() ? '' : 'رقم الهاتف مطلوب',
      parent_id: '',

      cardHolderName: form.cardHolderName.trim() ? '' : 'اسم صاحب البطاقة مطلوب',
      cardNumber: rawCard.length === 16 ? '' : 'رقم البطاقة يجب أن يكون 16 رقمًا',
      expiryDate: isValidExpiry ? '' : 'تاريخ انتهاء الصلاحية غير صحيح',
      cvv: form.cvv.length === 3 ? '' : 'رمز CVV يجب أن يكون 3 أرقام',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((msg) => msg !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Example: insert office data and card data to Supabase, adapt as needed
      // await supabase.from('offices').insert({
      //   name: form.name,
      //   address: form.address,
      //   email: form.email,
      //   phone_number: form.phone_number,
      //   parent_id: form.parent_id || null,
      // });

      // await supabase.from('cards').insert({ ...form, cardNumber: getRawCardNumber() });

      alert('تم إرسال البيانات بنجاح!');
      setForm({
        name: '',
        address: '',
        email: '',
        phone_number: '',
        parent_id: '',

        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      });
    } catch (error) {
      alert('حدث خطأ أثناء الإرسال');
    }
  };

  return (
    <main className="max-w-md mx-auto p-6" dir="rtl">
      <h1 className="text-xl font-bold mb-6">إضافة دائرة جديدة وبيانات البطاقة</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Office Inputs */}
        <div>
          <label className="block mb-1">اسم الدائرة</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full border px-4 py-2 rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="أدخل اسم الدائرة"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
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
            className={`w-full border px-4 py-2 rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="أدخل البريد الإلكتروني"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block mb-1">رقم الهاتف</label>
          <input
            type="text"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className={`w-full border px-4 py-2 rounded ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="أدخل رقم الهاتف"
          />
          {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>}
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

        {/* Card Holder Name */}
        <div>
          <label className="block mb-1 font-medium">اسم صاحب البطاقة</label>
          <input
            type="text"
            name="cardHolderName"
            value={form.cardHolderName}
            onChange={handleChange}
            placeholder="أدخل اسم صاحب البطاقة"
            className={`w-full border px-4 py-2 rounded ${
              errors.cardHolderName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.cardHolderName && (
            <p className="text-red-600 text-sm mt-1">{errors.cardHolderName}</p>
          )}
        </div>

        {/* Card Number */}
        <div>
          <label className="block mb-1 font-medium">رقم البطاقة (16 رقم)</label>
          <input
            type="text"
            name="cardNumber"
            inputMode="numeric"
            value={form.cardNumber}
            onChange={handleChange}
            placeholder="1234-5678-9012-3456"
            className={`w-full border px-4 py-2 rounded ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.cardNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block mb-1 font-medium">تاريخ الانتهاء (MM/YY)</label>
          <input
            type="text"
            name="expiryDate"
            inputMode="numeric"
            value={form.expiryDate}
            onChange={handleChange}
            placeholder="MM/YY"
            maxLength={5}
            className={`w-full border px-4 py-2 rounded ${
              errors.expiryDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.expiryDate && (
            <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
          )}
        </div>

        {/* CVV */}
        <div>
          <label className="block mb-1 font-medium">رمز CVV (3 أرقام)</label>
          <input
            type="text"
            name="cvv"
            inputMode="numeric"
            value={form.cvv}
            onChange={handleChange}
            placeholder="CVV"
            maxLength={3}
            className={`w-full border px-4 py-2 rounded ${
              errors.cvv ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.cvv && <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          إرسال
        </button>
      </form>
    </main>
  );
}
