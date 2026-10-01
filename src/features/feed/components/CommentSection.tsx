import { useState } from 'react'
import Avatar from '../../../shared/components/ui/Avatar'
import { timeAgo } from '../../../shared/utils/timeAgo'
import { useAddComment } from '../hooks'
import type { Post } from '../types'

export default function CommentSection({ post }: { post: Post }) {
  const [text, setText] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replyTo, setReplyTo] = useState<{
    rootId: string
    targetId: string
    author: string
  } | null>(null)
  const { mutate, isPending } = useAddComment()

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    mutate({ postId: post.id, text: value }, { onSuccess: () => setText('') })
  }

  const submitReply = (e: React.FormEvent<HTMLFormElement>, parentCommentId: string) => {
    e.preventDefault()
    const value = replyText.trim()
    if (!value) return
    mutate(
      { postId: post.id, parentCommentId, text: value },
      {
        onSuccess: () => {
          setReplyText('')
          setReplyTo(null)
        },
      },
    )
  }

  const toggleReply = (rootId: string, targetId: string, author: string) => {
    setReplyTo((current) =>
      current?.targetId === targetId ? null : { rootId, targetId, author },
    )
    setReplyText('')
  }

  return (
    <section
      aria-label="Comments"
      className="mt-5 space-y-5 border-t border-slate-200/70 pt-5 dark:border-white/10"
    >
      {post.comments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar name={comment.author} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm dark:bg-white/10">
                <p className="mb-1 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold">{comment.author}</span>
                  <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
                </p>
                <p className="break-words leading-relaxed">{comment.text}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleReply(comment.id, comment.id, comment.author)}
                className="ml-2 mt-1 cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-indigo-500"
              >
                Reply
              </button>
            </div>
          </div>

          {comment.replies?.map((reply) => (
            <div
              key={reply.id}
              className="ml-5 flex items-start gap-3 border-l-2 border-indigo-200 pl-3 dark:border-indigo-400/30 sm:ml-10 sm:pl-4"
            >
              <Avatar name={reply.author} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-indigo-50/80 px-4 py-3 text-sm dark:bg-indigo-400/10">
                  <p className="mb-1 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{reply.author}</span>
                    <span className="text-xs text-slate-400">{timeAgo(reply.createdAt)}</span>
                  </p>
                  <p className="break-words leading-relaxed">{reply.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleReply(comment.id, reply.id, reply.author)}
                  className="ml-2 mt-1 cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-indigo-500"
                >
                  Reply
                </button>
              </div>
            </div>
          ))}

          {replyTo?.rootId === comment.id && (
            <form
              onSubmit={(event) => submitReply(event, replyTo.rootId)}
              className="ml-5 flex gap-2 border-l-2 border-indigo-200 pl-3 sm:ml-10 sm:pl-4 dark:border-indigo-400/30"
            >
              <label className="sr-only" htmlFor={`reply-${comment.id}`}>
                Reply to {replyTo.author}
              </label>
              <input
                autoFocus
                id={`reply-${comment.id}`}
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder={`Reply to ${replyTo.author}...`}
                className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white/60 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5"
              />
              <button
                type="submit"
                disabled={isPending || !replyText.trim()}
                className="cursor-pointer rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reply
              </button>
            </form>
          )}
        </div>
      ))}

      <form onSubmit={submit} className="flex gap-2 border-t border-slate-200/60 pt-4 dark:border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          aria-label="Write a comment"
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white/60 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5"
        />
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="cursor-pointer rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Comment
        </button>
      </form>
    </section>
  )
}