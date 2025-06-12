'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

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
    notes: '',
  });

  const [offices, setOffices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchOffices = async () => {
      const { data, error } = await supabase
        .from('offices')
        .select('id, name')
        .order('name', { ascending: true });

      if (!error && data) setOffices(data);
    };

    fetchOffices();
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (searchTerm.trim().length < 2) return;

      const { data } = await supabase
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
    const cleanedFormData = {
      ...formData,
      birthdate: formData.birthdate || null,
      hire_date: formData.hire_date || null,
    };

    if (isEditing && formData.id) {
      const { error } = await supabase
        .from('employees')
        .update(cleanedFormData)
        .eq('id', formData.id);
      alert(error ? 'فشل التحديث: ' + error.message : 'تم تحديث الموظف!');
    } else {
      const { error } = await supabase.from('employees').insert([cleanedFormData]);
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
      notes: '',
    });

    setIsEditing(false);
    setSearchTerm('');
    setShowPreview(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md text-sm" dir="rtl">

<h2 className="text-lg font-bold">نموذج تعديل معلومات موظف</h2>

      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="ابحث بالاسم"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full sm:w-72 px-3 py-2 border rounded-md text-right"
      />

      {/* 🧾 Preview + Collapse Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      
        <div className="flex gap-2">
          {/*<button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="bg-purple-600 text-white px-4 py-1.5 rounded hover:bg-purple-700"
          >
            {showPreview ? 'إخفاء المعاينة' : 'معاينة البيانات'}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="bg-gray-400 text-white px-4 py-1.5 rounded hover:bg-gray-500"
          >
            {collapsed ? 'إظهار الحقول' : 'إخفاء الحقول'}
          </button>*/}
        </div>
      </div>

      {/* 👁 Preview Mode */}
      {showPreview && (
        <div className="mb-6 bg-gray-100 p-4 rounded text-right leading-loose text-sm">
          <p><strong>الاسم:</strong> {formData.first_name} {formData.last_name}</p>
          <p><strong>الوظيفة:</strong> {formData.job_title}</p>
          <p><strong>الرقم الوطني:</strong> {formData.id_number}</p>
          <p><strong>العنوان:</strong> {formData.address}</p>
          <p><strong>رقم الهاتف:</strong> {formData.phone_no}</p>
          <p><strong>البريد الإلكتروني:</strong> {formData.email}</p>
          <p><strong>تاريخ الميلاد:</strong> {formData.birthdate}</p>
          <p><strong>المؤهل العلمي:</strong> {formData.certificate}</p>
          <p><strong>العنوان الوظيفي:</strong> {formData.job_title}</p>
          <p><strong> تاريخ التعيين:</strong> {formData.hire_date}</p>
          <p><strong>رقم الحساب:</strong> {formData.bank_account}</p>
          <p><strong>البنك:</strong> {formData.bank}</p>


        </div>
      )}

      {/* 📄 Form Section */}
      {!collapsed && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-right">
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
            { name: 'first_name', label: 'الاسم' },
            { name: 'last_name', label: 'اللقب' },
            { name: 'id_number', label: 'رقم الهوية' },
            { name: 'certificate', label: 'المؤهل العلمي' },
            { name: 'job_title', label: 'المسمى الوظيفي' },
            { name: 'birthdate', label: 'تاريخ الميلاد', type: 'date' },
            { name: 'phone_no', label: 'رقم الهاتف' },
            { name: 'email', label: 'البريد الإلكتروني' },
            { name: 'address', label: 'العنوان' },
            { name: 'bank_account', label: 'رقم الحساب البنكي' },
            { name: 'bank', label: 'البنك' },
            { name: 'hire_date', label: 'تاريخ التعيين', type: 'date' },
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

          <div className="col-span-1 sm:col-span-2 md:col-span-3 mt-4">
            <button
              type="submit"
              className="w-full sm:w-auto text-base bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700"
            >
              {isEditing ? 'تحديث الموظف' : 'حفظ'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
