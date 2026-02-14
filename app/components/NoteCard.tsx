'use client';

import { useState } from 'react';
import { supabase } from '../notes/lib/supabase';
import { MdEditor, MdPreview } from 'md-editor-rt';

export interface Note {
    id: number | string;
    title: string;
    content: string;
    date: string;
    summary?: string;
    tags?: string[];
}

export default function NoteCard({ note, onNoteDeleted, onNoteUpdated }: {
    note: Note;
    onNoteDeleted?: (id: number | string) => void;
    onNoteUpdated?: () => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [aiSummary, setAiSummary] = useState(note.summary || '');
    const [aiTags, setAiTags] = useState<string[]>(note.tags || []);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleAiAssist = async () => {
        if (!content.trim()) {
            alert('内容为空，AI 无法总结');
            return;
        }
        setIsAiLoading(true);
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await response.json();
            setAiSummary(data.summary || '');
            setAiTags(data.tags || []);
        } catch (err) {
            console.error('AI 助手请求失败:', err);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('notes')
                .update({
                    title,
                    content,
                    summary: aiSummary,
                    tags: aiTags
                })
                .eq('id', note.id);

            if (error) {
                // 如果列不存在，尝试降级更新
                if (error.code === '42703') {
                    const { error: retryError } = await supabase
                        .from('notes')
                        .update({ title, content })
                        .eq('id', note.id);
                    if (retryError) throw retryError;
                    alert('笔记已更新，但 AI 数据未能保存（数据库缺少列）');
                } else {
                    throw error;
                }
            }

            setIsEditing(false);
            if (onNoteUpdated) onNoteUpdated();
        } catch (err: any) {
            console.error('更新失败:', err);
            alert('更新失败: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="note-card" style={{
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                backgroundColor: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '380px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 20px -10px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'none';
                }}
                onClick={() => setIsEditing(true)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h3 style={{
                        margin: '0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b',
                        flex: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {note.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            style={{ background: '#f8fafc', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }}
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
                                style={{ background: '#f8fafc', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }}
                                title="Delete note"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {note.tags && note.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {note.tags.map(tag => (
                            <span key={tag} style={{ fontSize: '0.65rem', backgroundColor: '#eff6ff', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>#{tag}</span>
                        ))}
                    </div>
                )}

                {note.summary && (
                    <div style={{
                        fontSize: '0.8rem', color: '#475569', backgroundColor: '#f8fafc',
                        padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem',
                        borderLeft: '3px solid #3b82f6', fontStyle: 'italic'
                    }}>
                        {note.summary}
                    </div>
                )}

                <div style={{
                    flex: 1, overflow: 'hidden', position: 'relative',
                    maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
                }}>
                    <MdPreview modelValue={note.content} language="zh-CN" theme="light" />
                </div>

                <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                        {note.date ? new Date(note.date).toLocaleString('zh-CN') : ''}
                    </small>
                </div>
            </div>

            {/* 编辑模态框 */}
            {isEditing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1100,
                    backdropFilter: 'blur(8px)', padding: '20px'
                }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsEditing(false);
                            setTitle(note.title);
                            setContent(note.content);
                            setAiSummary(note.summary || '');
                            setAiTags(note.tags || []);
                        }
                    }}
                >
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '24px',
                        width: '95%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>修改笔记</h3>
                                <button
                                    onClick={handleAiAssist}
                                    disabled={isAiLoading}
                                    style={{
                                        padding: '4px 12px', fontSize: '0.8rem', backgroundColor: '#eff6ff',
                                        color: '#2563eb', border: '1px solid #dbeafe', borderRadius: '20px',
                                        cursor: 'pointer', fontWeight: 600
                                    }}
                                >
                                    {isAiLoading ? '✨ AI 思考中...' : '✨ AI 助手'}
                                </button>
                            </div>
                            <button
                                onClick={() => setIsEditing(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
                            >×</button>
                        </div>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="输入标题..."
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                marginBottom: '1rem',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />

                        {(aiSummary || (aiTags && aiTags.length > 0)) && (
                            <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '12px', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 700, marginBottom: '4px' }}>AI 建议</div>
                                <div style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>{aiSummary}</div>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                                    {aiTags.map(tag => <span key={tag} style={{ fontSize: '0.7rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>#{tag}</span>)}
                                </div>
                            </div>
                        )}

                        <div style={{ flex: 1, minHeight: '300px', marginBottom: '1rem' }}>
                            <MdEditor
                                modelValue={content}
                                onChange={setContent}
                                language="zh-CN"
                                style={{ height: '100%' }}
                                toolbarsExclude={['github']}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setTitle(note.title);
                                    setContent(note.content);
                                    setAiSummary(note.summary || '');
                                    setAiTags(note.tags || []);
                                }}
                                style={{
                                    padding: '0.7rem 1.5rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={isLoading}
                                style={{
                                    padding: '0.7rem 1.5rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) e.currentTarget.style.backgroundColor = '#1d4ed8';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading) e.currentTarget.style.backgroundColor = '#2563eb';
                                }}
                            >
                                {isLoading ? '保存中...' : '保存更改'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}