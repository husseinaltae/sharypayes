// app/employees/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function EmployeesForm() {
  const [formData, setFormData] = useState<any>({
    office_id: '',
    first_name: '',
    last_name: '',
    id_number: '',
    certificate: '',
    job_title: '',
    birthdate: '',
    phone_no: '',
    email: '',
    address: '',
    bank_account: '',
    bank: '',
    hire_date: '',
    promotion_due_date: '',
  });

  const [offices, setOffices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchOffices = async () => {
      const { data, error } = await supabase
        .from('offices')
        .select('id, name')
        .order('name', { ascending: true });

      if (!error && data) {
        setOffices(data);
      }
    };

    fetchOffices();
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (searchTerm.trim().length < 2) return;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(1);

      if (data && data.length > 0) {
        setFormData(data[0]);
        setIsEditing(true);
      }
    };

    fetchEmployee();
  }, [searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && formData.id) {
      const { error } = await supabase
        .from('employees')
        .update(formData)
        .eq('id', formData.id);
      alert(error ? 'فشل التحديث: ' + error.message : 'تم تحديث الموظف!');
    } else {
      const { error } = await supabase.from('employees').insert([formData]);
      alert(error ? 'فشل الإضافة: ' + error.message : 'تمت إضافة الموظف!');
    }

    setFormData({
      office_id: '',
      first_name: '',
      last_name: '',
      id_number: '',
      certificate: '',
      job_title: '',
      birthdate: '',
      phone_no: '',
      email: '',
      address: '',
      bank_account: '',
      bank: '',
      hire_date: '',
      promotion_due_date: '',
      notes: '',
    });
    setIsEditing(false);
    setSearchTerm('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md text-sm" dir="rtl">
     
       <input
        type="text"
        placeholder="ابحث بالاسم"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-min px-1 py-1 border rounded-md text-right"
      />
      <h2 className="text-xl font-bold mb-4 text-right">نموذج الموظف</h2>

    

      <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-4 text-right">
        <div>
          <label className="block text-sm font-medium mb-1">الدائرة</label>
          <select
            name="office_id"
            value={formData.office_id}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">اختر الدائرة</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </div>

        {[
          { name: 'first_name', label: 'الاسم ' },
          { name: 'last_name', label: 'اللقب ' },
          { name: 'id_number', label: 'رقم الهوية' },
          { name: 'certificate', label: ' المؤهل العلمي' },
          { name: 'job_title', label: 'المسمى الوظيفي' },
          { name: 'birthdate', label: 'تاريخ الميلاد', type: 'date' },
          { name: 'phone_no', label: 'رقم الهاتف' },
          { name: 'email', label: 'البريد الإلكتروني' },
          { name: 'address', label: 'العنوان' },
          { name: 'bank_account', label: 'رقم الحساب البنكي' },
          { name: 'bank', label: 'البنك' },
          { name: 'hire_date', label: 'تاريخ التعيين', type: 'date' },
          { name: 'promotion_due_date', label: 'تاريخ العلاوة السنوية', type: 'date' },
          { name: 'notes', label: 'الملاحظات' },
        ].map(({ name, label, type = 'text' }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-right"
            />
          </div>
        ))}

        <div className="col-span-3 mt-4 cent">
          <button
            type="submit"
            className="w-600px text-24px bg-green-600 text-white py-2 px-2 rounded-md hover:bg-green-700"
          >
            {isEditing ? 'تحديث الموظف' : 'إضافة موظف'}
          </button>
        </div>
      </form>
    </div>
  );
}
