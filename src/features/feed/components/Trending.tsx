const topics = [
  { tag: '#react', posts: '12.4K' },
  { tag: '#typescript', posts: '9.8K' },
  { tag: '#tailwindcss', posts: '7.1K' },
  { tag: '#webdev', posts: '5.6K' },
]

export default function Trending() {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <h2 className="mb-4 font-semibold">Trending</h2>
      <ul className="space-y-4">
        {topics.map((t) => (
          <li key={t.tag}>
            <p className="font-medium text-indigo-500">{t.tag}</p>
            <p className="text-xs text-slate-400">{t.posts} posts</p>
          </li>
        ))}
      </ul>
    </div>
  )
}