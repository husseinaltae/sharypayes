'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import html2pdf from 'html2pdf.js';

export default function PaymentsReportPage() {
  const supabase = createClient();
  const reportRef = useRef(null);
  const [payments, setPayments] = useState([]);
  const [officeFilter, setOfficeFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [committee, setCommittee] = useState(['', '', '', '']);
  const [offices, setOffices] = useState([]);

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
              office:office_id (
                name
              )
            ),
            payments_entries:payments_entries (
              id,
              type,
              title,
              amount
            )
          `),
        supabase
          .from('offices')
          .select('name')
      ]);

      if (paymentsError || officesError) {
        console.error('Error fetching data:', paymentsError || officesError);
        return;
      }

      setPayments(paymentsData || []);
      setOffices(officesData || []);
    };

    fetchData();
  }, []);

  const filteredPayments = payments.filter(p => {
    const emp = p.employee;
    const fullName = `${emp?.first_name ?? ''} ${emp?.last_name ?? ''}`;
    const officeName = emp?.office?.name ?? '';
    const matchesMonth = monthFilter ? p.updated_at?.startsWith(monthFilter) : true;
    const matchesName = nameFilter ? fullName.includes(nameFilter) : true;
    const matchesOffice = officeFilter ? officeName.includes(officeFilter) : true;

    return matchesMonth && matchesName && matchesOffice;
  });

  const exportToPDF = () => {
    if (!reportRef.current) return;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: 'payments_report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'landscape',
      },
    };

    html2pdf().from(reportRef.current).set(opt).save();
  };

  const today = new Date().toLocaleString();

  const shouldShowData = officeFilter || nameFilter;
  const entrySummary = {};

    filteredPayments.forEach(p => {
      p.payments_entries?.forEach(entry => {
        const key = `${entry.title}-${entry.type}`;
        if (!entrySummary[key]) {
          entrySummary[key] = {
            title: entry.title,
            type: entry.type,
            amount: 0,
          };
        }
        entrySummary[key].amount += Number(entry.amount || 0);
      });
    });

    const summarizedEntries = Object.values(entrySummary);

    let totalCredits = 0;
    let totalDebits = 0;
    let totalRetire = 0;
    let entryCredits = 0;
    let entryDebits = 0;

filteredPayments.forEach(p => {
  const cert = (p.salary * p.certificate_percentage) / 100;
  const risk = (p.salary * p.risk_percentage) / 100;
  const retire = (p.salary * p.retire_percentage) / 100;
  const credits = p.salary + cert + risk + p.trans_pay + (p.net_credits || 0);
  const debits = retire + (p.net_debits || 0);

  totalCredits += credits;
  totalDebits += debits;
  totalRetire += retire;

  // Summing payments_entries by type
  p.payments_entries?.forEach(entry => {
    if (entry.type === 'credit') entryCredits += Number(entry.amount) || 0;
    else if (entry.type === 'debit') entryDebits += Number(entry.amount) || 0;
  });
});




  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {/* Filters */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          className="border p-2"
          placeholder="اسم الموظف"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
        />
        <select
          className="border p-2"
          value={officeFilter}
          onChange={e => setOfficeFilter(e.target.value)}
        >
          <option value="">اختر الدائرة</option>
          {offices.map((office, idx) => (
            <option key={idx} value={office.name}>
              {office.name}
            </option>
          ))}
        </select>
        <input
          className="border p-2"
          type="month"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
        />
      </div>

      {shouldShowData && (
        <div ref={reportRef} style={{ direction: 'rtl' }}>
          {/* Header */}
          <div className="flex justify-between mb-4 text-sm">
            <div className="text-right">
              {officeFilter && <div>الدائرة: {officeFilter}</div>}
              {monthFilter && <div>الشهر: {monthFilter}</div>}
            </div>
            <div>{today}</div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold mb-4 text-center">تقرير الرواتب</h1>

          {/* Table */}
          <table className="w-full text-sm border mb-4">
            <thead>
              <tr className="bg-gray-200 text-center">
                <th className="border p-2">الاسم</th>
                <th className="border p-2 print:hidden">الدائرة</th>
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
                <th className="border p-2">الإجمالي المستحق</th>
                <th className="border p-2">الاستقطاعات</th>
                <th className="border p-2 font-bold">الصافي</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => {
                const emp = p.employee;
                const certificate_pay = (p.salary * p.certificate_percentage) / 100;
                const risk_pay = (p.salary * p.risk_percentage) / 100;
                const retire_cut = (p.salary * p.retire_percentage) / 100;
                const total_credits = p.salary + certificate_pay + risk_pay + p.trans_pay + p.net_credits;
                const total_debits = retire_cut + p.net_debits;
                const net_salary = total_credits - total_debits;

                return (
                  <>
                    <tr key={p.id} className="text-center">
                      <td className="border p-2">{emp?.first_name} {emp?.last_name}</td>
                      <td className="border p-2 print:hidden">{emp?.office?.name}</td>
                      <td className="border p-2">{p.degree}</td>
                      <td className="border p-2">{p.level}</td>
                      <td className="border p-2">{p.salary}</td>
                      <td className="border p-2">{p.certificate_percentage}%</td>
                      <td className="border p-2">{certificate_pay.toFixed(0)}</td>
                      <td className="border p-2">{p.risk_percentage}%</td>
                      <td className="border p-2">{risk_pay.toFixed(0)}</td>
                      <td className="border p-2">{p.trans_pay}</td>
                      <td className="border p-2">{p.retire_percentage}%</td>
                      <td className="border p-2">{retire_cut.toFixed(0)}</td>
                      <td className="border p-2">{total_credits.toFixed(0)}</td>
                      <td className="border p-2">{total_debits.toFixed(0)}</td>
                      <td className="border p-2 font-bold">{net_salary.toFixed(0)}</td>
                    </tr>
                    {(p.note || p.payments_entries?.length > 0) && (
                      <tr>
                        <td colSpan={15} className="border p-2 text-xs">
                          {p.payments_entries?.length > 0 && (
                            <div>
                              {p.payments_entries.map(entry => {
                                const typeLabel = entry.type === 'credit' ? 'دائن' : 'مدين';
                                return `• ${entry.title} (${typeLabel}) ${entry.amount}`;
                              }).join(' ؛ ')}
                            </div>
                          )}
                          {p.note && <div className="mt-1">ملاحظة: {p.note}</div>}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
          {/* Totals Summary */}
                      
            <div className="mt-6 text-sm border-t pt-4 grid grid-cols-5 gap-4 font-semibold text-center">
              <div>إجمالي الراتب: {filteredPayments.reduce((sum, p) => sum + (p.salary || 0), 0).toFixed(0)}</div>
              <div>إجمالي بدل الشهادة: {filteredPayments.reduce((sum, p) => sum + ((p.salary * p.certificate_percentage) / 100 || 0), 0).toFixed(0)}</div>
              <div>إجمالي بدل الخطورة: {filteredPayments.reduce((sum, p) => sum + ((p.salary * p.risk_percentage) / 100 || 0), 0).toFixed(0)}</div>
              <div>إجمالي بدل النقل: {filteredPayments.reduce((sum, p) => sum + (p.trans_pay || 0), 0).toFixed(0)}</div>
              <div>إجمالي التقاعد: {filteredPayments.reduce((sum, p) => sum + ((p.salary * p.retire_percentage) / 100 || 0), 0).toFixed(0)}</div>
              <div>إجمالي الدائن : {entryCredits.toFixed(0)}</div>
              <div>إجمالي المدين : {entryDebits.toFixed(0)}</div>
              <div>إجمالي المستحقات: {filteredPayments.reduce((sum, p) => {
                const cert = (p.salary * p.certificate_percentage) / 100;
                const risk = (p.salary * p.risk_percentage) / 100;
                const totalCred = p.salary + cert + risk + p.trans_pay + (p.net_credits || 0);
                return sum + totalCred;
              }, 0).toFixed(0)}</div>
              <div>إجمالي الاستقطاعات: {filteredPayments.reduce((sum, p) => {
                const retire = (p.salary * p.retire_percentage) / 100;
                const totalDeb = retire + (p.net_debits || 0);
                return sum + totalDeb;
              }, 0).toFixed(0)}</div>
              <div>صافي الإجمالي: {filteredPayments.reduce((sum, p) => {
                const cert = (p.salary * p.certificate_percentage) / 100;
                const risk = (p.salary * p.risk_percentage) / 100;
                const retire = (p.salary * p.retire_percentage) / 100;
                const totalCred = p.salary + cert + risk + p.trans_pay + (p.net_credits || 0);
                const totalDeb = retire + (p.net_debits || 0);
                return sum + (totalCred - totalDeb);
              }, 0).toFixed(0)}</div>
            </div>


          {/* Number of employees */}
          <div className="mt-2 text-sm font-semibold">عدد الموظفين: {filteredPayments.length}</div>
          

          {/* Committee fields */}
          <div className="mt-10 text-sm w-full">
            <div className="grid grid-cols-4 gap-4 text-center">
              {['عضو', 'عضو', 'عضو', 'رئيس اللجنة'].map((label, index) => (
                <div key={index}>
                  <label className="font-bold block mb-2">{label}</label>
                  <input
                    type="text"
                    className="border-t border-black w-full text-center focus:outline-none"
                    placeholder="اسم"
                    value={committee[index]}
                    onChange={(e) => {
                      const updated = [...committee];
                      updated[index] = e.target.value;
                      setCommittee(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export button */}
      {shouldShowData && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-6"
          onClick={exportToPDF}
        >
          تصدير إلى PDF
        </button>
      )}
    </div>
  );
}
