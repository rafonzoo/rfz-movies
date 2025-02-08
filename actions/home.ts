'use server'

import { insertFirstGenre } from '@/helpers/entity'
import { tmdb } from '@/lib/server'
import { createEpicStage, getDetailedEpic, type EpicType } from '@/actions/epic'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'
import { interleaveByMid } from '@/helpers/utils'

// const without = new Set([974950, 945961, 1156593])
const without = new Set([974950, 1156593])

export async function top10EpicMovies() {
  async function getLatestMovies() {
    const { genres, providers } = await tmdb.attributes('movie')
    const trending = await tmdb.query<EpicType>('/discover/movie', {
      filterItem: getDetailedEpic,
      filterResults: (shows) =>
        shows
          .filter((show) => !without.has(show.id))
          .filter((show) => show.popularity >= 500 || show.vote_count >= 1100),
      key: getLatestMovies.name,
      maxItem: 10,
      params: {
        'vote_count.gte': 200,
        'release_date.gte': dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
        'release_date.lte': dayjs().format('YYYY-MM-DD'),
        sort_by: 'popularity.desc',
        with_watch_providers: providers.map(({ provider_id }) => provider_id).join('|'),
      },
    })

    return insertFirstGenre(trending, genres)
  }

  async function getLatestSeries() {
    const { genres, providers } = await tmdb.attributes('tv')
    const tvShows = await tmdb.query<EpicType>('/discover/tv', {
      filterResults: (shows) => shows.filter((show) => show.genre_ids.length > 1),
      filterItem: getDetailedEpic,
      key: getLatestSeries.name,
      maxItem: 10,
      params: {
        'air_date.gte': dayjs().subtract(2, 'month').format('YYYY-MM-DD') /** 2024-10-30 */,
        'air_date.lte': dayjs().format('YYYY-MM-DD') /** 2025-03-30 */,
        'first_air_date.gte': dayjs().subtract(10, 'year').format('YYYY-MM-DD') /** 2021-01-30 */,
        sort_by: 'popularity.desc',
        with_watch_monetization_types: 'flatrate',
        with_watch_providers: providers.map(({ provider_id }) => provider_id).join('|'),
        without_genres: '16,99',
      },
    })

    tvShows.sort((a, b) => a.vote_count - b.vote_count)
    return insertFirstGenre(tvShows, genres)
  }

  const epicShow = await createEpicStage(getLatestMovies(), getLatestSeries())
  const sortedEpic = interleaveByMid(epicShow)
  return sortedEpic
}

export async function localeSwitcher(formData: FormData) {
  const cookieStore = await cookies()
  const locale = formData.get('locale-switcher') as string

  cookieStore.set('locale', locale)
  tmdb.resetState()
}
