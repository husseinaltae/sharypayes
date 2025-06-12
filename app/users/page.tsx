'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

    type User = {
      id: string;
      email: string;
      phone: string;
      role: string;
      offices: {
        name: string;
      } | null;
    };
export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
    .from('users')
    .select('id, email, phone, role, offices(name)')




    if (error) {
      console.error('Failed to fetch users:', error.message);
      setError('فشل في تحميل قائمة المستخدمين.');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) return;

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

      {loading && <p>جاري التحميل...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full border border-gray-300 text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">المؤسسة</th>
                <th className="px-4 py-2">البريد الإلكتروني</th>
                <th className="px-4 py-2">رقم الهاتف</th>
                <th className="px-4 py-2">الدور</th>
                <th className="px-4 py-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2">{user.offices?.name || '—'}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.phone}</td>
                    <td className="px-4 py-2">{user.role}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
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
