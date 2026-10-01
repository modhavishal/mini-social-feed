import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Avatar from '../../../shared/components/ui/Avatar'
import { postSchema, type PostFormValues } from '../schema'
import { useCreatePost } from '../hooks'
import type { PostMedia } from '../types'

const MAX_MEDIA_SIZE = 20 * 1024 * 1024

export default function PostComposer() {
  const { mutate, isPending } = useCreatePost()
  const [media, setMedia] = useState<PostMedia[]>([])
  const [mediaError, setMediaError] = useState('')
  const mediaUrls = useRef(new Set<string>())
  const fileInput = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isValid },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    mode: 'onChange',
    defaultValues: { content: '' },
  })

  const length = watch('content').length

  const onSubmit = (values: PostFormValues) => {
    mutate(
      { content: values.content, media: media.length > 0 ? media : undefined },
      {
        onSuccess: () => {
          reset()
          setMedia([])
          mediaUrls.current.clear()
          if (fileInput.current) fileInput.current.value = ''
        },
      },
    )
  }

  const onMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    if (media.length + files.length > 3) {
      setMediaError('You can add up to 3 photos or videos per post.')
      event.target.value = ''
      return
    }
    if (files.some((file) => !file.type.startsWith('image/') && !file.type.startsWith('video/'))) {
      setMediaError('Choose image or video files.')
      event.target.value = ''
      return
    }
    if (files.some((file) => file.size > MAX_MEDIA_SIZE)) {
      setMediaError('Each photo or video must be 20 MB or smaller.')
      event.target.value = ''
      return
    }

    const addedMedia = files.map((file) => {
      const url = URL.createObjectURL(file)
      mediaUrls.current.add(url)
      return { url, type: file.type.startsWith('video/') ? 'video' as const : 'image' as const }
    })
    setMedia((current) => [...current, ...addedMedia])
    setMediaError('')
    event.target.value = ''
  }

  const removeMedia = (index: number) => {
    const removed = media[index]
    if (removed) {
      URL.revokeObjectURL(removed.url)
      mediaUrls.current.delete(removed.url)
    }
    setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setMediaError('')
  }

  useEffect(
    () => () => {
      mediaUrls.current.forEach((url) => URL.revokeObjectURL(url))
    },
    [],
  )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex gap-3">
        <Avatar name="You" />
        <textarea
          {...register('content')}
          rows={3}
          placeholder="What's on your mind?"
          className="w-full resize-none bg-transparent pt-2 text-[15px] outline-none placeholder:text-slate-400"
        />
      </div>
      {media.length > 0 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {media.map((item, index) => (
            <div key={item.url} className="relative w-28 shrink-0">
              {item.type === 'image' ? (
                <img src={item.url} alt={`Selected photo ${index + 1}`} className="aspect-video w-full rounded-xl object-cover" />
              ) : (
                <video src={item.url} controls className="aspect-video w-full rounded-xl bg-black object-contain" />
              )}
              <button
                type="button"
                onClick={() => removeMedia(index)}
                aria-label={`Remove media ${index + 1}`}
                className="absolute right-1 top-1 cursor-pointer rounded-full bg-black/70 px-2 py-1 text-xs text-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className={`text-xs ${length > 280 ? 'text-rose-500' : 'text-slate-400'}`}>
            {length}/280
          </span>
          <label className="cursor-pointer text-sm font-medium text-indigo-500 hover:text-indigo-600">
            Add photo/video ({media.length}/3)
            <input
              ref={fileInput}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={onMediaChange}
              className="sr-only"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={!isValid || isPending}
          className="cursor-pointer rounded-full bg-linear-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? 'Posting...' : 'Post'}
        </button>
      </div>
      {mediaError && <p role="alert" className="mt-2 text-sm text-rose-500">{mediaError}</p>}
    </form>
  )
}