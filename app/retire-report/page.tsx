'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js'; // For typing the user state

// Define interfaces for better type safety
interface Office {
  id: string; // Assuming string ID (e.g., UUID). Change to number if appropriate for your DB schema.
  name: string;
}

interface EmployeeForPayment {
  id: string; // Assuming string ID.
  first_name: string | null;
  office_id: string | null; // Assuming string ID, foreign key to Office.id
  offices: Office | null; // Joined office details from employees table
}

interface Payment {
  created_at: string; // ISO date string
  salary: number | null;
  retire_note: string | null;
  employee_id: string; // Assuming string ID, foreign key to Employee.id
  employees: EmployeeForPayment | null; // Related employee details, can be null
}

const RetireReport = () => {
  const supabase = createClient();
  const [data, setData] = useState<Payment[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [percentage, setPercentage] = useState(15);
  const [user, setUser] = useState<User | null>(null);

  const now = new Date();
  const formattedDate = now.toLocaleDateString();
  const formattedTime = now.toLocaleTimeString();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
    fetchOffices();
    fetchData();
  }, []);

  const fetchOffices = async () => {
    const { data } = await supabase.from('offices').select('id, name');
    setOffices(data || []);
  };

  const fetchData = async () => {
    const { data } = await supabase
      .from('payments')
      .select('created_at, salary, retire_note, employee_id, employees(id, first_name, office_id, offices(id, name))')
      .order('created_at', { ascending: false });

    setData(data || []);
  };

  const filteredData = data.filter((item) => {
    const matchesOffice = selectedOffice ? item.employees.offices?.id === selectedOffice : true;
    const matchesMonth = selectedMonth
      ? new Date(item.created_at).toISOString().slice(0, 7) === selectedMonth
      : true;
    return matchesOffice && matchesMonth;
  });

  const handlePrint = () => {
    const table = document.getElementById('report-content');
    if (!table) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>طباعة تقرير الاستقطاع</title>
          <style>
            body { font-family: sans-serif; direction: rtl; padding: 20px; }
            table { width: 100%; border-collapse: collapse; text-align: center; }
            th, td { border: 1px solid black; padding: 6px; }
            thead { background-color: #f0f0f0; font-weight: bold; }
            .header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
            .signatures { margin-top: 50px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center; }
            .signatures label { display: block; margin-bottom: 6px; font-weight: bold; }
            .signatures input { border-top: 1px solid black; width: 100%; text-align: center; }
          </style>
        </head>
        <body>
          ${table.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const totalSalary = filteredData.reduce((sum, item) => sum + (item.salary || 0), 0);
  const totalCut = filteredData.reduce((sum, item) => sum + ((item.salary || 0) * percentage) / 100, 0);

  return (
    <div className="rtl text-right p-4 print:p-0">
      {/* Filters */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            className="border px-6"
          >
            <option value="">اختر </option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-2"
          />

          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(+e.target.value)}
            className="border px-1 w-20 align-center text-center"
            placeholder="نسبة (%)"
          />
        </div>

        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          طباعة 
        </button>
      </div>

      {/* Report Content - Only show when an office is selected */}
      {selectedOffice && (
        <div id="report-content" className="text-sm">
          <div className="header">
            <div>{offices.find(o => o.id === selectedOffice)?.name || 'كل الدوائر'} - {selectedMonth || 'كل الأشهر'}</div>
            <div>{formattedDate} - {formattedTime}</div>
          </div>

          <table className="w-full border border-black text-center">
            <thead className="bg-gray-200">
              <tr>
                <th className="border">الدائرة</th>
                <th className="border">اسم الموظف</th>
                <th className="border">الراتب</th>
                <th className="border">النسبة</th>
                <th className="border">الاستقطاع</th>
                <th className="border">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx}>
                  <td className="border text-right px-1">{row.employees.offices?.name}</td>
                  <td className="border text-right px-1">{row.employees?.first_name}</td>
                  <td className="border">{row.salary}</td>
                  <td className="border">{percentage}%</td>
                  <td className="border">{((row.salary || 0) * percentage / 100).toFixed(0)}</td>
                  <td className="border text-right px-1">{row.retire_note || ''}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-100">
                <td colSpan={2} className="border">المجموع</td>
                <td className="border">{totalSalary.toFixed(0)}</td>
                <td className="border">{percentage}%</td>
                <td className="border">{totalCut.toFixed(0)}</td>
                <td className="border"></td>
              </tr>
            </tfoot>
          </table>

          {/* Committee Signatures */}
          <div className="signatures text-sm w-full print:mt-20 mt-10 flex justify-between gap-8">
            {['عضو', 'عضو', 'عضو', 'رئيس اللجنة'].map((label, index) => (
              <div key={index} className="text-center w-full">
                <label className="block font-bold mb-2">{label}</label>
                <input
                  type="text"
                  placeholder="اسم"
                  className="border-t border-black w-full text-center"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:flex-row-reverse { flex-direction: row-reverse !important; }
          body { direction: rtl; font-family: sans-serif; }
        }
      `}</style>
    </div>
  );
};

export default RetireReport;
