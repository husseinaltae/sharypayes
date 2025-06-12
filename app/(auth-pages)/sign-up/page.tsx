'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setphone] = useState('');
  const [officeId, setOfficeId] = useState('');
  const [offices, setOffices] = useState<{ id: any; name: any }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOffices = async () => {
      const { data, error } = await supabase.from('offices').select('id, name');
      if (!error) setOffices(data);
    };
    fetchOffices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Sign up with Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    // Insert into users table
    const { error: dbError } = await supabase.from('users').insert({
      id: authUser.user?.id,
      email,
      phone,
      office_id: officeId,
    });

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.push('/sign-in');
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold mb-4 text-center">إنشاء حساب </h1>
      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        <div>
          <label className="block mb-1 font-medium">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">رقم الجوال</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setphone(e.target.value)}
            required
            pattern="\d{11}"
            maxLength={11}
            inputMode="numeric"
            className="w-full p-2 border rounded"
            title="رقم الهاتف يجب أن يكون 11 رقمًا"
          />

        </div>
        <div>
          <label className="block mb-1 font-medium">المؤسسة</label>
          <select
            value={officeId}
            onChange={(e) => setOfficeId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">اختر مؤسسة</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          إنشاء الحساب
        </button>
      </form>
    </div>
  );
}
