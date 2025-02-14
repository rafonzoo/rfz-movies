'use client'

import { getShowImage, getShowTitle } from '@/helpers/entity'
import { useIntersectionStage, UseIntersectionStageProps } from '@/hooks'
import { tw } from '@/lib'
import { Shows } from '@/types/entity'

type StageCardProps<T extends () => Promise<any[]>> = UseIntersectionStageProps<T> & {
  // children?: React.ReactNode
}

const StageCard = <T extends () => Promise<Shows>>({ ...stageProps }: StageCardProps<T>) => {
  const { shows, ref } = useIntersectionStage<T>(stageProps)

  return (
    <div ref={ref} className='overflow-hidden pt-8'>
      <ul
        className={tw(
          'grid aspect-[1/1.5] max-h-[90svh] w-full snap-x snap-mandatory auto-cols-[100%] grid-flow-col overflow-auto bg-black md:aspect-video'
          // 'md:gap-x-5 md:px-0 max-h-[84.3756svh]',
          // 'md:auto-cols-[calc((100%_-_1_*_20px)_/_2)]',
          // 'lg:auto-cols-[calc((100%_-_2_*_20px)_/_3)]',
          // 'xl:auto-cols-[calc((100%_-_3_*_20px)_/_4)]'
        )}
      >
        {shows.map((show) => (
          <li
            key={show.id}
            className={tw(
              'relative snap-center md:snap-start',
              'before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[linear-gradient(180deg,rgba(12,12,12,.33),rgba(0,0,0,0)_44%)]',
              'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(rgba(0,_0,_0,_0)_40%,_rgba(0,_0,_0,_.7)_100%)]'
            )}
          >
            {show.poster_blank_path && (
              <picture className='pointer-events-none absolute left-0 top-0 h-full w-full'>
                <img
                  className='absolute bottom-0 left-0 h-full w-full object-cover md:hidden'
                  src={getShowImage(show.poster_blank_path, 500)}
                  alt={getShowTitle(show)}
                  loading='lazy'
                />
              </picture>
            )}
            <div className='absolute bottom-0 left-0 right-0 z-[2] flex flex-col items-center justify-center px-5 pb-5 text-center text-white/90'>
              {'logo_path' in show && (
                <picture className='mb-4 mt-auto flex w-full justify-inherit'>
                  <img
                    className='max-h-px-80 w-auto max-w-[190px]'
                    src={getShowImage(show.logo_path as string, 300)}
                    alt={getShowTitle(show) + ' Logo'}
                    loading='lazy'
                  />
                </picture>
              )}
              <p className='mb-4 max-w-[87.5%] text-xl font-semibold leading-[1.2] tracking-tight'>{`"${show.overview}"`}</p>
              <p className='text-sm opacity-90'>Currently on theater</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StageCard
