const gradients = [
  'from-indigo-500 to-fuchsia-500',
  'from-sky-500 to-emerald-500',
  'from-amber-500 to-rose-500',
  'from-violet-500 to-cyan-500',
  'from-pink-500 to-orange-500',
]

type Props = { name: string; size?: 'sm' | 'md' }

export default function Avatar({ name, size = 'md' }: Props) {
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br font-semibold text-white ${gradients[idx]} ${
        size === 'sm' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm'
      }`}
    >
      {initials}
    </div>
  )
}