'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useReactToPrint } from 'react-to-print';


export default function PaymentHistory() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchMonth, setSearchMonth] = useState('');
  const [searchOffice, setSearchOffice] = useState('');
  const [committee, setCommittee] = useState([
    { jobTitle: '', name: '' },
    { jobTitle: '', name: '' },
    { jobTitle: '', name: '' },
    { jobTitle: '', name: '' }
  ]);
  

  const reportRef = useRef(null);

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : '—';
  };

  const getEmployeeOffice = (id: string) => {
    const emp = employees.find(e => e.id === id);
    const office = offices.find(o => o.id === emp?.office_id);
    return office?.name || '—';
  };

  const calculate = (p: any) => {
    const cert = (+p.salary * +p.certificate_percentage) / 100;
    const risk = (+p.salary * +p.risk_percentage) / 100;
    const manage = (+p.salary * +p.manage_percentage) / 100;
    const totalCredits = +p.salary + +p.kids_pay + +p.transe_pay + +p.marriage_pay + cert + risk + manage;
    const retire = (+p.salary * +p.retire_percentage) / 100;
    const totalDebits = retire + +p.tax + +p.marriage_loan + +p.employee_loan + +p.final_income + +p.stamp_fee;
    const net = totalCredits - totalDebits;
    return { cert, risk, manage, retire, totalCredits, totalDebits, net };
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: emps } = await supabase.from('employees').select('*');
      const { data: pays } = await supabase.from('payments').select('*').order('month', { ascending: false });
      const { data: officeData } = await supabase.from('offices').select('id, name');

      setEmployees(emps || []);
      setPayments(pays || []);
      setOffices(officeData || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const grouped = new Map<string, any>();
    for (const p of payments) {
      const monthKey = (p.month || '').slice(0, 7);
      const key = `${p.employee_id}_${monthKey}`;
      const current = grouped.get(key);
      if (!current || new Date(p.updated_at || '') > new Date(current.updated_at || '')) {
        grouped.set(key, p);
      }
    }

    let filteredData = Array.from(grouped.values());

    if (searchName.trim()) {
      const term = searchName.toLowerCase();
      const matchedEmp = employees.find(emp =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(term)
      );
      if (matchedEmp) filteredData = filteredData.filter(p => p.employee_id === matchedEmp.id);
      else filteredData = [];
    }

    if (searchMonth.trim()) {
      filteredData = filteredData.filter(p => (p.month || '').startsWith(searchMonth));
    }

    if (searchOffice.trim()) {
      const matchedEmps = employees.filter(e => e.office_id === searchOffice).map(e => e.id);
      filteredData = filteredData.filter(p => matchedEmps.includes(p.employee_id));
    }

    setFiltered(filteredData);
  }, [searchName, searchMonth, searchOffice, payments, employees]);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: 'تقرير سجل الرواتب',
    pageStyle: `
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          direction: rtl;
        }
        @page {
          size: A3 landscape;
          margin: 1cm;
        }
        table {
          width: 100%;
          font-size: 12px;
          border-collapse: collapse;
          
        }
        th, td {
          border: 1px solid #000;
          padding: 4px;
          
        }
        thead {
          background-color: #f0f0f0;
        }
      }
    `
  });

  const sumColumn = (field: string) => {
    return filtered.reduce((sum, p) => {
      const { cert, risk, manage, retire, totalCredits, totalDebits, net } = calculate(p);
      switch (field) {
        case 'cert': return sum + cert;
        case 'risk': return sum + risk;
        case 'manage': return sum + manage;
        case 'credits': return sum + totalCredits;
        case 'retire': return sum + retire;
        case 'deb': return sum + totalDebits;
        case 'net': return sum + net;
        default: return sum + (+p[field] || 0);
      }
    }, 0);
  };

  return (
    <div className="p-1" dir="rtl">

      <h1 className="text-xl font-bold mb-4">سجل الرواتب</h1>

      <div className="p-1" dir="rtl">


      <div className="flex flex-col md:flex-row flex-wrap gap-2 mb-2 w-full">
    <input
      type="text"
      placeholder="ابحث بالاسم"
      value={searchName}
      onChange={(e) => setSearchName(e.target.value)}
      className="border p-1 text-sm rounded h-8 w-full md:w-1/4"
    />
    <input
      type="month"
      value={searchMonth}
      onChange={(e) => setSearchMonth(e.target.value)}
      className="border p-1 text-sm rounded h-8 w-full md:w-1/4"
    />
    <select
      value={searchOffice}
      onChange={(e) => setSearchOffice(e.target.value)}
      className="border p-1 text-sm rounded h-8 w-full md:w-1/4"
    >
      <option value="">الكل</option>
      {offices.map(o => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
    </select>
    <button
      onClick={handlePrint}
      className="bg-green-600 text-white px-3 py-1 text-sm rounded h-8"
    >
      طباعة التقرير
    </button>
  </div>
</div>

      <div ref={reportRef} className="w-full overflow-auto text-sm">
      <table className="min-w-[1600px] border border-collapse text-center">

          <thead>
            <tr className="bg-gray-200">
              <th>المكتب</th>
              <th>الموظف</th>
              <th>د</th>
              <th>م</th>
              <th>راتب اسمي</th>
              <th>م شهادة</th>
              <th>م خطورة</th>
              <th>م منصب</th>
              <th>م زوجية</th>
              <th>م أطفال</th>
              <th>م نقل</th>
              <th>إجمالي الاستحقاقات</th>
              <th>استقطاع تقاعد</th>
              <th>سلفة الزواج</th>
              <th>سلفة الموظف</th>
              <th>ضريبة دخل</th>
              <th>ايراد نهائي</th>
              <th>رسم الطابع</th>
              <th>اجمالي الاستقطاع</th>
              <th>صافي الراتب</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={21} className="text-center p-4">لا توجد بيانات</td></tr>
            ) : (
              filtered.map((p, i) => {
                const { cert, risk, manage, retire, totalCredits, totalDebits, net } = calculate(p);
                return (
                  <tr key={i}>
                    <td>{getEmployeeOffice(p.employee_id)}</td>
                    <td>{getEmployeeName(p.employee_id)}</td>
                    <td>{p.degree}</td>
                    <td>{p.level}</td>
                    <td>{p.salary}</td>
                    <td>{cert.toFixed(0)}</td>
                    <td>{risk.toFixed(0)}</td>
                    <td>{manage.toFixed(0)}</td>
                    <td>{p.marriage_pay}</td>
                    <td>{p.kids_pay}</td>
                    <td>{p.transe_pay}</td>
                    <td>{totalCredits.toFixed(0)}</td>
                    <td>{retire.toFixed(0)}</td>
                    <td>{p.marriage_loan}</td>
                    <td>{p.employee_loan}</td>
                    <td>{p.tax}</td>
                    <td>{p.final_income}</td>
                    <td>{p.stamp_fee}</td>
                    <td>{totalDebits.toFixed(0)}</td>
                    <td>{net.toFixed(0)}</td>
                    <td>{p.notes}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-gray-100 font-bold text-center">
              <tr>
                <td colSpan={4}>المجاميع</td>
                <td>{sumColumn('salary')}</td>
                <td>{sumColumn('cert').toFixed(0)}</td>
                <td>{sumColumn('risk').toFixed(0)}</td>
                <td>{sumColumn('manage').toFixed(0)}</td>
                <td>{sumColumn('marriage_pay')}</td>
                <td>{sumColumn('kids_pay')}</td>
                <td>{sumColumn('transe_pay')}</td>
                <td>{sumColumn('credits').toFixed(0)}</td>
                <td>{sumColumn('retire').toFixed(0)}</td>
                <td>{sumColumn('marriage_loan')}</td>
                <td>{sumColumn('employee_loan')}</td>
                <td>{sumColumn('tax')}</td>
                <td>{sumColumn('final_income')}</td>
                <td>{sumColumn('stamp_fee')}</td>
                <td>{sumColumn('deb').toFixed(0)}</td>
                <td>{sumColumn('net').toFixed(0)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="mt-6 text-center max-w-4xl mx-auto px-4">
          <h2 className="font-bold mb-2">لجنة توقيع التقرير</h2>
          <div className="grid grid-cols-4 gap-4 w-full max-w-4xl ">
            {committee.map((member, idx) => (
              <div key={idx} className="flex flex-col ">
                <input
                  type="text"
                  placeholder="العنوان الوظيفي"
                  className="border p-0.5 text-center rounded mb-2"
                  value={member.jobTitle}
                  onChange={(e) => {
                    const newCommittee = [...committee];
                    newCommittee[idx].jobTitle = e.target.value;
                    setCommittee(newCommittee);
                  }}
                />
                <input
                  type="text"
                  placeholder="الاسم"
                  className="border p-0.5 text-center rounded"
                  value={member.name}
                  onChange={(e) => {
                    const newCommittee = [...committee];
                    newCommittee[idx].name = e.target.value;
                    setCommittee(newCommittee);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

    </div>

  );
}
