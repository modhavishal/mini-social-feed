import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Avatar from '../../../shared/components/ui/Avatar'
import { timeAgo } from '../../../shared/utils/timeAgo'
import { useDeletePost, useEditPost, useToggleLike } from '../hooks'
import type { Post } from '../types'
import CommentSection from './CommentSection'

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.5 5.4 5.4 0 0 1 21.3 12C19 16.4 12 21 12 21Z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-5.5A8 8 0 1 1 21 12Z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m14 5 5 5M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2.8 19a1.3 1.3 0 0 0 1.1 2h16.2a1.3 1.3 0 0 0 1.1-2L12 3Z" />
      <path d="M12 9v4m0 3h.01" />
    </svg>
  )
}

export default function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [draft, setDraft] = useState(post.content)
  const [activeMedia, setActiveMedia] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const mediaTrack = useRef<HTMLDivElement>(null)
  const lightboxDialog = useRef<HTMLDivElement>(null)
  const lightboxCloseButton = useRef<HTMLButtonElement>(null)
  const imageTrigger = useRef<HTMLButtonElement | null>(null)
  const deleteDialog = useRef<HTMLDialogElement>(null)
  const deleteTrigger = useRef<HTMLButtonElement | null>(null)
  const lightboxImages = post.media?.filter((item) => item.type === 'image') ?? []
  const isLightboxOpen = lightboxIndex !== null
  const { mutate: toggleLike } = useToggleLike()
  const { mutate: editPost, isPending: isSaving } = useEditPost()
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost()
  const commentCount = post.comments.reduce(
    (total, comment) => total + 1 + (comment.replies?.length ?? 0),
    0,
  )

  const saveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content) return
    editPost({ postId: post.id, content }, { onSuccess: () => setIsEditing(false) })
  }

  const confirmDelete = () => {
    deletePost(post.id, { onSuccess: () => setIsDeleteDialogOpen(false) })
  }

  const showMedia = (index: number) => {
    const track = mediaTrack.current
    if (track) track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!isLightboxOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxIndex(null)
        setLightboxZoom(1)
      }
      if (event.key === 'Tab') {
        const buttons = lightboxDialog.current?.querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled)',
        )
        if (!buttons?.length) return
        const firstButton = buttons[0]
        const lastButton = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === firstButton) {
          event.preventDefault()
          lastButton.focus()
        } else if (!event.shiftKey && document.activeElement === lastButton) {
          event.preventDefault()
          firstButton.focus()
        }
      }
      if (event.key === '+' || event.key === '=') {
        setLightboxZoom((zoom) => Math.min(4, zoom + 0.5))
      }
      if (event.key === '-') setLightboxZoom((zoom) => Math.max(1, zoom - 0.5))
      if (lightboxImages.length < 2) return
      if (event.key === 'ArrowLeft') {
        setLightboxIndex((index) => index === null ? null : (index - 1 + lightboxImages.length) % lightboxImages.length)
        setLightboxZoom(1)
      }
      if (event.key === 'ArrowRight') {
        setLightboxIndex((index) => index === null ? null : (index + 1) % lightboxImages.length)
        setLightboxZoom(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    lightboxCloseButton.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      imageTrigger.current?.focus()
    }
  }, [isLightboxOpen, lightboxImages.length])

  const moveLightbox = (direction: -1 | 1) => {
    setLightboxIndex((index) =>
      index === null ? null : (index + direction + lightboxImages.length) % lightboxImages.length,
    )
    setLightboxZoom(1)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    setLightboxZoom(1)
  }

  useEffect(() => {
    const dialog = deleteDialog.current
    if (!dialog) return
    if (isDeleteDialogOpen && !dialog.open) dialog.showModal()
    if (!isDeleteDialogOpen && dialog.open) dialog.close()
  }, [isDeleteDialogOpen])

  return (
    <article className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-md dark:border-white/10 dark:bg-white/5">
      <header className="flex items-center gap-3">
        <Avatar name={post.author} />
        <div className="leading-tight">
          <p className="font-semibold">{post.author}</p>
          <p className="text-xs text-slate-400">
            @{post.handle} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {post.author === 'You' && (
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setDraft(post.content)
                setIsEditing(true)
              }}
              title="Edit post"
              aria-label="Edit post"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-indigo-500/10 hover:text-indigo-500"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              ref={deleteTrigger}
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
              title="Delete post"
              aria-label="Delete post"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed"
            >
              <DeleteIcon />
            </button>
          </div>
        )}
      </header>

      {isEditing ? (
        <form onSubmit={saveEdit} className="mt-4 space-y-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={280}
            rows={3}
            aria-label="Edit post text"
            className="w-full resize-y rounded-xl border border-slate-200 bg-transparent p-3 text-[15px] outline-none focus:border-indigo-500 dark:border-white/10"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{draft.length}/280</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="cursor-pointer text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!draft.trim() || isSaving}
                className="cursor-pointer font-semibold text-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-[15px] leading-relaxed">{post.content}</p>
      )}

      {!!post.media?.length && (
        <div
          role="region"
          aria-label="Post media"
          aria-roledescription="carousel"
          className="relative mt-4 overflow-hidden rounded-2xl bg-black"
        >
          <div
            ref={mediaTrack}
            onScroll={(event) => {
              const track = event.currentTarget
              setActiveMedia(Math.round(track.scrollLeft / track.clientWidth))
            }}
            className="media-carousel-track flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          >
            {post.media.map((item, index) => (
              <div key={item.url} className="w-full shrink-0 snap-center">
                {item.type === 'image' ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      imageTrigger.current = event.currentTarget
                      setLightboxZoom(1)
                      setLightboxIndex(lightboxImages.findIndex((image) => image.url === item.url))
                    }}
                    aria-label={`Open image ${index + 1} in lightbox`}
                    className="group block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
                  >
                    <img
                      src={item.url}
                      alt={`Post media ${index + 1}`}
                      loading="lazy"
                      className="aspect-video w-full object-cover transition duration-200 group-hover:brightness-90"
                    />
                  </button>
                ) : (
                  <video
                    src={item.url}
                    controls
                    preload="metadata"
                    className="aspect-video w-full object-contain"
                  />
                )}
              </div>
            ))}
          </div>
          {post.media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => showMedia(Math.max(0, activeMedia - 1))}
                disabled={activeMedia === 0}
                aria-label="Previous media"
                className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/60 text-xl text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => showMedia(Math.min(post.media!.length - 1, activeMedia + 1))}
                disabled={activeMedia === post.media.length - 1}
                aria-label="Next media"
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/60 text-xl text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                {post.media.map((item, index) => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => showMedia(index)}
                    aria-label={`Show media ${index + 1}`}
                    aria-current={activeMedia === index}
                    className={`h-2 w-2 cursor-pointer rounded-full ${activeMedia === index ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
        <button
          onClick={() => toggleLike(post.id)}
          className={`flex cursor-pointer items-center gap-2 transition hover:scale-105 ${post.liked ? 'text-rose-500' : 'hover:text-rose-500'}`}
        >
          <HeartIcon filled={post.liked} />
          {post.likes}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex cursor-pointer items-center gap-2 transition hover:text-indigo-500"
        >
          <CommentIcon />
          {commentCount}
        </button>
      </div>

      {showComments && <CommentSection post={post} />}
      {post.author === 'You' && (
        <dialog
          ref={deleteDialog}
          aria-labelledby={`delete-title-${post.id}`}
          aria-describedby={`delete-description-${post.id}`}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            deleteTrigger.current?.focus()
          }}
          onCancel={(event) => {
            event.preventDefault()
            setIsDeleteDialogOpen(false)
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsDeleteDialogOpen(false)
          }}
          className="m-auto w-[min(24rem,calc(100vw-2rem))] max-w-none rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60 dark:border-white/10 dark:bg-[#171923] dark:text-slate-100"
        >
          <div className="p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-500/10 text-rose-500">
                <AlertIcon />
              </span>
              <div>
                <h2 id={`delete-title-${post.id}`} className="font-semibold">Delete this post?</h2>
                <p id={`delete-description-${post.id}`} className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  This post will be permanently removed from your feed.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DeleteIcon />
                {isDeleting ? 'Deleting...' : 'Delete post'}
              </button>
            </div>
          </div>
        </dialog>
      )}
      {isLightboxOpen && lightboxIndex !== null && lightboxImages[lightboxIndex] && createPortal(
        <div
          ref={lightboxDialog}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox()
          }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            ref={lightboxCloseButton}
            type="button"
            onClick={closeLightbox}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white/10 text-3xl leading-none text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
          >
            ×
          </button>
          {lightboxImages.length > 1 && (
            <button
              type="button"
              onClick={() => moveLightbox(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-6"
            >
              ‹
            </button>
          )}
          <div className="h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] overflow-auto sm:w-[calc(100vw-9rem)]">
            <img
              src={lightboxImages[lightboxIndex].url}
              alt={`Post image ${lightboxIndex + 1} of ${lightboxImages.length}`}
              draggable={false}
              style={{ width: `${lightboxZoom * 100}%`, height: `${lightboxZoom * 100}%` }}
              className="select-none object-contain"
            />
          </div>
          {lightboxImages.length > 1 && (
            <button
              type="button"
              onClick={() => moveLightbox(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-6"
            >
              ›
            </button>
          )}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#111318]/90 px-3 py-2 text-sm text-white shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={() => setLightboxZoom((zoom) => Math.max(1, zoom - 0.5))}
              disabled={lightboxZoom <= 1}
              aria-label="Zoom out"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-lg transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              −
            </button>
            <span className="min-w-12 text-center tabular-nums">{Math.round(lightboxZoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setLightboxZoom((zoom) => Math.min(4, zoom + 0.5))}
              disabled={lightboxZoom >= 4}
              aria-label="Zoom in"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-lg transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              +
            </button>
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/20" />
            <button
              type="button"
              onClick={() => setLightboxZoom(1)}
              disabled={lightboxZoom === 1}
              className="cursor-pointer rounded-full px-2 py-1 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              Fit
            </button>
            <span className="ml-1 border-l border-white/20 pl-3 tabular-nums text-white/60">
              {lightboxIndex + 1} / {lightboxImages.length}
            </span>
          </div>
        </div>,
        document.body,
      )}
    </article>
  )
}