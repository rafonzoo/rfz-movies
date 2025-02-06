import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const imageCutout = `radial-gradient(
    circle closest-corner at calc(100% - 8px) 50%, 
    transparent 0, 
    transparent 100%, 
    black 100%
)`

const maskImage = `linear-gradient(
  to bottom,
  transparent,
  rgba(0, 0, 0, 0.068) 3.3%,
  rgba(0, 0, 0, 0.145) 5.9%,
  rgba(0, 0, 0, 0.227) 8.1%,
  rgba(0, 0, 0, 0.313) 10.1%,
  rgba(0, 0, 0, 0.401) 12.1%,
  rgba(0, 0, 0, 0.49) 14.6%,
  rgba(0, 0, 0, 0.578) 17.7%,
  rgba(0, 0, 0, 0.661) 21.8%,
  rgba(0, 0, 0, 0.74) 27.1%,
  rgba(0, 0, 0, 0.812) 33.9%,
  rgba(0, 0, 0, 0.875) 42.4%,
  rgba(0, 0, 0, 0.927) 53%,
  rgba(0, 0, 0, 0.966) 66%,
  rgba(0, 0, 0, 0.991) 81.5%,
  rgba(0, 0, 0, 0.991) 100%
)`

function rem(px: number, root = 16) {
  return px / root + 'rem'
}

function divisible(by = 3) {
  const res: { [x: string]: string } = {}

  let length = 10
  let start = by

  while (length) {
    const avoid = start % 4 !== 0 || start > 40

    if (!(start % by) && avoid) {
      res['px-' + start] = rem(start)
      length--
    }

    start += by
  }

  return res
}

const spacing = Object.fromEntries(
  Object.entries({
    ...divisible(),
    ...divisible(7),
    ...divisible(10),
    ...divisible(20),
  }).sort(([a], [b]) => parseInt(a.replace('px-', ''), 10) - parseInt(b.replace('px-', ''), 10))
)

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        root: [rem(16), rem(24)],
        base: [rem(15), rem(20)],
        caption: [rem(13), rem(18)],
        footnote: [rem(11), rem(16)],
      },
      spacing: { ...spacing },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) =>
      addUtilities({
        '.justify-inherit': { 'justify-content': 'inherit' },
        '.mask-depth-transparency': {
          '-webkit-mask-image': maskImage,
          'mask-image': maskImage,
        },
        '.mask-cutout-circle-right': {
          '-webkit-mask-image': imageCutout,
          'mask-image': imageCutout,
        },
      })
    ),
  ],
} satisfies Config
