import { useEffect, useRef } from 'react'
import PostCard from '../components/PostCard'
import PostComposer from '../components/PostComposer'
import PostSkeleton from '../components/PostSkeleton'
import { usePosts } from '../hooks'

export default function FeedPage() {
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePosts()
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  return (
    <>
      <PostComposer />

      {isPending && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {isError && (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5 text-center text-sm">
          Something went wrong.{' '}
          <button onClick={() => refetch()} className="cursor-pointer font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isFetchingNextPage && <PostSkeleton />}

      <div ref={sentinel} />

      {!hasNextPage && posts.length > 0 && (
        <p className="py-6 text-center text-sm text-slate-400">You're all caught up ✨</p>
      )}
    </>
  )
}