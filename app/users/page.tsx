'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    id_number: '',
    email: '',
    mobil: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Fetch error:', error);
      } else {
        setUsers(data || []);
      }
    };

    fetchUsers();
  }, []);

  // Add or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('users')
        .update(form)
        .eq('id_number', editingId);

      if (error) {
        console.error('Update error:', error);
        return;
      }

      setUsers(users.map(u => (u.id_number === editingId ? form : u)));
      setEditingId(null);
    } else {
      const { data, error } = await supabase.from('users').insert([form]);
      if (error) {
        console.error('Insert error:', error);
        return;
      }
      setUsers([...users, form]);
    }

    // Reset form
    setForm({
      first_name: '',
      last_name: '',
      id_number: '',
      email: '',
      mobil: '',
    });
  };

  // Delete
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id_number', id);
    if (error) {
      console.error('Delete error:', error);
      return;
    }
    setUsers(users.filter(u => u.id_number !== id));
  };

  // Edit
  const handleEdit = (user: any) => {
    setForm(user);
    setEditingId(user.id_number);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          className="w-full border p-2"
          placeholder="First Name"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <input
          className="w-full border p-2"
          placeholder="Last Name"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
        <input
          className="w-full border p-2"
          placeholder="ID Number"
          value={form.id_number}
          onChange={(e) => setForm({ ...form, id_number: e.target.value })}
          disabled={!!editingId}
        />
        <input
          className="w-full border p-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full border p-2"
          placeholder="Mobile"
          value={form.mobil}
          onChange={(e) => setForm({ ...form, mobil: e.target.value })}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingId ? 'Update User' : 'Add User'}
        </button>
      </form>

      <ul>
        {users.map((user) => (
          <li
            key={user.id_number}
            className="border p-3 mb-2 flex justify-between items-center"
          >
            <span>
              {user.first_name} {user.last_name} | {user.email} | {user.mobil}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(user)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(user.id_number)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
