'use client';

import { useState } from 'react';
import { supabase } from '../notes/lib/supabase';

export interface Note {
    id: number | string;
    title: string;
    content: string;
    date: string;
}

export default function NoteCard({ note, onNoteDeleted, onNoteUpdated }: {
    note: Note;
    onNoteDeleted?: (id: number | string) => void;
    onNoteUpdated?: () => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('notes')
                .update({ title, content })
                .eq('id', note.id);

            if (error) {
                console.error('更新笔记失败:', error);
                alert('更新失败: ' + error.message);
            } else {
                setIsEditing(false);
                if (onNoteUpdated) onNoteUpdated();
            }
        } catch (err) {
            console.error('发生意外错误:', err);
            alert('发生意外错误');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="note-card" style={{
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            backgroundColor: 'white',
            transition: 'all 0.3s ease',
            cursor: isEditing ? 'default' : 'pointer',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}
            onMouseEnter={(e) => {
                if (!isEditing) {
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isEditing) {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'none';
                }
            }}
        >
            {isEditing ? (
                // 编辑模式
                <div onClick={(e) => e.stopPropagation()}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{
                            width: '100%',
                            marginBottom: '0.5rem',
                            padding: '0.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1'
                        }}
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        style={{
                            width: '100%',
                            marginBottom: '1rem',
                            padding: '0.5rem',
                            fontSize: '0.95rem',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setTitle(note.title);
                                setContent(note.content);
                            }}
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.875rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            取消
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={isLoading}
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.875rem',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#165DFF',
                                color: 'white',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? '保存...' : '保存'}
                        </button>
                    </div>
                </div>
            ) : (
                // 查看模式
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: '0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', wordBreak: 'break-word', flex: 1 }}>
                            {note.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    color: '#94a3b8',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                title="Edit note"
                            >
                                ✎
                            </button>
                            {onNoteDeleted && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNoteDeleted(note.id);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                        color: '#94a3b8',
                                        padding: '4px',
                                        lineHeight: 1,
                                        borderRadius: '4px',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                    title="Delete note"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                    <p style={{ margin: '0 0 1rem 0', color: '#64748b', lineHeight: 1.5, flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {note.content}
                    </p>
                    <small style={{ color: '#94a3b8' }}>
                        {note.date ? new Date(note.date).toLocaleString() : ''}
                    </small>
                </>
            )}
        </div>
    );
}