// app/notes/page.tsx
'use client'; // 必须在最顶部

export default function Home() {
    const notes = [
        { id: 1, title: '学习 Next.js 基础', content: '...', date: '2026-02-06' },
        { id: 2, title: 'TypeScript 类型系统', content: '...', date: '2026-02-06' },
        { id: 3, title: '响应式设计技巧', content: '...', date: '2026-02-06' },
    ];

    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h1>NoteAI - 我的知识库</h1>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {notes.map((note) => (
                    <div
                        key={note.id}
                        style={{
                            padding: '1.5rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            backgroundColor: 'white',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>
                            {note.title}
                        </h3>
                        <p style={{ margin: '0 0 1rem 0', color: '#64748b', lineHeight: 1.5 }}>
                            {note.content}
                        </p>
                        <small style={{ color: '#94a3b8' }}>
                            {note.date}
                        </small>
                    </div>
                ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                    style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                >
                    + 创建新笔记
                </button>
            </div>
        </main>
    );
}