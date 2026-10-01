import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import * as api from './api'
import type { PostsPage } from './types'

type Cache = InfiniteData<PostsPage, number>

export function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => api.fetchPosts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage ?? undefined,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createPost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.addComment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.toggleLike,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['posts'] })
      const previous = qc.getQueryData<Cache>(['posts'])
      qc.setQueryData<Cache>(['posts'], (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                posts: page.posts.map((p) =>
                  p.id === id
                    ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
                    : p,
                ),
              })),
            }
          : old,
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(['posts'], ctx.previous)
    },
  })
}

export function useEditPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.updatePost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deletePost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}