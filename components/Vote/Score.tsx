import { tw } from '@/lib'
import { FC } from 'react'

type VoteScoreProps = {
  percentage: number // Expected percentage (0-100)
}

const VoteScore: FC<VoteScoreProps> = ({ percentage }) => {
  const radius = 50 // Radius of the circle in the viewBox
  const strokeWidth = 6 // Stroke width of the path
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100) // Clamp percentage between 0 and 100

  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(normalizedPercentage / 100) * circumference} ${circumference}`
  const colorClasses = tw(
    percentage >= 70
      ? 'stroke-green-500'
      : percentage > 50
        ? 'stroke-yellow-300'
        : percentage === 0
          ? 'stroke-zinc-400'
          : 'stroke-red-500'
  )

  return (
    <div className='absolute -bottom-px-3 right-px-3 flex aspect-square w-8 origin-bottom-right scale-[.9] items-center justify-center rounded-full bg-black text-white md:scale-100'>
      <p className='text-[.75em] font-bold leading-[1] tracking-tight dark:font-semibold'>
        {percentage ? (percentage / 10).toFixed(1) : 0}
      </p>
      <svg className='pointer-events-none absolute inset-0' viewBox='0 0 120 120'>
        {/* Background Circle */}
        <circle
          cx='60'
          cy='60'
          r={radius}
          fill='none'
          strokeWidth={strokeWidth}
          className={tw('opacity-40', colorClasses)}
          strokeLinecap='round'
        />

        {/* Circular Path */}
        <circle
          cx='60'
          cy='60'
          r={radius}
          fill='none'
          className={colorClasses}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset='0'
          transform='rotate(-90 60 60)' // Rotate to start from top
          strokeLinecap='round'
        />
      </svg>
    </div>
  )
}

export default VoteScore
