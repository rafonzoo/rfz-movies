'use client'

import { top10EpicMovies } from '@/actions/home'
import EpicStage from '@/components/Stage/Epic'

export default function Home() {
  // const epicHowm = await top10EpicMovies()
  return (
    <main>
      <EpicStage id='asdasd' action={top10EpicMovies} />
    </main>
  )
}
