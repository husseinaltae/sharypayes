'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function PromotionsPage() {
  const supabase = createClient();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchOffice, setSearchOffice] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newPromotion, setNewPromotion] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: promoData } = await supabase.from('promotions').select('*');
      const { data: emps } = await supabase.from('employees').select('*');
      const { data: officeData } = await supabase.from('offices').select('*');
      setPromotions(promoData || []);
      setEmployees(emps || []);
      setOffices(officeData || []);
    };
    fetchData();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : '—';
  };

  const getEmployeeOffice = (id: string) => {
    const emp = employees.find(e => e.id === id);
    const office = offices.find(o => o.id === emp?.office_id);
    return office?.name || '—';
  };

  const handleFieldChange = (id: string, field: string, value: string | number) => {
    setPromotions(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = async (promo: any) => {
    await supabase
      .from('promotions')
      .update({
        old_degree: promo.old_degree,
        old_level: promo.old_level,
        old_salary: promo.old_salary,
        new_degree: promo.new_degree,
        new_level: promo.new_level,
        new_salary: promo.new_salary,
        due_date: promo.due_date,
        note: promo.note
      })
      .eq('id', promo.id);
    alert('تم حفظ التحديثات');
  };

  const handleInsert = async () => {
    const emp = employees.find(e => e.id === newPromotion.employee_id);
    if (!emp) return alert('يجب اختيار موظف');
  
    const insertData = {
      employee_id: emp.id,
      old_degree: parseInt(newPromotion.old_degree) || null,
      old_level: parseInt(newPromotion.old_level) || null,
      old_salary: parseFloat(newPromotion.old_salary) || null,
      due_date: newPromotion.due_date || null,
      new_degree: newPromotion.new_degree ? parseInt(newPromotion.new_degree) : null,
      new_level: newPromotion.new_level ? parseInt(newPromotion.new_level) : null,
      new_salary: newPromotion.new_salary ? parseFloat(newPromotion.new_salary) : null,
      note: newPromotion.note || null,
    };
  
    const { error } = await supabase.from('promotions').insert(insertData);
  
    if (error) {
      console.error('Insert error:', error);
      return alert('حدث خطأ أثناء الإدخال');
    }
  
    setShowForm(false);
    location.reload();
  };
  

  const handlePrint = () => {
    window.print();
  };

  const filtered = promotions.filter(p => {
    const emp = employees.find(e => e.id === p.employee_id);
    if (searchName.trim() && emp) {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      if (!fullName.includes(searchName.toLowerCase())) return false;
    }
    if (searchOffice.trim() && emp && emp.office_id !== searchOffice) return false;
    if (searchDate.trim() && p.due_date && !p.due_date.startsWith(searchDate)) return false;
    return true;
  });

  return (
    <div className="p-4 text-sm" dir="rtl">
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="بحث بالاسم"
          className="border p-1 rounded"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
        <select
          className="border p-1 rounded"
          value={searchOffice}
          onChange={e => setSearchOffice(e.target.value)}
        >
          <option value="">الدائرة</option>
          {offices.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <input
          type="date"
          className="border p-1 rounded"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={() => setShowForm(true)}
        >
          إضافة ترقية جديدة
        </button>
        <button
          className="bg-gray-600 text-white px-3 py-1 rounded"
          onClick={handlePrint}
        >
          طباعة التقرير
        </button>
      </div>

      <table className="w-full border border-black">
        <thead className="bg-gray-100">
          <tr>
            <th>الدائرة</th>
            <th>الاسم</th>
            <th>الدرجة الحالية</th>
            <th>المرحلة الحالية</th>
            <th>الراتب الحالي</th>
            <th>تاريخ الاستحقاق</th>
            <th>الدرجة الجديدة</th>
            <th>المرحلة الجديدة</th>
            <th>الراتب الجديد</th>
            <th>ملاحظة</th>
            <th>...</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id}>
              <td>{getEmployeeOffice(p.employee_id)}</td>
              <td>{getEmployeeName(p.employee_id)}</td>
              <td>
                <input type="number" className="border px-1 w-16" value={p.old_degree || ''} onChange={e => handleFieldChange(p.id, 'old_degree', e.target.value)} />
              </td>
              <td>
                <input type="number" className="border px-1 w-16" value={p.old_level || ''} onChange={e => handleFieldChange(p.id, 'old_level', e.target.value)} />
              </td>
              <td>
                <input type="number" className="border px-1 w-20" value={p.old_salary || ''} onChange={e => handleFieldChange(p.id, 'old_salary', e.target.value)} />
              </td>
              <td>
                <input type="date" className="border px-1 w-40" value={p.due_date || ''} onChange={e => handleFieldChange(p.id, 'due_date', e.target.value)} />
              </td>
              <td>
                <input type="number" className="border px-1 w-16" value={p.new_degree || ''} onChange={e => handleFieldChange(p.id, 'new_degree', e.target.value)} />
              </td>
              <td>
                <input type="number" className="border px-1 w-16" value={p.new_level || ''} onChange={e => handleFieldChange(p.id, 'new_level', e.target.value)} />
              </td>
              <td>
                <input type="number" className="border px-1 w-20" value={p.new_salary || ''} onChange={e => handleFieldChange(p.id, 'new_salary', e.target.value)} />
              </td>
              <td>
                <input type="text" className="border px-1" value={p.note || ''} onChange={e => handleFieldChange(p.id, 'note', e.target.value)} />
              </td>
              <td>
                <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={() => handleSave(p)}>حفظ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-2xl text-sm">
            <h2 className="text-lg font-bold mb-4">اختر الموظف</h2>

            <input
              type="text"
              placeholder="ابحث عن اسم الموظف"
              className="border p-2 rounded w-full mb-4"
              onChange={e => {
                const search = e.target.value.toLowerCase();
                const match = employees.find(emp =>
                  `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search)
                );
                if (match) {
                  setNewPromotion({ ...newPromotion, employee_id: match.id });
                }
              }}
            />

            {newPromotion.employee_id && (
              <div className="mb-4 text-green-700 font-bold">
                الموظف : {
                  employees.find(e => e.id === newPromotion.employee_id)?.first_name
                } - {
                  employees.find(e => e.id === newPromotion.employee_id)?.last_name
                }
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-4">
              <input type="number" placeholder="الدرجة الحالية" className="border p-2 rounded" onChange={e => setNewPromotion({ ...newPromotion, old_degree: e.target.value })} />
              <input type="number" placeholder="المرحلة الحالية" className="border p-2 rounded" onChange={e => setNewPromotion({ ...newPromotion, old_level: e.target.value })} />
              <input type="number" placeholder="الراتب الحالي" className="border p-2 rounded" onChange={e => setNewPromotion({ ...newPromotion, old_salary: e.target.value })} />
              <input type="number" placeholder="الدرجة الجديدة" className="border p-2 rounded" onChange={e => setNewPromotion({ ...newPromotion, new_degree: e.target.value })} />
              <input type="number" placeholder="المرحلة الجديدة" className="border p-2 rounded" onChange={e => setNewPromotion({ ...newPromotion, new_level: e.target.value })} />
              <input type="number" placeholder="الراتب الجديد" className="border p-2 rounded" onChange={e => setNewPromotion({ ...newPromotion, new_salary: e.target.value })} />
              <input type="date" className="border p-2 rounded" value={newPromotion.due_date || ''} onChange={e => setNewPromotion({ ...newPromotion, due_date: e.target.value })} />
              <input type="text" placeholder="ملاحظة" className="border p-2 rounded col-span-2" onChange={e => setNewPromotion({ ...newPromotion, note: e.target.value })} />
            </div>

            <div className="flex justify-between">
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleInsert}>حفظ</button>
              <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
        
      )}
      <div>
      <div className="mt-10 text-sm w-full">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <label className="font-bold block mb-2">عضو</label>
                  <input
                    type="text"
                    className="border-t border-black w-full text-center focus:outline-none"
                    placeholder="اسم"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-2">عضو</label>
                  <input
                    type="text"
                    className="border-t border-black w-full text-center focus:outline-none"
                    placeholder="اسم"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-2">عضو</label>
                  <input
                    type="text"
                    className="border-t border-black w-full text-center focus:outline-none"
                    placeholder="اسم"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-2">رئيس اللجنة</label>
                  <input
                    type="text"
                    className="border-t border-black w-full text-center focus:outline-none"
                    placeholder="اسم"
                  />
                </div>
              </div>
            </div>
      </div>
    </div>
    
  );
  
}
