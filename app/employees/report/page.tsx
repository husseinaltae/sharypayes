'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function EmployeeReport() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [officeFilter, setOfficeFilter] = useState('');
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [offices, setOffices] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('employees')
        .select('*, offices(name)')
        .order('first_name', { ascending: true });

      if (data) {
        setEmployees(data);
        setFiltered(data);
        setOffices(Array.from(new Set(data.map(e => e.offices?.name).filter(Boolean))));
        setJobTitles(Array.from(new Set(data.map(e => e.job_title).filter(Boolean))));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...employees];

    if (search.trim()) {
      result = result.filter(e =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (officeFilter) {
      result = result.filter(e => e.offices?.name === officeFilter);
    }

    if (jobTitleFilter) {
      result = result.filter(e => e.job_title === jobTitleFilter);
    }

    setFiltered(result);
  }, [search, officeFilter, jobTitleFilter, employees]);

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <style jsx global>{`
        @media print {
          header, footer, nav, .site-header, .site-footer,
          .print-hidden, .no-print, .navbar, .footer {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          html, body {
            padding: 0;
            margin: 0;
          }
        }

        .print-only {
          display: none;
        }
      `}</style>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 print-hidden">
        <input
          type="text"
          placeholder="ابحث بالاسم"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-2 py-1"
        />
        <select
          value={officeFilter}
          onChange={(e) => setOfficeFilter(e.target.value)}
          className="border rounded-md px-2 py-1"
        >
          <option value="">الدائرة</option>
          {offices.map((o, idx) => (
            <option key={idx} value={o}>{o}</option>
          ))}
        </select>
        <select
          value={jobTitleFilter}
          onChange={(e) => setJobTitleFilter(e.target.value)}
          className="border rounded-md px-2 py-1"
        >
          <option value="">العنوان الوظيفي</option>
          {jobTitles.map((j, idx) => (
            <option key={idx} value={j}>{j}</option>
          ))}
        </select>
      </div>

      <div id="report-content" dir="rtl" className="w-full max-w-none text-sm">

        {/* Print-only heading */}
        {(search.trim() || officeFilter) && (
          <div className="flex justify-between items-center mb-4 print-only">
            <h2 className="text-xl font-bold text-center w-full">
              {officeFilter ? `/تقرير الموظفين - الدائرة ${officeFilter}` : 'تقرير الموظفين'}
            </h2>
          </div>
        )}

        {(search.trim() || officeFilter) && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border border-collapse table-fixed">
                <thead>
                  <tr className="bg-gray-100 text-center">
                    <th className="border px-1 py-1 w-[160px] text-right">الاسم</th>
                    <th className="border px-1 py-1 w-[85px]">الرقم الوطني</th>
                    <th className="border px-1 py-1 w-[85px]">تاريخ الميلاد</th>
                    <th className="border px-1 py-1 w-[87px]">رقم موبايل</th>
                    <th className="border px-1 py-1 w-[87px]">بريد الكتروني </th>
                    <th className="border px-1 py-1 w-[160px]">عنوان السكن</th>
                    <th className="border px-1 py-1 w-[60px]">شهادة علمية</th>
                    <th className="border px-1 py-1 w-[90px]">عنوان وظيفي</th>
                    <th className="border px-1 py-1 w-[85px]">تاريخ التعيين</th>
                    <th className="border px-1 py-1 w-[85px]">الحساب المصرفي</th>
                    <th className="border px-1 py-1 w-[65px]">المصرف</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {filtered.map((e, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="border px-1 py-1 break-words text-right">{e.first_name} {e.last_name}</td>
                      <td className="border px-1 py-1 break-words">{e.id_number}</td>
                      <td className="border px-1 py-1 break-words">{e.birthdate}</td>
                      <td className="border px-1 py-1 break-words">{e.phone_no}</td>
                      <td className="border px-1 py-1 break-words">{e.email}</td>
                      <td className="border px-1 py-1 break-words">{e.address}</td>
                      <td className="border px-1 py-1 break-words">{e.certificate}</td>
                      <td className="border px-1 py-1 break-words">{e.job_title}</td>
                      <td className="border px-1 py-1 break-words">{e.hire_date}</td>
                      <td className="border px-1 py-1 break-words">{e.bank_account}</td>
                      <td className="border px-1 py-1 break-words">{e.bank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <span>عدد الموظفين: {filtered.length}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 print-hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          طباعة التقرير
        </button>
      </div>
    </>
  );
}
