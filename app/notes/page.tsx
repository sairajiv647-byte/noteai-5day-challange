// app/notes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function NotesPage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [notes, setNotes] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const { data, error } = await supabase.from('notes').select('*')
                if (error) throw error
                setNotes(data || [])
            } catch (err: any) {
                setError(err.message)
            }
        }
        fetchNotes()
    }, [supabase])

    if (error) {
        return <div style={{ color: 'red', padding: '2rem' }}>加载笔记出错: {error}</div>
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>我的笔记</h1>
            {notes.length === 0 ? (
                <p>暂无笔记，请先在 Supabase 中添加测试数据。</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {notes.map((note) => (
                        <li
                            key={note.id}
                            style={{
                                margin: '1rem 0',
                                padding: '1rem',
                                border: '1px solid #eee',
                                borderRadius: '4px'
                            }}
                        >
                            <h2 style={{ margin: '0 0 0.5rem' }}>{note.title}</h2>
                            <p style={{ margin: '0 0 0.5rem', color: '#333' }}>{note.content}</p>
                            <small style={{ color: '#666' }}>
                                {new Date(note.created_at).toLocaleString()}
                            </small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}