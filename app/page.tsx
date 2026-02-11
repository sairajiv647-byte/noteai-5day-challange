// app/page.tsx
import NoteCard from './components/NoteCard';

const mockNotes = [
  {
    id: 1,
    title: '学习 Next.js 基础',
    content: '今天学习了 Next.js 的 App Router 和页面渲染方式，收获很大。',
    date: '2026-02-11',
  },
  {
    id: 2,
    title: 'Supabase 连接成功',
    content: '终于把 Next.js 和 Supabase 连接起来了，现在可以从数据库读取笔记了！',
    date: '2026-02-11',
  },
  {
    id: 3,
    title: '响应式设计思路',
    content: '使用 CSS Grid 和媒体查询，让页面在手机和电脑上都有良好的显示效果。',
    date: '2026-02-11',
  },
];

export default function Home() {
  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        NoteAI - 我的知识库
      </h1>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button className="create-button">
          + 创建笔记
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {mockNotes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            content={note.content}
            date={note.date}
          />
        ))}
      </div>
    </div>
  );
}