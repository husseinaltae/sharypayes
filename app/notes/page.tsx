'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Page() {
  const supabase = createClient()
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')

  const fetchNotes = async () => {
    const { data } = await supabase.from('notes').select().order('id', { ascending: false })
    setNotes(data || [])
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    await supabase.from('notes').insert({ title: newNote })
    setNewNote('')
    fetchNotes()
  }

  const handleDelete = async (id: number) => {
    await supabase.from('notes').delete().eq('id', id)
    fetchNotes()
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">📓 My Notes</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Write a note..."
        />
        <button onClick={handleAddNote} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="flex justify-between items-center bg-gray-100 p-3 rounded">
            <span>{note.title}</span>
            <button onClick={() => handleDelete(note.id)} className="text-red-500 hover:underline">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
