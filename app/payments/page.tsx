'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function PaymentsPage() {
  const supabase = createClient();

  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const handleGenerateThisMonth = async () => {
    const { error } = await supabase.rpc('copy_last_month_payments');
    if (error) {
      alert('حدث خطأ أثناء نسخ مفردات الشهر السابق: ' + error.message);
    } else {
      alert('تم إنشاء مفردات هذا الشهر بنجاح!');
      // Optional: refetch payments here if needed
    }
  };
  

  const [formData, setFormData] = useState({
    employee_id: '',
    degree: '',
    level: '',
    salary: '',
    certificate_percentage: '',
    risk_percentage: '',
    manage_percentage: '',
    marriage_pay: '',
    kids_pay: '',
    transe_pay: '',
    retire_percentage: '',
    marriage_loan: '',
    employee_loan: '',
    tax: '',
    stamp_fee: '',
    final_income: '',
    month: '',
    notes: '',

  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase.from('employees').select('id, first_name, last_name');
      if (!error && data) setEmployees(data);
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(emp =>
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);


  const handleEmployeeSelect = (emp: any) => {
    setFormData(prev => ({ ...prev, employee_id: emp.id }));
    setSearchTerm(`${emp.first_name} ${emp.last_name}`);
    setFilteredEmployees([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('payments').insert([formData]);
    if (error) {
      alert('Insert failed: ' + error.message);
    } else {
      alert('Payment entry saved!');
    }
  };

  const calculateTotalCredit = () => {
    const salary = parseFloat(formData.salary) || 0;
    return (
      salary +
      (salary * parseFloat(formData.certificate_percentage || '0')) / 100 +
      (salary * parseFloat(formData.risk_percentage || '0')) / 100 +
      (salary * parseFloat(formData.manage_percentage || '0')) / 100 +
      parseFloat(formData.kids_pay || '0') +
      parseFloat(formData.marriage_pay || '0') +
      parseFloat(formData.transe_pay || '0')
    ).toFixed(2);
  };

  const calculateTotalDebit = () => {
    const salary = parseFloat(formData.salary) || 0;
    return (
      (salary * parseFloat(formData.retire_percentage || '0')) / 100 +
      parseFloat(formData.marriage_loan || '0') +
      parseFloat(formData.employee_loan || '0') +
      parseFloat(formData.tax || '0') +
      parseFloat(formData.stamp_fee || '0') +
      parseFloat(formData.final_income || '0')
    ).toFixed(2);
  };

  const calculateNetSalary = () => {
    return (parseFloat(calculateTotalCredit()) - parseFloat(calculateTotalDebit())).toFixed(2);
  };

  
  return (
    

    <div dir="rtl" className="max-w-auto mx-auto p-6 bg-white rounded-xl shadow-md text-medium">

      <h2 className="text-2xl font-semibold mb-6 text-center">اضافة و تعديل مفردات الراتب</h2>
      <div className="mb-2 text-center p-0.5">

      {/* Employee Search + ID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative">
        <label className="flex items-center gap-2 relative">
          <span className="w-28">الموظف</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-1 rounded w-full"
            placeholder="اكتب الاسم..."
          />
          {searchTerm && filteredEmployees.length > 0 && (
            <ul className="absolute top-full right-0 w-full bg-white border rounded shadow z-10 max-h-48 overflow-y-auto text-right">
              {filteredEmployees.map(emp => (
                <li
                  key={emp.id}
                  onClick={() => handleEmployeeSelect(emp)}
                  className="px-3 py-1 hover:bg-green-100 cursor-pointer"
                >
                  {emp.first_name} {emp.last_name}
                </li>
              ))}
            </ul>
          )}
        </label>
        <label className="flex items-center gap-2">
          <span className="w-28">رقم الموظف</span>
          <input
            type="text"
            name="employee_id"
            value={formData.employee_id}
            readOnly
            className="border p-1 rounded w-full bg-gray-100"
          />
        </label>
        
      </div>


      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
      <label className="flex items-center gap-2 mt-2">
    <span className="w-28">الشهر</span>
      <input
        type="date"
        name="month"
        value={formData.month ? formData.month.toString() : ''}
        onChange={(e) =>
          setFormData({ ...formData, month: e.target.value })
        }
        className="border p-1 rounded w-full"
      />
      </label>
      
      {/* Degree, Level, Salary */}
   
        {[

          { name: 'degree', label: 'الدرجة' },
          { name: 'level', label: 'المرحلة' },
          { name: 'salary', label: 'الراتب الأساسي' },
          
        ].map(({ name, label }) => (
          <label key={name} className="flex items-center gap-2">
            <span className="w-28">{label}</span>
            <input
              type="text"
              name={name}
              value={formData[name as keyof typeof formData]}
              onChange={handleChange}
              className="border p-1 rounded w-full"
              inputMode="decimal"
              pattern="[0-9]*"
            />
          </label>
        ))}
      </div>

      {/* Credit Section */}
      <div className="mt-4 mb-6 p-1 border-t pt-3 text-sm font-bold text-right text-blue-700">الإضافات</div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
        {[
          { name: 'certificate_percentage', label: 'نسبة الشهادة' },
          { name: 'risk_percentage', label: 'نسبة الخطورة' },
          { name: 'manage_percentage', label: 'مخصصات منصب' },
          { name: 'marriage_pay', label: 'مخصصات زوجية' },
          { name: 'kids_pay', label: 'مخصصات اطفال' },
          { name: 'transe_pay', label: 'مخصصات نقل' },

        ].map(({ name, label }) => (
          <label key={name} className="flex items-center gap-2">
            <span className="w-28">{label}</span>
            <input
              type="text"
              name={name}
              value={formData[name as keyof typeof formData]}
              onChange={handleChange}
              className="border p-1 rounded w-full"
              inputMode="decimal"
              pattern="[0-9]*"
            />
          </label>
        ))}
      </div>
      <p className="mt-4 mb-6 p-2 border-t pt-3 text-lg font-bold text-left text-blue-700">مجموع الإضافات: <strong>{calculateTotalCredit()}</strong></p>

      {/* Debit Section */}
      <div className="mt-4 mb-6 p-2 border-t pt-3 text-lg font-bold text-right text-blue-700">الاستقطاعات</div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
        {[
          { name: 'retire_percentage', label: 'نسبة التقاعد' },
          { name: 'marriage_loan', label: 'قرض الزواج' },
          { name: 'employee_loan', label: 'قرض الموظف' },
          { name: 'tax', label: 'الضريبة' },
          { name: 'stamp_fee', label: 'رسم الطابع' },
          { name: 'final_income', label: 'ايراد نهائي' },
        ].map(({ name, label }) => (
          <label key={name} className="flex items-center gap-2">
            <span className="w-28">{label}</span>
            <input
              type="text"
              name={name}
              value={formData[name as keyof typeof formData]}
              onChange={handleChange}
              className="border p-1 rounded w-full"
              inputMode="decimal"
              pattern="[0-9]*"
            />
          </label>
        ))}
      </div>
      <p className="mt-4 mb-6 p-2 border-t pt-3 text-lg font-bold text-left text-blue-700">مجموع الاستقطاعات: <strong>{calculateTotalDebit()}</strong></p>

      {/* Net Salary */}
      <div className="mt-4 mb-6 p-2 border-t pt-3 text-lg font-bold text-left text-blue-700">
        صافي الراتب: <strong>{calculateNetSalary()}</strong>
      </div>
      <br />

      {[
          { name: 'notes', label: 'ملاحظة' },
        ].map(({ name, label }) => (
          <label key={name} className="flex items-center gap-2">
            <span className="w-28">{label}</span>
            <input
              type="text"
              name={name}
              value={formData[name as keyof typeof formData]}
              onChange={handleChange}
              className="border p-1 rounded w-full"
              inputMode="decimal"
              pattern="[0-9]*"
            />
          </label>

        ))}

        <br />
        
      {/* Submit */}
      <button
        type="submit"
        onClick={handleSubmit}
        className="w-full text-lg py-3 bg-green-700 text-white rounded hover:bg-green-800"
      >
        حفظ القيد
      </button>
      <div>
        <br />
      </div>
      
      <button
    onClick={handleGenerateThisMonth}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    إنشاء مفردات هذا الشهر
  </button>
  
</div>
    </div>
    
  );
}
