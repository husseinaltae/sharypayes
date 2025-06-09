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
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeDropdown, setEmployeeDropdown] = useState<any[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<{ [key: string]: string }>({});
  const [users, setUsers] = useState<any[]>([]);
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

  const handleInsertOrUpdate = async () => {
    if (!newPromotion.employee_id) {
      alert('الرجاء اختيار موظف.');
      return;
    }
  
    let error = null;
  
    if (newPromotion.id) {
      // Update logic
      const updatePayload = {
        employee_id: newPromotion.employee_id,
        old_degree: newPromotion.old_degree ?? null,
        old_level: newPromotion.old_level ?? null,
        old_salary: newPromotion.old_salary ?? null,
        new_degree: newPromotion.new_degree ?? null,
        new_level: newPromotion.new_level ?? null,
        new_salary: newPromotion.new_salary ?? null,
        due_date: newPromotion.due_date?.trim() || null,
        note: newPromotion.note?.trim() || null,
      };
  
      const { error: updateError } = await supabase
        .from('promotions')
        .update(updatePayload)
        .eq('id', newPromotion.id);
  
      error = updateError;
    } else {
      // Insert logic
      const insertPayload = {
        employee_id: newPromotion.employee_id,
        old_degree: newPromotion.old_degree ?? null,
        old_level: newPromotion.old_level ?? null,
        old_salary: newPromotion.old_salary ?? null,
        new_degree: newPromotion.new_degree ?? null,
        new_level: newPromotion.new_level ?? null,
        new_salary: newPromotion.new_salary ?? null,
        due_date: newPromotion.due_date?.trim() || null,
        note: newPromotion.note?.trim() || null,
      };
  
      const { error: insertError } = await supabase
        .from('promotions')
        .insert([insertPayload]);
  
      error = insertError;
    }
  
    if (error) {
      console.error('Database error:', error.message);
      alert('حدث خطأ أثناء الحفظ: ' + error.message);
      return;
    }
  
    alert('تم الحفظ بنجاح');
    setShowForm(false);
    setNewPromotion({ employee_id: '' });
  
    const { data } = await supabase.from('promotions').select('*');
    setPromotions(data || []);
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

  const shouldShowData = searchDate && (searchName || searchOffice);

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      console.error("Error deleting user:", error.message);
    } else {
      const { data, error: fetchError } = await supabase.from("users").select("*");
      if (fetchError) {
        console.error("Error fetching users:", fetchError.message);
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

  const handleEdit = (promotion: Promotion) => {
    setNewPromotion({
      id: promotion.id,
      employee_id: promotion.employee_id || '',
      old_degree: promotion.old_degree ?? '',
      old_level: promotion.old_level ?? '',
      old_salary: promotion.old_salary ?? '',
      new_degree: promotion.new_degree ?? '',
      new_level: promotion.new_level ?? '',
      new_salary: promotion.new_salary ?? '',
      due_date: promotion.due_date ?? '',
      note: promotion.note ?? '',
    });
    setShowForm(true);
  };
  
  return (
    <div className="p-4 text-sm" dir="rtl">
      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="بحث بالاسم"
          className="border p-2 rounded flex-grow min-w-[180px]"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          aria-label="بحث بالاسم"
        />
        <select
          className="border p-2 rounded min-w-[150px]"
          value={searchOffice}
          onChange={e => setSearchOffice(e.target.value)}
          aria-label="اختر الدائرة"
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
          aria-label="اختر التاريخ"
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap"
          onClick={() => {
            setNewPromotion({
              id: '',
              employee_id: '',
              old_degree: '',
              old_level: '',
              old_salary: '',
              new_degree: '',
              new_level: '',
              new_salary: '',
              due_date: '',
              note: '',
            });
            setEmployeeSearch('');
            setEmployeeDropdown([]);
            setShowForm(true);
          }}
          aria-haspopup="dialog"
          aria-expanded={showForm}
        >
          إضافة ترقية جديدة
        </button>
  
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded whitespace-nowrap"
          onClick={printTable}
        >
          طباعة التقرير
        </button>
      </div>
  
      {/* Modal Form */}
      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-2xl text-sm max-h-[90vh] overflow-auto">
            <h2 id="modal-title" className="text-lg font-bold mb-4">اختر الموظف</h2>
  
            {/* Employee Search Input */}
            <input
              type="text"
              placeholder="ابحث عن اسم الموظف"
              className="border p-2 rounded w-full mb-2"
              value={employeeSearch}
              onChange={e => {
                const val = e.target.value;
                setEmployeeSearch(val);
  
                if (val.trim() === '') {
                  setEmployeeDropdown([]);
                  setNewPromotion((prev: typeof newPromotion) => ({ ...prev, employee_id: '' }));
                  return;
                }
  
                const filtered = employees.filter(emp =>
                  `${emp.first_name} ${emp.last_name}`
                    .toLowerCase()
                    .includes(val.toLowerCase())
                );
                setEmployeeDropdown(filtered);
              }}
              aria-autocomplete="list"
              aria-controls="employee-listbox"
              aria-expanded={employeeDropdown.length > 0}
            />
  
            {/* Employee Dropdown */}
            {employeeDropdown.length > 0 && (
              <ul
                id="employee-listbox"
                role="listbox"
                className="border rounded max-h-48 overflow-auto mb-4"
              >
                {employeeDropdown.map(emp => (
                  <li
                    key={emp.id}
                    role="option"
                    aria-selected={newPromotion.employee_id === emp.id}
                    className={`p-2 cursor-pointer hover:bg-gray-200 ${
                      newPromotion.employee_id === emp.id ? 'bg-gray-300 font-bold' : ''
                    }`}
                    onClick={() => {
                      setNewPromotion((prev: typeof newPromotion) => ({ ...prev, employee_id: emp.id }));
                      setEmployeeSearch(`${emp.first_name} ${emp.last_name}`);
                      setEmployeeDropdown([]);
                    }}
                  >
                    {emp.first_name} {emp.last_name}
                  </li>
                ))}
              </ul>
            )}
  
            {/* Selected Employee Display */}
            {newPromotion.employee_id && (
              <div className="mb-4 text-green-700 font-bold">
                الموظف: {(() => {
                  const emp = employees.find(e => e.id === newPromotion.employee_id);
                  return emp ? `${emp.first_name} ${emp.last_name}` : '';
                })()}
              </div>
            )}
  
            {/* Promotion Fields */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="old_degree" className="block font-semibold mb-1">الدرجة الحالية</label>
                <input
                  id="old_degree"
                  type="number"
                  placeholder="الدرجة الحالية"
                  className="border p-2 rounded w-full"
                  value={newPromotion.old_degree || ''}
                  onChange={e => setNewPromotion((prev: typeof newPromotion) => ({ ...prev, old_degree: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="old_level" className="block font-semibold mb-1">المرحلة الحالية</label>
                <input
                  id="old_level"
                  type="number"
                  placeholder="المرحلة الحالية"
                  className="border p-2 rounded w-full"
                  value={newPromotion.old_level || ''}
                  onChange={e => setNewPromotion((prev: typeof newPromotion) => ({ ...prev, old_level: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="old_salary" className="block font-semibold mb-1">الراتب الحالي</label>
                <input
                  id="old_salary"
                  type="number"
                  placeholder="الراتب الحالي"
                  className="border p-2 rounded w-full"
                  value={newPromotion.old_salary || ''}
                  onChange={e => setNewPromotion((prev: typeof newPromotion) => ({ ...prev, old_salary: e.target.value }))}
                />
              </div>
  
              <div>
                <label htmlFor="new_degree" className="block font-semibold mb-1">الدرجة الجديدة</label>
                <input
                  id="new_degree"
                  type="number"
                  placeholder="الدرجة الجديدة"
                  className="border p-2 rounded w-full"
                  value={newPromotion.new_degree || ''}
                  onChange={e => setNewPromotion((prev: typeof newPromotion) => ({ ...prev, new_degree: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="new_level" className="block font-semibold mb-1">المرحلة الجديدة</label>
                <input
                  id="new_level"
                  type="number"
                  placeholder="المرحلة الجديدة"
                  className="border p-2 rounded w-full"
                  value={newPromotion.new_level || ''}
                  onChange={e => setNewPromotion((prev: typeof newPromotion) => ({ ...prev, new_level: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="new_salary" className="block font-semibold mb-1">الراتب الجديد</label>
                <input
                  id="new_salary"
                  type="number"
                  placeholder="الراتب الجديد"
                  className="border p-2 rounded w-full"
                  value={newPromotion.new_salary || ''}
                  onChange={e => setNewPromotion((prev: typeof newPromotion) => ({ ...prev, new_salary: e.target.value }))}
                />
              </div>
  
              <div>
                <label htmlFor="due_date" className="block font-semibold mb-1">تاريخ الاستحقاق</label>
                <input
                  id="due_date"
                  type="date"
                  className="border p-2 rounded w-full"
                  value={newPromotion.due_date || ''}
                  onChange={e => setNewPromotion((prev: typeof newPromotion) => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="note" className="block font-semibold mb-1">ملاحظة</label>
                <textarea
                  id="note"
                  placeholder="ملاحظة"
                  className="border p-2 rounded w-full"
                  rows={3}
                  value={newPromotion.note || ''}
                  onChange={e => setNewPromotion((prev: typeof newPromotion) => ({ ...prev, note: e.target.value }))}
                />
              </div>
            </div>
  
            {/* Buttons */}
            <div className="flex justify-between">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleInsertOrUpdate}
                disabled={!newPromotion.employee_id}
                aria-disabled={!newPromotion.employee_id}
              >
                {newPromotion.id ? 'تحديث' : 'حفظ'}
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowForm(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Promotions Table or Messages */}
      {shouldShowData ? (
        filteredPromotions.length > 0 ? (
          <div ref={reportRef} className="overflow-auto border border-gray-300 rounded shadow">
            <table className="min-w-[900px] w-full border-collapse border text-center" dir="rtl">
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
                  <th className="border border-black p-2">تعديل</th>
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
                      <td className="border border-black p-1 text-center">{p.due_date ? new Date(p.due_date).toLocaleDateString() : ''}</td>
                      <td className="border border-black p-1 text-center">{p.new_degree ?? ''}</td>
                      <td className="border border-black p-1 text-center">{p.new_level ?? ''}</td>
                      <td className="border border-black p-1 text-center">{p.new_salary ?? ''}</td>
                      <td className="border border-black p-1">{p.note ?? ''}</td>
                      <td className="border border-black p-1">
                        <button
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          onClick={() => {
                            setNewPromotion({ ...p });
                            const emp = getEmployee(p.employee_id);
                            setEmployeeSearch(emp ? `${emp.first_name} ${emp.last_name}` : '');
                            setShowForm(true);
                          }}
                          aria-label={`تعديل ترقية الموظف ${emp?.first_name} ${emp?.last_name}`}
                        >
                          تعديل
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
          <div className="text-center p-6 text-gray-700 font-semibold">
            لا توجد ترقيات مطابقة للمعايير.
          </div>
        )
      ) : (
        <div className="text-center p-6 text-gray-500 italic">
          يرجى اختيار دائرة أو اسم موظف أو تاريخ للبحث.
        </div>
      )}


    </div>
  );
}  