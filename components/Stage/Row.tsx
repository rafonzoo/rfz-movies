'use client'

import { tw } from '@/lib'
import { BsChevronCompactRight, BsChevronCompactLeft } from 'react-icons/bs'
import { getShowImage, getShowTitle } from '@/helpers/entity'
import { useIntersectionStage, UseIntersectionStageProps } from '@/hooks'

type StageSeatProps<T extends () => Promise<any[]>> = UseIntersectionStageProps<T> & {
  className?: string
  children?: React.ReactNode
}

const itemClasses = tw(
  'relative aspect-[2/3] overflow-hidden rounded-md shadow-lg md:rounded-[10px] dark:bg-zinc-700'
)

const StageSeat = <T extends () => Promise<any[]>>({
  children,
  ...stageProps
}: StageSeatProps<T>) => {
  const { shows, ref } = useIntersectionStage<T>(stageProps)

  return (
    <div>
      <div className='-mb-1.5 px-5 pt-6 text-lg font-semibold tracking-tight md:px-10'>
        {children || (
          <span className={tw(shows.length ? void 0 : 'text-transparent')}>Loading...</span>
        )}
      </div>
      <div ref={ref} className='group/stage pointer-events-auto relative'>
        <div
          className={tw(
            'grid snap-x grid-flow-col gap-x-px-14 overflow-auto px-5 pt-2.5',
            'md:mx-px-30 md:snap-mandatory md:gap-0 md:px-0',

            // Column
            'auto-cols-[calc((100%_-_1_*_14px)_/_2.1)]',
            'md:auto-cols-[calc((100%_-_3_*_0px)_/_4)]',
            'lg:auto-cols-[calc((100%_-_4_*_0px)_/_5)]',
            'xl:auto-cols-[calc((100%_-_5_*_0px)_/_6)]',
            '2xl:auto-cols-[calc((100%_-_6_*_0px)_/_7)]'
          )}
        >
          {shows.length > 0
            ? shows.map((show) => (
                <div key={show.id} className='md:snap-start md:px-2.5'>
                  <div className={itemClasses}>
                    <picture className='absolute left-0 top-0 h-full w-full'>
                      <img
                        src={getShowImage(show.poster_path, 342)}
                        alt={getShowTitle(show)}
                        className='absolute left-0 top-0 h-full w-full object-cover'
                        loading='lazy'
                      />
                    </picture>
                  </div>
                  <div className='mt-1.5 grid grid-cols-[auto_1fr] gap-x-1'>
                    <div className={tw('w-full truncate')}>
                      <p className='truncate text-caption'>{getShowTitle(show)}</p>
                      <p className='truncate text-xs opacity-70 dark:opacity-60'>
                        {show.first_genre_name}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            : Array.from({ length: 12 }).map((_, index) => (
                <div key={index}>
                  <div className='md:px-2.5'>
                    <div className={itemClasses} />
                  </div>
                  <div className='h-10' />
                </div>
              ))}
        </div>
        <div className='hidden md:block'>
          <div className='invisible absolute bottom-11 left-0 top-0 flex w-10 items-center justify-center opacity-50'>
            <BsChevronCompactLeft size={32} />
          </div>
          <div className='absolute bottom-11 right-0 top-0 flex w-10 items-center justify-center opacity-50'>
            <BsChevronCompactRight size={32} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StageSeat
