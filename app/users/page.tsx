'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

type UserWithEmployee = {
  id: string;
  email: string;
  phone_no: string;
  password: string;
  employee_id: string;
  employees: {
    first_name: string;
    last_name: string;
  } | null;
};

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserWithEmployee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        phone_no,
        password,
        employee_id,
        employees (
          first_name,
          last_name
        )
      `);

    if (error) {
      console.error('Failed to fetch users:', error.message);
    } else {
      setUsers(data as UserWithEmployee[]);
    }
    setLoading(false);
  };

  const handleDelete = async (userId: string) => {
    const confirm = window.confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟');
    if (!confirm) return;

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      alert('فشل في حذف المستخدم');
      console.error(error.message);
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">قائمة المستخدمين</h1>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full border border-gray-300 text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">الاسم الأول</th>
                <th className="px-4 py-2">اسم العائلة</th>
                <th className="px-4 py-2">كلمة المرور</th>
                <th className="px-4 py-2">البريد الإلكتروني</th>
                <th className="px-4 py-2">رقم الهاتف</th>
                <th className="px-4 py-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">
                    {user.employees?.first_name || '—'}
                  </td>
                  <td className="px-4 py-2">
                    {user.employees?.last_name || '—'}
                  </td>
                  <td className="px-4 py-2">{user.password || '—'}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.phone_no}</td>
                  <td className="px-4 py-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    لا يوجد مستخدمون مسجلون.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
