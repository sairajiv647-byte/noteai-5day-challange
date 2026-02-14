'use client';

import { useState } from 'react';
import { supabase } from '../notes/lib/supabase';
import { MdEditor } from 'md-editor-rt';

type CreateButtonProps = {
    onNoteCreated: () => void;
};

export default function CreateButton({ onNoteCreated }: CreateButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [aiTags, setAiTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleAiAssist = async () => {
        if (!content.trim()) {
            alert('请先输入一些内容，AI 才能帮你总结');
            return;
        }

        setIsAiLoading(true);
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (!response.ok) throw new Error('AI 请求失败');

            const data = await response.json();
            setAiSummary(data.summary || '');
            setAiTags(data.tags || []);
        } catch (err) {
            console.error('AI 助手出错:', err);
            alert('AI 助手暂时不可用');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空');
            return;
        }

        setIsLoading(true);

        try {
            // 注意：如果你的 Supabase 表里没有 summary 和 tags 列，这里可能会报错
            // 如果报错，可以先在 Supabase SQL Editor 执行：
            // ALTER TABLE notes ADD COLUMN IF NOT EXISTS summary TEXT;
            // ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[];
            const { error } = await supabase
                .from('notes')
                .insert([{
                    title,
                    content,
                    summary: aiSummary,
                    tags: aiTags
                }])
                .select();

            if (error) {
                console.error('创建笔记失败:', error);
                // 降级处理：如果是因为列不存在，则只保存标题和内容
                if (error.code === '42703') {
                    const { error: retryError } = await supabase
                        .from('notes')
                        .insert([{ title, content }])
                        .select();

                    if (retryError) throw retryError;
                    alert('笔记已保存，但 AI 数据保存失败（数据库缺少 summary/tags 列）');
                } else {
                    throw error;
                }
            }

            setTitle('');
            setContent('');
            setAiSummary('');
            setAiTags([]);
            setIsOpen(false);
            onNoteCreated();
        } catch (err: any) {
            console.error('发生错误:', err);
            alert('保存失败: ' + (err.message || '未知错误'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    padding: '0.8rem 1.8rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37, 99, 235, 0.2)';
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>+</span> 创建笔记
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1100,
                    backdropFilter: 'blur(8px)',
                    padding: '20px'
                }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false);
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
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>新建笔记</h3>
                                <button
                                    onClick={handleAiAssist}
                                    disabled={isAiLoading}
                                    style={{
                                        padding: '4px 12px',
                                        fontSize: '0.85rem',
                                        backgroundColor: isAiLoading ? '#f1f5f9' : '#eff6ff',
                                        color: '#2563eb',
                                        border: '1px solid #dbeafe',
                                        borderRadius: '20px',
                                        cursor: isAiLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isAiLoading ? '✨ AI 思考中...' : '✨ AI 助手'}
                                </button>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e2e8f0';
                                    e.currentTarget.style.color = '#1e293b';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.color = '#64748b';
                                }}
                            >×</button>
                        </div>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="给你的笔记起个标题..."
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                fontSize: '1.3rem',
                                fontWeight: 700,
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                marginBottom: '1.25rem',
                                transition: 'all 0.2s',
                                backgroundColor: '#f8fafc'
                            }}
                        />

                        {aiSummary && (
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                border: '1px solid #e0f2fe'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>AI 摘要</div>
                                <div style={{ fontSize: '0.9rem', color: '#0c4a6e', lineHeight: 1.5 }}>{aiSummary}</div>
                                {aiTags.length > 0 && (
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        {aiTags.map(tag => (
                                            <span key={tag} style={{
                                                padding: '2px 8px',
                                                backgroundColor: '#dbeafe',
                                                color: '#1e40af',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}>#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem', flex: 1, minHeight: '300px' }}>
                            <MdEditor
                                modelValue={content}
                                onChange={setContent}
                                placeholder="在这里输入笔记，支持 Markdown 语法..."
                                style={{ height: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                language="zh-CN"
                                toolbarsExclude={['github']}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    padding: '0.8rem 1.8rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    color: '#475569',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isLoading}
                                style={{
                                    padding: '0.8rem 1.8rem',
                                    backgroundColor: '#2563eb',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    color: 'white',
                                    fontWeight: 600,
                                    opacity: isLoading ? 0.7 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isLoading ? '正在记录...' : '保存笔记'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}