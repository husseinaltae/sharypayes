import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useReactToPrint } from 'react-to-print';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Employee = {
  id: string;
  first_name: string;
  salary: number;
  retire_cut: number;
};

type Signer = {
  title: string;
  name: string;
};

export default function RetireReport() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [signers, setSigners] = useState<Signer[]>(Array(4).fill({ title: '', name: '' }));
  const componentRef = useRef(null);

  const fetchData = async () => {
    const { data, error } = await supabase.rpc('get_retire_report');
    if (error) console.error(error);
    else setEmployees(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current!
  });

  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const totalRetire = employees.reduce((sum, e) => sum + (e.retire_cut || 0), 0);

  return (
    <div className="p-4" dir="rtl">
      <h1 className="text-xl font-bold mb-4">تقرير الاستقطاعات التقاعدية</h1>
      <button
        onClick={handlePrint}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        طباعة التقرير
      </button>

      <div ref={componentRef} className="border p-4">
        <table className="w-full border border-collapse text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">الاسم</th>
              <th className="border p-2">الراتب</th>
              <th className="border p-2">الاستقطاع التقاعدي</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e, i) => (
              <tr key={i}>
                <td className="border p-2">{e.first_name}</td>
                <td className="border p-2">{e.salary.toFixed(0)}</td>
                <td className="border p-2">{e.retire_cut.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-bold">
            <tr>
              <td className="border p-2">المجموع</td>
              <td className="border p-2">{totalSalary.toFixed(0)}</td>
              <td className="border p-2">{totalRetire.toFixed(0)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="border p-2 text-right">
                عدد الموظفين: {employees.length}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {signers.map((signer, idx) => (
            <div key={idx} className="border p-2">
              <input
                type="text"
                placeholder="الصفة الوظيفية"
                className="w-full border p-1 mb-1"
                value={signer.title}
                onChange={e => {
                  const copy = [...signers];
                  copy[idx].title = e.target.value;
                  setSigners(copy);
                }}
              />
              <input
                type="text"
                placeholder="الاسم"
                className="w-full border p-1"
                value={signer.name}
                onChange={e => {
                  const copy = [...signers];
                  copy[idx].name = e.target.value;
                  setSigners(copy);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
