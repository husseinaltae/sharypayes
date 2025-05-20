'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import html2pdf from 'html2pdf.js';

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

  const handleExportPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    html2pdf().from(element).set({
      filename: 'تقرير_الموظفين.pdf',
      html2canvas: { scale: 2 },
      jsPDF: {
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      }
    }).save();
  };

  return (
    <>
      {/* Print page style for A4 full width */}
        
        <style jsx global>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 15mm; /* Ensures space on all sides */
            }

            html, body {
              padding: 0 , 10mm,0,0;
              margin: 0;
              height: auto;
            }

            body > * {
              break-inside: avoid;
              page-break-inside: avoid;
              padding: 0 , 10mm,0,0;
            }
          }
        `}</style>
        
      
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 print:hidden">
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
            <option value="">الموظفين</option>
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


      <div id="report-content" dir="rtl" className="w-[1050px] max-w-none bg-white text-xs print:text-xs font-medium p-4 print:p-20 print:bg-transparent">

        {/* Header */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="text-xl font-bold">تقرير الموظفين</h2>
          <span>{today}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-collapse table-fixed ">
          <thead>
            <tr className="bg-gray-100 text-center align-middle">
              <th className="border px-1 py-1 w-[160px] text-right">الاسم</th>
              <th className="border px-1 py-1 w-[85px]">الرقم الوطني</th>
              <th className="border px-1 py-1 w-[75px]">تاريخ الميلاد</th>
              <th className="border px-1 py-1 w-[87px]">رقم موبايل</th>
              <th className="border px-1 py-1 w-[160px]">عنوان السكن</th>
              <th className="border px-1 py-1 w-[60px]">شهادة علمية</th>
              <th className="border px-1 py-1 w-[100px]">عنوان وظيفي</th>
              <th className="border px-1 py-1 w-[75px]">تاريخ التعيين</th>
              <th className="border px-1 py-1 w-[80px]">الحساب المصرفي</th>
              <th className="border px-1 py-1 w-[65px]">المصرف</th>
            </tr>
          </thead>

          <tbody className="text-center align-middle">
            {filtered.map((e, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="border px-1 py-1 break-words text-right">{e.first_name} {e.last_name}</td>
                <td className="border px-1 py-1 break-words">{e.id_number}</td>
                <td className="border px-1 py-1 break-words">{e.birthdate}</td>
                <td className="border px-1 py-1 break-words">{e.phone_no}</td>
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


        </div>
                {/* PDF Export Button */}
                <div className="mt-6 print:hidden flex gap-4">
          <button
            onClick={handleExportPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            طباعة  PDF
          </button>
      </div>
    </>
  );
}
