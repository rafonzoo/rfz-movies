'use client'

import {
  getLatestShow,
  getTrendingMovies,
  getTrendingSeries,
  getTopRatedMovies,
  getTopRatedSeries,
  getTopRatedShows,
  getTheaterMovies,
} from '@/actions/home'
import EpicStage from '@/components/Stage/Epic'
import StageSeat from '@/components/Stage/Row'
import StageCard from '@/components/Stage/Card'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <EpicStage id='HOME_EPIC_LATEST' action={getLatestShow} />
      <StageSeat id='HOME_SEAT_MOVIES' action={getTrendingMovies}>
        Film-film terbaru
      </StageSeat>
      <StageSeat id='HOME_SEAT_NEWEPS' action={getTrendingSeries}>
        Episode terbaru
      </StageSeat>
      <StageSeat id='HOME_SEAT_NEWAIR' action={getTrendingSeries.bind(null, false)}>
        Tayang perdana
      </StageSeat>

      <StageCard id='HOME_CARD_TOP_SHOWS' action={getTopRatedShows} />
      <StageSeat id='HOME_SEAT_TOP_MOVIES' action={getTopRatedMovies}>
        Paling dicari: Film
      </StageSeat>
      <StageSeat id='HOME_SEAT_TOP_SERIES' action={getTopRatedSeries}>
        Paling dicari: TV
      </StageSeat>
      <StageSeat id='HOME_SEAT_TOP_CINEMA' action={getTheaterMovies}>
        Bioskop hari ini
      </StageSeat>
      {/* <div className='mt-6 aspect-[1/1.5] max-h-[672px] w-full bg-black md:mt-10 md:aspect-video'></div> */}
      {/* <StageCard id='HOME_SEAT_TOP_UPCOMING' action={getEpicIndonesianMovies} /> */}

      {/* asd */}
      <Link href='/test' className='mt-10 inline-block'>
        Go to another page test
      </Link>
    </main>
  )
}

// export const dynamic = 'force-dynamic'
