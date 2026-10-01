export type Comment = {
  id: string
  author: string
  text: string
  createdAt: number
  replies?: Comment[]
}

export type PostMedia = {
  url: string
  type: 'image' | 'video'
}

export type Post = {
  id: string
  author: string
  handle: string
  content: string
  media?: PostMedia[]
  likes: number
  liked: boolean
  comments: Comment[]
  createdAt: number
}

export type PostsPage = {
  posts: Post[]
  nextPage: number | null
}