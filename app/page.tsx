'use client';

import { useEffect, useState } from 'react';
import { supabase } from './notes/lib/supabase';
import NoteCard, { Note } from './components/NoteCard';
import CreateButton from './components/CreateButton';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);

  // 从 Supabase 读取真实数据
  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false }); // 按创建时间倒序排列

    if (error) {
      console.error('读取笔记时出错:', error);
    } else {
      setNotes(data || []);
    }
  };

  // 页面加载时，从 Supabase 读取数据
  useEffect(() => {
    fetchNotes();
  }, []);

  // 删除笔记的处理函数
  const handleDeleteNote = async (id: number | string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除笔记失败:', error);
      alert('删除失败，请稍后重试');
    } else {
      // 从状态中移除已删除的笔记
      setNotes(notes.filter((note) => note.id !== id));
    }
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
        NoteAI - 我的知识库
      </h1>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <CreateButton onNoteCreated={fetchNotes} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
        {notes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', gridColumn: '1 / -1' }}>
            还没有笔记，快去创建一个吧！
          </p>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onNoteDeleted={handleDeleteNote}
              onNoteUpdated={fetchNotes}
            />
          ))
        )}
      </div>
    </main>
  );
}