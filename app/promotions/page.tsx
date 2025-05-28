'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type Promotion = {
  id: string;
  employee_id: string;
  old_degree?: number;
  old_level?: number;
  old_salary?: number;
  new_degree?: number;
  new_level?: number;
  new_salary?: number;
  due_date?: string;
  note?: string;
};

export default function PromotionsPage() {
  const supabase = createClient();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchOffice, setSearchOffice] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newPromotion, setNewPromotion] = useState<any>({});
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: promoData }, { data: empData }, { data: officeData }] = await Promise.all([
        supabase.from('promotions').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('offices').select('*'),
      ]);
      setPromotions(promoData || []);
      setEmployees(empData || []);
      setOffices(officeData || []);
    };
    fetchData();
  }, []);

  

  const getEmployee = (id: string) => employees.find(e => e.id === id);
  const getOfficeName = (id: string) => offices.find(o => o.id === id)?.name || '—';

  const handleFieldChange = (id: string, field: keyof Promotion, value: string | number) => {
    setPromotions(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveAll = async () => {
    try {
      for (const promo of promotions) {
        const { error } = await supabase
          .from('promotions')
          .update({
            old_degree: promo.old_degree || null,
            old_level: promo.old_level || null,
            old_salary: promo.old_salary || null,
            new_degree: promo.new_degree || null,
            new_level: promo.new_level || null,
            new_salary: promo.new_salary || null,
            due_date: promo.due_date || null,
            note: promo.note || null,
          })
          .eq('id', promo.id);

        if (error) {
          console.error('Error saving promotion', promo.id, error);
          alert(`حدث خطأ أثناء حفظ الترقية: ${promo.id}`);
          return;
        }
      }
      alert('تم حفظ جميع التحديثات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ غير متوقع أثناء الحفظ');
    }
  };

  const handleInsert = async () => {
    const emp = getEmployee(newPromotion.employee_id);
    if (!emp) return alert('يجب اختيار موظف');
  
    const insertData = {
      ...newPromotion,
      old_degree: parseInt(newPromotion.old_degree) || null,
      old_level: parseInt(newPromotion.old_level) || null,
      old_salary: parseFloat(newPromotion.old_salary) || null,
      new_degree: parseInt(newPromotion.new_degree) || null,
      new_level: parseInt(newPromotion.new_level) || null,
      new_salary: parseFloat(newPromotion.new_salary) || null,
    };
  
    const { error } = await supabase.from('promotions').insert(insertData);
    if (error) {
      console.error(error);
      return alert('حدث خطأ أثناء الإدخال');
    }
  
    alert('تم الحفظ بنجاح');  // <-- Your success message
  
    setShowForm(false);
    // Instead of location.reload(), fetch promotions again:
    const { data: promoData } = await supabase.from('promotions').select('*');
    setPromotions(promoData || []);
  };
  
  const printTable = () => {
    if (!reportRef.current) return;
    const printContent = reportRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // restore interactivity
  };

  const filteredPromotions = promotions.filter(p => {
    const emp = getEmployee(p.employee_id);
    if (!emp) return false;
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();

    const matchName = searchName.trim() ? fullName.includes(searchName.toLowerCase()) : false;
    const matchOffice = searchOffice.trim() ? emp.office_id === searchOffice : false;
    const matchDate = searchDate.trim() ? p.due_date?.startsWith(searchDate) : false;

    const showByName = matchName && matchDate;
    const showByOffice = matchOffice && matchDate;

    return showByName || showByOffice;
  });

  const shouldShowData = (searchDate && (searchName || searchOffice));
  const deleteUser = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      console.error("Error deleting user:", error.message);
    } else {
      // Refresh the data after deletion
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        setUsers(data);
      }
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الترقية؟')) return;
  
    const { error } = await supabase.from('promotions').delete().eq('id', id);
  
    if (error) {
      alert('حدث خطأ أثناء الحذف');
      console.error('Delete error:', error);
    } else {
      setPromotions(prev => prev.filter(p => p.id !== id));
      alert('تم الحذف بنجاح');
    }
  };



  return (
    <div className="p-4 text-sm" dir="rtl">
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="بحث بالاسم"
          className="border p-2 rounded flex-grow min-w-[180px]"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
        <select
          className="border p-2 rounded min-w-[150px]"
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
          className="border p-2 rounded min-w-[150px]"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap"
          onClick={() => setShowForm(true)}
        >
          إضافة ترقية جديدة
        </button>
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
              <textarea
  placeholder="ملاحظة"
  className="border p-2 rounded col-span-2"
  rows={3}
  onChange={e => setNewPromotion({ ...newPromotion, note: e.target.value })}
/>

            </div>

            <div className="flex justify-between">
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleInsert}>حفظ</button>
              <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
        
      )}
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded whitespace-nowrap"
          onClick={printTable}
        >
          طباعة التقرير
        </button>

      </div>

      {shouldShowData ? (
        filteredPromotions.length > 0 ? (
          <div ref={reportRef} className="overflow-auto border border-gray-300 rounded shadow">
            <table className="min-w-[900px] w-full border-collapse bordertext-center" dir="rtl">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border border-black p-2">الدائرة</th>
                  <th className="border border-black p-2">الاسم</th>
                  <th className="border border-black p-2">الدرجة الحالية</th>
                  <th className="border border-black p-2">المرحلة الحالية</th>
                  <th className="border border-black p-2">الراتب الحالي</th>
                  <th className="border border-black p-2">تاريخ الاستحقاق</th>
                  <th className="border border-black p-2">الدرجة الجديدة</th>
                  <th className="border border-black p-2">المرحلة الجديدة</th>
                  <th className="border border-black p-2">الراتب الجديد</th>
                  <th className="border border-black p-2">ملاحظة</th>
                  <th className="border border-black p-2">حذف</th>
                </tr>
              </thead>
              <tbody>
                  {filteredPromotions.map(p => {
                    const emp = getEmployee(p.employee_id);
                    return (
                      <tr key={p.id}>
                        <td className="border border-black p-1">{getOfficeName(emp?.office_id)}</td>
                        <td className="border border-black p-1">{`${emp?.first_name} ${emp?.last_name}`}</td>
                        <td className="border border-black p-1 text-center">{p.old_degree ?? ''}</td>
                        <td className="border border-black p-1 text-center">{p.old_level ?? ''}</td>
                        <td className="border border-black p-1 text-center">{p.old_salary ?? ''}</td>
                        <td className="border border-black p-1 text-center">{p.due_date ?? ''}</td>
                        <td className="border border-black p-1 text-center">{p.new_degree ?? ''}</td>
                        <td className="border border-black p-1 text-center">{p.new_level ?? ''}</td>
                        <td className="border border-black p-1 text-center">{p.new_salary ?? ''}</td>
                        <td className="border border-black p-1">{p.note ?? ''}</td>
                        <td className="border border-black p-1 text-center">
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                            onClick={() => handleDelete(p.id)}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
            {/* Committee members area - example */}
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
        ) : (
          <p className="text-center mt-6">لا توجد ترقيات مطابقة للبحث.</p>
        )
      ) : (
        <p className="text-center mt-6 text-gray-600">
          الرجاء اختيار دائرة أو اسم موظف مع تاريخ للاستعلام عن الترقيات.
        </p>
      )}
    </div>
  );
}
