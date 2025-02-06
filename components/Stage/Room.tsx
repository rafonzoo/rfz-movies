'use client'

import { getShowImage } from '@/helpers/entity'
import { tw } from '@/lib'
import { Show, Shows } from '@/types/entity'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'

type RoomStageProps = {
  shows: (Show & { logo_path?: string })[]
  frontRows: Shows
  children?: ReactNode
}

const RoomStage: FC<RoomStageProps> = ({ shows }) => {
  const [mounted, setMounted] = useState(false)
  const stageRef = useRef<HTMLUListElement | null>(null)
  const isReady = !!shows.length && mounted

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const current = stageRef.current
    const next = current?.nextElementSibling
    const nextChild = next?.firstElementChild as HTMLElement | null

    if (!current || !next || !nextChild) return

    // const observer = new ResizeObserver(([entry]) => {
    //   if (Math.min(window.innerWidth, 1920) >= 1536) {
    //     document.documentElement.style.setProperty(
    //       '--stage-epic-roll',
    //       `${entry.borderBoxSize[0].blockSize}`
    //     )
    //   } else {
    //     document.documentElement.style.removeProperty('--stage-epic-roll')
    //   }
    // })

    // observer.observe(nextChild)
    // return () => observer.unobserve(nextChild)
  }, [])

  return (
    <section>
      <ul
        ref={stageRef}
        className={tw(
          'aspect-[9_/_16] max-h-[calc(90lvh_-_54px)] min-h-[480px] w-full snap-x overflow-auto whitespace-nowrap bg-black text-[0]',
          'md:aspect-video md:max-h-[100lvh] md:min-h-[432px]',
          // 'lg:max-h-[calc(100lvh_-_54px)]',
          isReady && 'snap-mandatory scroll-smooth *:snap-start' // prettier-ignore
        )}
      >
        {shows.map((show) => (
          <li
            key={show.id}
            className='relative inline-block h-full w-full overflow-hidden whitespace-normal text-[15px]'
          >
            {/* Picture */}
            {isReady && (
              <picture className='pointer-events-none absolute left-0 top-0 h-full w-full'>
                <source
                  media='(min-width: 768px)'
                  srcSet={getShowImage(show.backdrop_path, 1280)}
                />
                <img
                  className='absolute left-0 top-0 h-full w-full object-cover md:object-top'
                  src={getShowImage(show.poster_path, 500)}
                  alt=''
                  loading='lazy'
                />
              </picture>
            )}
            <div className='pointer-events-none relative z-[2] h-full w-full'>
              {/* Content */}
              <div className='justify-en flex h-full flex-col text-white'>
                {show.logo_path && (
                  <picture className='mb-auto md:mx-10 md:mt-10'>
                    <source media='(min-width: 768px)' srcSet={getShowImage(show.logo_path, 500)} />
                    <img
                      src={getShowImage(show.logo_path, 300)}
                      alt=''
                      loading='lazy'
                      className={tw(
                        'pointer-events-auto w-fit',
                        'md:max-h-[164px] md:max-w-[calc((1_*_((100%_-_80px_-_2_*_20px)/_3_+_80px))_-_20px)]',
                        'lg:max-h-[234px] lg:max-w-[calc((1_*_((100%_-_80px_-_2_*_20px)/_4_+_80px))_-_20px)]',
                        'xl:max-h-[unset] xl:max-w-[calc((1_*_((100%_-_80px_-_2_*_20px)/_5_+_80px))_-_20px)]'
                      )}
                    />
                  </picture>
                )}
                <div className='pointer-events-auto relative grid grid-cols-3 pb-10 pt-[70px] md:gap-5 md:px-10 lg:grid-cols-4 xl:grid-cols-5'>
                  <div className='text-root flex flex-col space-y-2'>
                    <button className='inline-flex h-12 w-full items-center justify-center rounded-md bg-white font-semibold text-black'>
                      Watch now
                    </button>
                    <button className='inline-flex h-12 w-full items-center justify-center rounded-md bg-white/50 font-semibold text-black'>
                      Lihat trailer
                    </button>
                  </div>
                  <div className='col-start-2 col-end-3 flex flex-col !leading-[1.32] lg:col-end-4 xl:col-end-5'>
                    <p className='mb-2.5 line-clamp-4 opacity-90'>{show.overview}</p>
                    <p className='mt-auto text-xs opacity-60'>Drama / Trending</p>
                  </div>
                  <div className='absolute bottom-0 left-0 z-[-1] h-[120%] w-full bg-[rgba(40,40,40,.5)] backdrop-blur-[60px] backdrop-saturate-[190%] mask-depth-transparency'></div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RoomStage
