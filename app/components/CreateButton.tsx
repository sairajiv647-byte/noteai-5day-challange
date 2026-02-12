'use client';

import { useState } from 'react';
import { supabase } from '../notes/lib/supabase';

type CreateButtonProps = {
    onNoteCreated: () => void;
};

export default function CreateButton({ onNoteCreated }: CreateButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('notes')
                .insert([{ title, content }])
                .select();

            if (error) {
                console.error('创建笔记失败:', error);
                alert('创建失败: ' + error.message);
            } else {
                // 成功后重置表单并关闭弹窗
                setTitle('');
                setContent('');
                setIsOpen(false);
                // 通知父组件刷新列表
                onNoteCreated();
            }
        } catch (err) {
            console.error('发生意外错误:', err);
            alert('发生意外错误');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    padding: '0.8rem 1.5rem',
                    fontSize: '1rem',
                    backgroundColor: '#165DFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#134ec2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#165DFF'}
            >
                + 创建笔记
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false);
                    }}
                >
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', color: '#1f2937' }}>新建笔记</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4b5563' }}>标题</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="输入笔记标题..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4b5563' }}>内容</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="输入笔记内容..."
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    color: '#374151'
                                }}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isLoading}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    backgroundColor: '#165DFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    color: 'white',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                            >
                                {isLoading ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}