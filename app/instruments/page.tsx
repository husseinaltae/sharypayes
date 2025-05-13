import { createClient } from '@/utils/supabase/server';

export default async function Instruments() {
  const supabase = await createClient();
  const { data: instruments } = await supabase.from("instruments").select();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Instruments</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {instruments?.map((instrument) => (
            <tr key={instrument.id}>
              <td className="border px-4 py-2">{instrument.id}</td>
              <td className="border px-4 py-2">{instrument.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  );
}
