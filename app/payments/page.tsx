'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function PaymentsPage() {
  const supabase = createClient();
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [entryList, setEntryList] = useState<any[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase.from('employees').select('*');
      setEmployees(data || []);
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const addEntry = () => {
    setEntryList([...entryList, { type: 'credit', title: '', amount: 0 }]);
  };

  const removeEntry = (index: number) => {
    setEntryList(entryList.filter((_, i) => i !== index));
  };

  const handleEntryChange = (index: number, field: string, value: any) => {
    const updated = [...entryList];
    updated[index][field] = value;
    setEntryList(updated);
  };

  const handleSelectEmployee = (employee: any) => {
    setFormData((prev: any) => ({
      ...prev,
      employee_id: employee.id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
    }));
    setEmployeeSearch('');
    setDropdownOpen(false);
  };

  const totalCredits = entryList
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + +e.amount, 0);

  const totalDebits = entryList
    .filter(e => e.type === 'debit')
    .reduce((sum, e) => sum + +e.amount, 0);

  const s = +formData.salary || 0;
  const cp = +formData.certificate_percentage || 0;
  const rp = +formData.risk_percentage || 0;
  const tp = +formData.trans_pay || 0;
  const rpct = +formData.retire_percentage || 0;
  const certificatePay = (s * cp) / 100;
  const riskPay = (s * rp) / 100;
  const retireCut = (s * rpct) / 100;
  const netSalary = s + certificatePay + riskPay + tp + totalCredits - (retireCut + totalDebits);
  const handleSave = async () => {
    if (!formData.employee_id || !formData.month || !s) {
      alert('الرجاء التأكد من إدخال الموظف، الشهر، والراتب.');
      return;
    }

    const insertPayload = {
      degree: +formData.degree || 0,
      level: +formData.level || 0,
      salary: s,
      employee_id: formData.employee_id,
      certificate_percentage: cp,
      risk_percentage: rp,
      trans_pay: tp,
      retire_percentage: rpct,
      created_at: new Date().toISOString(),
      net_credits: totalCredits,
      net_debits: totalDebits,
      net_salary: netSalary,
      certificate_pay: certificatePay,
      risk_pay: riskPay,
      retire_cut: retireCut,
      note: formData.note || '',
      month: `${formData.month}-01`,
    };

    const { data: payment, error } = await supabase
      .from('payments')
      .insert([insertPayload])
      .select()
      .single();

    if (error || !payment) {
      alert('حدث خطأ أثناء الحفظ: ' + error?.message);
      return;
    }

    const entries = entryList.map(e => ({
      ...e,
      payment_id: payment.id,
    }));

    const { error: entryError } = await supabase.from('payments_entries').insert(entries);

    if (entryError) {
      alert('حدث خطأ أثناء حفظ التفاصيل: ' + entryError.message);
      return;
    }

    alert('تم حفظ الراتب والتفاصيل بنجاح.');
    setFormData({});
    setEntryList([]);
    setEmployeeSearch('');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto text-sm" dir="rtl">
      <h1 className="text-lg font-bold mb-4">إدخال بيانات راتب شهري</h1>

      <input
        className="border p-1 px-2 w-full mb-2 rounded text-sm"
        placeholder="ابحث عن موظف"
        value={employeeSearch}
        onChange={e => {
          setEmployeeSearch(e.target.value);
          setDropdownOpen(true);
        }}
      />

      {dropdownOpen && employeeSearch && (
        <div className="border max-h-32 overflow-y-auto mb-2 bg-white z-10 rounded shadow">
          {filteredEmployees.map(e => (
            <div
              key={e.id}
              className="p-1 px-2 hover:bg-gray-200 cursor-pointer text-sm"
              onClick={() => handleSelectEmployee(e)}
            >
              {e.first_name} {e.last_name}
            </div>
          ))}
        </div>
      )}

      {formData.employee_name && (
        <div className="mb-2 text-sm">
          الموظف: <strong>{formData.employee_name}</strong>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label className="block mb-1 text-xs font-medium">الشهر</label>
          <input
            type="month"
            className="border p-1 px-2 w-full rounded text-sm"
            value={formData.month || ''}
            onChange={e => setFormData({ ...formData, month: e.target.value })}
          />
        </div>
        <div>
          <label className="block mb-1 text-xs font-medium">الدرجة</label>
          <input
            type="number"
            className="border p-1 px-2 w-full rounded text-sm"
            value={formData.degree || ''}
            onChange={e => setFormData({ ...formData, degree: e.target.value })}
          />
        </div>
        <div>
          <label className="block mb-1 text-xs font-medium">المرحلة</label>
          <input
            type="number"
            className="border p-1 px-2 w-full rounded text-sm"
            value={formData.level || ''}
            onChange={e => setFormData({ ...formData, level: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'الراتب الأساسي', key: 'salary' },
          { label: 'نسبة الشهادة (%)', key: 'certificate_percentage' },
          { label: 'نسبة الخطورة (%)', key: 'risk_percentage' },
          { label: 'بدل النقل', key: 'trans_pay' },
          { label: 'نسبة التقاعد (%)', key: 'retire_percentage' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block mb-1 text-xs font-medium">{label}</label>
            <input
              className="border p-1 px-2 w-full rounded text-sm"
              type="number"
              value={formData[key] || ''}
              onChange={e => setFormData({ ...formData, [key]: +e.target.value })}
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-xs font-medium">ملاحظات</label>
        <textarea
          className="border p-1 px-2 w-full rounded text-sm"
          value={formData.note || ''}
          onChange={e => setFormData({ ...formData, note: e.target.value })}
        />
      </div>

      <div className="border-t pt-4 mb-4">
        <h2 className="text-base font-semibold mb-2">تفاصيل دائن / مدين</h2>
        {entryList.map((entry, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
            <select
              className="border p-1 w-full text-sm rounded"
              value={entry.type}
              onChange={e => handleEntryChange(idx, 'type', e.target.value)}
            >
              <option value="credit">دائن</option>
              <option value="debit">مدين</option>
            </select>
            <input
              className="border p-1 px-2 text-sm rounded"
              placeholder="العنوان"
              value={entry.title}
              onChange={e => handleEntryChange(idx, 'title', e.target.value)}
            />
            <input
              className="border p-1 px-2 text-sm rounded"
              type="number"
              placeholder="القيمة"
              value={entry.amount}
              onChange={e => handleEntryChange(idx, 'amount', +e.target.value)}
            />
            <button
              className="bg-red-500 text-white text-sm px-2 rounded"
              onClick={() => removeEntry(idx)}
            >
              X
            </button>
          </div>
        ))}
        <button
          className="bg-blue-500 text-white text-sm px-4 py-1 rounded"
          onClick={addEntry}
        >
          + إضافة إدخال
        </button>
      </div>

      <div className="text-sm mb-4 space-y-1">
        <div>الإجمالي الدائن: {totalCredits}</div>
        <div>الإجمالي المدين: {totalDebits}</div>
        <div>
          <strong>صافي الراتب: {netSalary.toFixed(2)}</strong>
        </div>
      </div>

      <button
        className="bg-green-600 text-white px-4 py-2 text-sm rounded"
        onClick={handleSave}
      >
        حفظ البيانات
      </button>
    </div>
  );
}
