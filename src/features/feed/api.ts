import type { Comment, Post, PostMedia, PostsPage } from './types'

const PAGE_SIZE = 5
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const people = [
  ['Aarav Shah', 'aarav'],
  ['Meera Patel', 'meera.p'],
  ['Kabir Joshi', 'kabirj'],
  ['Ananya Desai', 'ananya.d'],
  ['Rohan Mehta', 'rohanm'],
  ['Isha Trivedi', 'isha.t'],
]

const captions = [
  'Shipped a new feature today. Small wins add up.',
  'Golden hour never gets old.',
  'Coffee, code and a quiet morning.',
  'Learning TypeScript generics, one error at a time.',
  'Weekend trip planning is half the fun.',
  'Design is how it works, not just how it looks.',
  'Clean code is a gift to your future self.',
  'Rain in the city, laptop open, perfect day.',
]

let db: Post[] = Array.from({ length: 30 }, (_, i) => {
  const [author, handle] = people[i % people.length]
  return {
    id: `p${i}`,
    author,
    handle,
    content: captions[i % captions.length],
    media:
      i % 3 === 0
        ? undefined
        : [{ type: 'image', url: `https://picsum.photos/seed/pulse${i}/900/560` }],
    likes: 8 + ((i * 7) % 90),
    liked: false,
    comments:
      i % 4 === 0
        ? [{
            id: `c${i}`,
            author: 'Meera Patel',
            text: 'Love this!',
            createdAt: Date.now() - 600_000,
            replies: [{
              id: `r${i}`,
              author: 'You',
              text: 'Thanks so much!',
              createdAt: Date.now() - 300_000,
            }],
          }]
        : [],
    createdAt: Date.now() - i * 3_600_000,
  }
})

const copy = (p: Post): Post => ({
  ...p,
  media: p.media ? [...p.media] : undefined,
  comments: p.comments.map((comment) => ({
    ...comment,
    replies: comment.replies ? [...comment.replies] : undefined,
  })),
})

export async function fetchPosts(page: number): Promise<PostsPage> {
  await sleep(700)
  const start = page * PAGE_SIZE
  return {
    posts: db.slice(start, start + PAGE_SIZE).map(copy),
    nextPage: start + PAGE_SIZE < db.length ? page + 1 : null,
  }
}

export async function createPost(input: { content: string; media?: PostMedia[] }): Promise<Post> {
  await sleep(500)
  const post: Post = {
    id: `p${Date.now()}`,
    author: 'You',
    handle: 'you',
    content: input.content,
    media: input.media,
    likes: 0,
    liked: false,
    comments: [],
    createdAt: Date.now(),
  }
  db = [post, ...db]
  return copy(post)
}

export async function updatePost(input: { postId: string; content: string }): Promise<void> {
  await sleep(300)
  db = db.map((post) =>
    post.id === input.postId ? { ...post, content: input.content } : post,
  )
}

export async function deletePost(id: string): Promise<void> {
  await sleep(300)
  db = db.filter((post) => post.id !== id)
}

export async function toggleLike(id: string): Promise<void> {
  await sleep(250)
  db = db.map((p) =>
    p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
  )
}

export async function addComment(input: {
  postId: string
  text: string
  parentCommentId?: string
}): Promise<void> {
  await sleep(300)
  const comment: Comment = {
    id: `c${Date.now()}`,
    author: 'You',
    text: input.text,
    createdAt: Date.now(),
  }
  db = db.map((post) => {
    if (post.id !== input.postId) return post
    if (!input.parentCommentId) return { ...post, comments: [...post.comments, comment] }
    return {
      ...post,
      comments: post.comments.map((parent) =>
        parent.id === input.parentCommentId
          ? { ...parent, replies: [...(parent.replies ?? []), comment] }
          : parent,
      ),
    }
  })
}