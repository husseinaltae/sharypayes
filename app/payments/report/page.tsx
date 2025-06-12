'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface Office {
  name: string;
}

interface Employee {
  id: number | string;
  first_name: string | null;
  last_name: string | null;
  office: Office | null;
}

interface PaymentEntry {
  id: number | string;
  type: 'credit' | 'debit';
  title: string;
  amount: number;
}

interface Payment {
  id: number | string;
  employee: Employee | null;
  payments_entries: PaymentEntry[] | null;
  month?: string | null;
  degree?: string | number | null;
  level?: string | number | null;
  salary: number | null;
  certificate_percentage: number | null;
  risk_percentage: number | null;
  trans_pay: number | null;
  retire_percentage: number | null;
  net_credits?: number | null;
  net_debits?: number | null;
  note?: string | null;
}

export default function PaymentsReportPage() {
  const supabase = createClient();
  const reportRef = useRef(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [officeFilter, setOfficeFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [loadingCopy, setLoadingCopy] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: paymentsData, error: paymentsError }, { data: officesData, error: officesError }] = await Promise.all([
        supabase
          .from('payments')
          .select(`
            *,
            employee:employee_id (
              id,
              first_name,
              last_name,
              office:office_id ( name )
            ),
            payments_entries:payments_entries (
              id, type, title, amount
            )
          `),
        supabase.from('offices').select('name'),
      ]);

      if (paymentsError || officesError) {
        console.error('Error fetching data:', paymentsError || officesError);
        return;
      }

      setPayments(paymentsData || []);
      setOffices(officesData || []);
    };

    fetchData();
  }, [supabase]);

  const filteredPayments = payments.filter((p) => {
    const emp = p.employee;
    const fullName = `${emp?.first_name ?? ''} ${emp?.last_name ?? ''}`;
    const officeName = emp?.office?.name ?? '';
    const matchesMonth = monthFilter ? p.month?.startsWith(monthFilter) : true;
    const matchesName = nameFilter ? fullName.includes(nameFilter) : true;
    const matchesOffice = officeFilter ? officeName.includes(officeFilter) : true;
    return matchesMonth && matchesName && matchesOffice;
  });

  // Helper: get next month in 'YYYY-MM'
  const getNextMonth = (monthStr: string) => {
    if (!monthStr) return null;
    const [year, month] = monthStr.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return `${nextYear}-${nextMonth.toString().padStart(2, '0')}`;
  };

  // Helper: normalize 'YYYY-MM' to 'YYYY-MM-01'
  const normalizeMonth = (m: string) => m.length === 7 ? `${m}-01` : m;

  const handleCopyToNextMonth = async () => {
    if (!monthFilter) {
      alert("يرجى اختيار الشهر الحالي أولاً");
      return;
    }
  
    const currentMonthDate = normalizeMonth(monthFilter);
    const nextMonthStr = getNextMonth(monthFilter);
    const nextMonthDate = nextMonthStr ? normalizeMonth(nextMonthStr) : null;
  
    if (!nextMonthDate) {
      alert("شهر غير صالح");
      return;
    }
  
    const confirmCopy = window.confirm(`هل تريد إنشاء رواتب لشهر ${nextMonthStr}?`);
    if (!confirmCopy) return;
  
    setLoadingCopy(true);
  
    try {
      // 1. Check if payments for the next month already exist
      const { data: existing, error: checkError } = await supabase
        .from('payments')
        .select('id')
        .eq('month', nextMonthDate)
        .limit(1);
  
      if (checkError) throw checkError;
  
      if (existing && existing.length > 0) {
        alert('تم إنشاء رواتب هذا الشهر مسبقًا!');
        setLoadingCopy(false);
        return;
      }
  
      // 2. Fetch current month payments including entries
      let query = supabase
        .from('payments')
        .select(`
          *,
          payments_entries:payments_entries (
            id, type, title, amount
          )
        `)
        .eq('month', currentMonthDate);
  
      if (officeFilter) {
        query = query.in('employee_id', filteredPayments.map(p => p.employee?.id).filter(Boolean));
      }
  
      const { data: currentPayments, error: fetchError } = await query;
  
      if (fetchError) throw fetchError;
  
      if (!currentPayments || currentPayments.length === 0) {
        alert('لا توجد رواتب لهذا الشهر.');
        setLoadingCopy(false);
        return;
      }
  
      // 3. Prepare and insert payments and entries
      const newPayments: any[] = [];
      const newEntries: any[] = [];
  
      for (const oldPayment of currentPayments) {
        const { id: oldId, created_at, payments_entries, ...rest } = oldPayment;
        const newPaymentId = crypto.randomUUID();
  
        newPayments.push({
          ...rest,
          id: newPaymentId,
          month: nextMonthDate,
          created_at: new Date().toISOString(),
        });
  
        if (payments_entries && payments_entries.length > 0) {
          for (const entry of payments_entries) {
            newEntries.push({
              id: crypto.randomUUID(),
              payment_id: newPaymentId,
              type: entry.type,
              title: entry.title,
              amount: entry.amount,
            });
          }
        }
      }
  
      // 4. Insert new payments
      const { error: insertPaymentsError } = await supabase
        .from('payments')
        .insert(newPayments);
  
      if (insertPaymentsError) throw insertPaymentsError;
  
      // 5. Insert new payments_entries
      if (newEntries.length > 0) {
        const { error: insertEntriesError } = await supabase
          .from('payments_entries')
          .insert(newEntries);
  
        if (insertEntriesError) throw insertEntriesError;
      }
  
      alert('تم إنشاء رواتب الشهر القادم بنجاح!');
    } catch (error: any) {
      alert(`حدث خطأ: ${error.message || error}`);
    } finally {
      setLoadingCopy(false);
    }
  };
  

  const today = new Date().toLocaleString();

  const shouldShowData = (officeFilter || nameFilter) && monthFilter;

  const printReport = () => {
    window.print();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto" dir="rtl">
      {/* Global CSS for print to show only the report */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            [data-print-section], [data-print-section] * {
              visibility: visible;
            }
            [data-print-section] {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 print:hidden">

        <select
          className="border p-2"
          value={officeFilter}
          onChange={(e) => setOfficeFilter(e.target.value)}
        >
          <option value="">اختر الدائرة</option>
          {offices.map((office, idx) => (
            <option key={idx} value={office.name}>{office.name}</option>
          ))}
        </select>
        <input
          className="border p-2"
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        />
      </div>

      {/* Report Section */}
      {shouldShowData && (
        <div ref={reportRef} data-print-section style={{ direction: 'rtl' }}>
          {/* Header */}
          <div className="flex justify-between mb-4 text-xl flex-wrap">
            <div className="text-right space-y-1">
              {officeFilter && <div>الدائرة: {officeFilter}</div>}
              {monthFilter && <div>الشهر: {monthFilter}</div>}
            </div>
          </div>

          <h1 className="text-xl font-bold mb-4 text-center">تقرير الرواتب</h1>
          
          {/* Table */}
    <table className="w-full text-sm border mb-4">
      <thead>
        <tr className="bg-gray-200 text-center">
          <th className="border p-2 print:hidden">الدائرة</th>
          <th className="border p-2">الاسم</th>
          <th className="border p-2">الدرجة</th>
          <th className="border p-2">المرحلة</th>
          <th className="border p-2">الراتب</th>
          <th className="border p-2">% الشهادة</th>
          <th className="border p-2">بدل الشهادة</th>
          <th className="border p-2">% الخطورة</th>
          <th className="border p-2">بدل الخطورة</th>
          <th className="border p-2">بدل النقل</th>
          <th className="border p-2">% التقاعد</th>
          <th className="border p-2">استقطاع التقاعد</th>
          <th className="border p-2"> الاستحقاق</th>
          <th className="border p-2">الاستقطاع</th>
          <th className="border p-2 font-bold">الصافي</th>
        </tr>
      </thead>
      <tbody>
    {filteredPayments.map((p, idx) => { // Added idx for fallback key if p.id is not reliable
      const emp = p.employee;
      // Robust calculations: default null/undefined to 0
      const salary = p.salary || 0;
      const certificatePercentage = p.certificate_percentage || 0;
      const riskPercentage = p.risk_percentage || 0;
      const retirePercentage = p.retire_percentage || 0;
      const transPay = p.trans_pay || 0;

      const certificate_pay = (salary * certificatePercentage) / 100;
      const risk_pay = (salary * riskPercentage) / 100;
      const retire_cut = (salary * retirePercentage) / 100;
      const total_credits = salary + certificate_pay + risk_pay + transPay + (p.net_credits || 0);
      const total_debits = retire_cut + (p.net_debits || 0);
      const net_salary = total_credits - total_debits;

      return (
        <React.Fragment key={p.id || `payments-${idx}`}> {/* Added key here */}
          <tr className="text-center">
            <td className="border p-2 print:hidden max-w-[120px] truncate">{emp?.office?.name}</td>
            <td className="border p-2">{emp?.first_name} {emp?.last_name}</td>
            <td className="border p-2">{p.degree}</td>
            <td className="border p-2">{p.level}</td>
            <td className="border p-2">{salary}</td>
            <td className="border p-2">{certificatePercentage}%</td>
            <td className="border p-2">{certificate_pay.toFixed(0)}</td>
            <td className="border p-2">{riskPercentage}%</td>
            <td className="border p-2">{risk_pay.toFixed(0)}</td>
            <td className="border p-2">{transPay}</td>
            <td className="border p-2">{retirePercentage}%</td>
            <td className="border p-2">{retire_cut.toFixed(0)}</td>
            <td className="border p-2">{total_credits.toFixed(0)}</td>
            <td className="border p-2">{total_debits.toFixed(0)}</td>
            <td className="border p-2 font-bold">{net_salary.toFixed(0)}</td>
          </tr>

          {(p.note || (p.payments_entries && p.payments_entries.length > 0)) && (
            <tr>
              <td colSpan={15} className="border p-2 text-xs">
                {p.payments_entries && p.payments_entries.length > 0 && (
                  <div>
                    {p.payments_entries.map((entry) => {
                      const typeLabel = entry.type === 'credit' ? 'دائن' : 'مدين';
                      return `• ${entry.title} (${typeLabel}) ${entry.amount}`;
                    }).join(' ؛ ')}
                  </div>
                )}
                {p.note && <div className="mt-1">ملاحظة: {p.note}</div>}
              </td>
            </tr>
          )}
        </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                    
            <div className="mt-4 text-right font-semibold text-sm">
              عدد الموظفين في التقرير: {filteredPayments.length}
            </div>

          {/* Totals Summary */}
          <div className="mt-6 text-sm border-t pt-4 grid grid-cols-1 sm:grid-cols-5 gap-4 font-semibold text-center">
            <div>إجمالي الراتب: {filteredPayments.reduce((sum, p) => sum + (p.salary || 0), 0).toFixed(0)}</div>
            <div>إجمالي بدل الشهادة: {filteredPayments.reduce((sum, p) => sum + (((p.salary || 0) * (p.certificate_percentage || 0)) / 100 || 0), 0).toFixed(0)}</div>
            <div>إجمالي بدل الخطورة: {filteredPayments.reduce((sum, p) => sum + (((p.salary || 0) * (p.risk_percentage || 0)) / 100 || 0), 0).toFixed(0)}</div>
            <div>إجمالي استقطاع التقاعد: {filteredPayments.reduce((sum, p) => sum + (((p.salary || 0) * (p.retire_percentage || 0)) / 100 || 0), 0).toFixed(0)}</div>
            <div>اجمالي الدائن: {filteredPayments.reduce((sum, p) => sum + (p.net_credits || 0), 0).toFixed(0)}</div>
            <div>اجمالي المدين: {filteredPayments.reduce((sum, p) => sum + (p.net_debits || 0), 0).toFixed(0)}</div>
            <div>اجمالي الاستحقاق: {filteredPayments.reduce((sum, p) => {
              const salary = p.salary || 0;
              const certPercentage = p.certificate_percentage || 0;
              const riskPercentage = p.risk_percentage || 0;
              const transPay = p.trans_pay || 0;
              const cert = (salary * certPercentage) / 100;
              const risk = (salary * riskPercentage) / 100;
              const credits = salary + cert + risk + transPay + (p.net_credits || 0);
              return sum + credits;
            }, 0).toFixed(0)}</div>
            <div>اجمالي الاستقطاع: {filteredPayments.reduce((sum, p) => {
              const salary = p.salary || 0;
              const retirePercentage = p.retire_percentage || 0;
              const retire = (salary * retirePercentage) / 100;
              const debits = retire + (p.net_debits || 0);
              return sum + debits;
            }, 0).toFixed(0)}</div>
            <div>الصافي الكلي: {filteredPayments.reduce((sum, p) => {
              const salary = p.salary || 0;
              const certPercentage = p.certificate_percentage || 0;
              const riskPercentage = p.risk_percentage || 0;
              const retirePercentage = p.retire_percentage || 0;
              const transPay = p.trans_pay || 0;
              const cert = (salary * certPercentage) / 100;
              const risk = (salary * riskPercentage) / 100;
              const retire = (salary * retirePercentage) / 100;
              const credits = salary + cert + risk + transPay + (p.net_credits || 0);
              const debits = retire + (p.net_debits || 0);
              return sum + (credits - debits);
            }, 0).toFixed(0)}</div>
          </div>

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
      )}


{/* Print + Actions Buttons - Fully Responsive */}
<div className="fixed bottom-4 right-4 z-50 print:hidden flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 sm:w-auto">
  <Link
    href="/payments/new"
    className="bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto"
  >
    إضافة راتب جديد
  </Link>
  <Link
    href="/payments/edit"
    className="bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto"
  >
    تعديل راتب
  </Link>
  <button
    onClick={printReport}
    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full sm:w-auto"
    title="طباعة التقرير"
  >
    طباعة التقرير
  </button>
  <button
    onClick={handleCopyToNextMonth}
    disabled={loadingCopy}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition w-full sm:w-auto"
  >
    {loadingCopy ? "جاري الإنشاء..." : "إنشاء رواتب الشهر القادم"}
  </button>
</div>


    </div>
  );
}