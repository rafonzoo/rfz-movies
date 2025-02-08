'use client'

import { getShowImage, getShowTitle } from '@/helpers/entity'
import { useIntersectionStage, UseIntersectionStageProps } from '@/hooks'
import { tw } from '@/lib'
import { Flatrate, Show } from '@/types/entity'
import { IoIosCheckmarkCircle } from 'react-icons/io'

type EpicStageProps<T extends () => Promise<any[]>> = UseIntersectionStageProps<T> & {
  // children?: React.ReactNode
}

type EpicStageShow = Show & {
  logo_path: string
  poster_blank_path: string
  certification: string
  providers: Flatrate[]
  canWatch: boolean
  isUpcoming: boolean
  latest_season_number: number
  latest_season_length: number
}

const EpicStage = <T extends () => Promise<EpicStageShow[]>>({
  ...stageProps
}: EpicStageProps<T>) => {
  const { shows, ref } = useIntersectionStage<T>(stageProps)

  return (
    <div
      ref={ref}
      data-snap='scope'
      className={tw(
        'relative overflow-hidden',
        'before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[linear-gradient(180deg,rgba(12,12,12,.23),rgba(0,0,0,0)_44%)]',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(rgba(0,_0,_0,_0)_40%,_rgba(0,_0,_0,_.7)_100%)]'
      )}
    >
      <ul
        data-snap='scroll'
        className='z-[2] aspect-[9_/_16] max-h-[90svh] w-full snap-x snap-mandatory overflow-x-auto scroll-smooth whitespace-nowrap bg-black text-[0] *:snap-start md:aspect-video'
      >
        {shows.map((show) => (
          <li
            key={show.id}
            className={tw(
              'relative inline-block h-full w-full whitespace-normal text-base',
              'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(0deg,rgba(12,12,12,.23),rgba(0,0,0,0)_44%)]'
            )}
          >
            <picture
              data-snap='parallax-entry'
              className='pointer-events-none absolute left-0 top-0 h-full w-full'
            >
              {/* <source srcSet={getShowImage(show.backdrop_path, 780)} media='(min-width: 768px)' />
              <source srcSet={getShowImage(show.backdrop_path, 1280)} media='(min-width: 1280px)' /> */}
              <img
                className='absolute bottom-0 left-0 h-full w-full object-cover md:hidden'
                data-snap='parallax-exit'
                src={getShowImage(show.poster_blank_path, 500)}
                alt={getShowTitle(show)}
                loading='lazy'
              />
            </picture>
            <div
              data-snap='fade'
              className={tw(
                'absolute bottom-0 left-0 right-0 z-[2] flex flex-col items-center justify-center px-5 pb-11 text-center text-white/90',
                'md:right-auto md:w-[530px] md:justify-start md:px-10 md:text-left'
              )}
            >
              {'logo_path' in show && (
                <picture className='flex w-full justify-inherit'>
                  <img
                    className='max-h-px-60 w-auto max-w-px-240'
                    src={getShowImage(show.logo_path as string, 300)}
                    alt={getShowTitle(show) + ' Logo'}
                    loading='lazy'
                  />
                </picture>
              )}
              <div className='mb-px-3 mt-px-7 flex w-full items-center text-caption tracking-wide text-white/55 justify-inherit'>
                {show.isUpcoming ? (
                  <>
                    {show.latest_season_number > 1 ? (
                      <span>UPCOMING (S{show.latest_season_number})</span>
                    ) : (
                      <span className='text-footnote uppercase tracking-wider'>SEGERA TAYANG</span>
                    )}
                  </>
                ) : show.latest_season_number > 1 ? (
                  <span>{`S${show.latest_season_number} · E${show.latest_season_length}`}</span>
                ) : (
                  <>
                    <span>{show.first_genre_name || ''}</span>
                  </>
                )}
                {!show.isUpcoming && (
                  <span className='ml-1 flex h-px-14 items-center rounded border border-[currentColor] px-0.5 text-footnote text-white/45'>
                    {show.certification}
                  </span>
                )}
                {show.canWatch && (
                  <p className='flex items-center'>
                    <span className='mx-1.5'>|</span>
                    <IoIosCheckmarkCircle size={16} />
                    <span className='ml-0.5'>Subtitle</span>
                  </p>
                )}
              </div>
              <p className='line-clamp-2'>{show.overview}</p>
              <div className='mt-2 flex w-full items-center text-caption tracking-wide justify-inherit'>
                <div className='flex flex-row-reverse flex-nowrap'>
                  {show.providers.slice(0, 4).map((rate, index) => (
                    <img
                      key={index}
                      src={getShowImage(rate.logo_path, 45)}
                      style={
                        index
                          ? {
                              transform: `scale(${Math.min((10 - index * 2) / 10, 1)})`,
                              transformOrigin: `${Math.max(index, 0)}0% 50%`,
                            }
                          : void 0
                      }
                      className={tw(
                        '-mr-px-21 aspect-square w-7 rounded-full first:mr-0',
                        index && 'mask-cutout-circle-right'
                      )}
                      alt={rate.provider_name}
                      width={28}
                      loading='lazy'
                    />
                  ))}
                </div>
                {show.providers[0] && (
                  <p className='flex max-w-[calc(100%_-_49px)] justify-center truncate'>
                    <span className='ml-1.5 truncate'>{show.providers[0].provider_name}</span>
                    {show.providers.length > 1 && (
                      <span className='ml-1.5 opacity-60'>({show.providers.length - 1}+)</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <ul className='relative z-[3] mx-[17%] -mt-11 flex h-11 items-center justify-center'>
        {shows.map((list, index) => (
          <li
            style={{ '--i': `${index + 1}`, '--x': `${100 / shows.length}%` } as any}
            key={list.id}
            data-snap='indicator'
            className='flex aspect-square w-4 scale-[.45] cursor-pointer items-center justify-center rounded-full bg-white opacity-30'
          ></li>
        ))}
      </ul>
    </div>
  )
}

export { EpicStage as default, type EpicStageShow }
