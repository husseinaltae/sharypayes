'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function TaxReport() {
  const [offices, setOffices] = useState<any[]>([]);
  const [taxData, setTaxData] = useState<any[]>([]);
  const [officeFilter, setOfficeFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  useEffect(() => {
    const fetchOffices = async () => {
      const { data } = await supabase.from('offices').select('*');
      if (data) setOffices(data);
    };

    fetchOffices();
  }, []);

  const fetchTaxData = async () => {
    if (!officeFilter || !monthFilter) {
      setTaxData([]);
      return;
    }

    const fromDate = `${monthFilter}-01`;
    const toDate = new Date(new Date(fromDate).setMonth(new Date(fromDate).getMonth() + 1))
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('payments_entries')
      .select(`
        id,
        title,
        amount,
        payments (
          created_at,
          employee_id,
          employees (
            first_name,
            last_name,
            office_id,
            offices (
              name
            )
          )
        )
      `)
      .eq('title', 'ضريبة')
      .gte('payments.created_at', fromDate)
      .lt('payments.created_at', toDate);

    if (error) {
      console.error('Error fetching data:', error);
      return;
    }

    const filtered = (data || [])
      .filter((entry) => entry.payments?.employees?.offices?.name === officeFilter)
      .map((entry) => ({
        employee_name: `${entry.payments.employees.first_name} ${entry.payments.employees.last_name}`,
        amount: entry.amount,
      }));

    setTaxData(filtered);
  };

  useEffect(() => {
    fetchTaxData();
  }, [officeFilter, monthFilter]);

  const handlePrint = () => {
    const content = document.getElementById('print-area')?.innerHTML;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>تقرير الضريبة</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            }
            h2 {
              text-align: center;
              margin-bottom: 16px;
            }
            .summary {
              margin-top: 16px;
              font-weight: bold;
              text-align: right;
            }

            /* Use grid for signatures, same as on web page */
            .signatures {
              margin-top: 40px;
            }

            .signatures > div {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              text-align: center;
            }

            .signatures label {
              font-weight: bold;
              display: block;
              margin-bottom: 8px;
            }

            .signatures input {
              border: none;
              border-top: 1px solid #000;
              width: 100%;
              text-align: center;
              padding: 4px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const totalTax = taxData.reduce((sum, entry) => sum + Number(entry.amount), 0);

  return (
    <div className="p-4 text-sm max-w-4xl mx-auto" dir="rtl">
      {/* Filters - Not printed */}
      <div className="flex gap-4 mb-4 print:hidden">
        <select
          className="border p-2"
          value={officeFilter}
          onChange={(e) => setOfficeFilter(e.target.value)}
        >
          <option value="">اختر الدائرة</option>
          {offices.map((office) => (
            <option key={office.id} value={office.name}>
              {office.name}
            </option>
          ))}
        </select>

        <input
          className="border p-2"
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        />

        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          طباعة
        </button>
      </div>

      {/* Report Content */}
      {taxData.length > 0 ? (
        <div id="print-area" className="border pt-4">
          <h2 className="text-base font-semibold mb-2 text-center">
            تقرير الضريبة - {officeFilter} - {monthFilter}
          </h2>

          <table className="w-full border text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">اسم الموظف</th>
                <th className="border p-2">مقدار الضريبة</th>
              </tr>
            </thead>
            <tbody>
              {taxData.map((item, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{item.employee_name}</td>
                  <td className="border p-2">{Number(item.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="mt-4 text-right font-semibold summary">
            <div>عدد الموظفين: {taxData.length}</div>
            <div>إجمالي الضريبة: {totalTax.toLocaleString()} دينار</div>
          </div>

          {/* Committee members */}
          <div className="mt-10 text-sm w-full signatures">
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
      ) : (
        <p className="text-center mt-4">لا توجد بيانات لعرضها.</p>
      )}
    </div>
  );
}
