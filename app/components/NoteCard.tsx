// app/components/NoteCard.tsx
'use client';

export default function NoteCard({
    title,
    content,
    date,
}: {
    title: string;
    content: string;
    date: string;
}) {
    return (
        <div className="note-card">
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>
                {title}
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', lineHeight: 1.5 }}>
                {content}
            </p>
            <small style={{ color: '#94a3b8' }}>
                {date}
            </small>
        </div>
    );
}