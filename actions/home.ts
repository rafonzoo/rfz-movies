'use server'

import { createEpicStage, EpicType, getDetailedEpic } from '@/actions/epic'
import { getDetailedCard } from '@/actions/helper'
import { insertFirstGenre, sortByRate } from '@/helpers/entity'
import { tmdb } from '@/lib/server'
import { Movie, TV } from '@/types/entity'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'

async function getLatestMovies() {
  const { genres, providers } = await tmdb.attributes('movie')
  const movieShows = await tmdb.query<EpicType>('/discover/movie', {
    filterItem: getDetailedEpic,
    key: getLatestMovies.name,
    maxItem: 10,
    maxPage: 3,
    params: {
      without_genres: '27',
      'vote_average.gte': 6,
      'release_date.gte': dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
      with_watch_providers: providers.map(({ provider_id }) => provider_id).join('|'),
    },
  })

  return insertFirstGenre(movieShows, genres)
}

async function getLatestSeries() {
  const { genres, providers } = await tmdb.attributes('tv')
  const tvShows = await tmdb.query<EpicType>('/discover/tv', {
    filterItem: getDetailedEpic,
    key: getLatestSeries.name,
    maxItem: 10,
    maxPage: 3,
    params: {
      'air_date.gte': dayjs().subtract(3, 'month').format('YYYY-MM-DD') /** 2024-10-30 */,
      'air_date.lte': dayjs().add(2, 'month').format('YYYY-MM-DD') /** 2025-03-30 */,
      'first_air_date.gte': dayjs().subtract(4, 'year').format('YYYY-MM-DD') /** 2021-01-30 */,
      with_watch_monetization_types: 'flatrate',
      with_watch_providers: providers.map(({ provider_id }) => provider_id).join('|'),
      without_genres: '16,10764',
    },
  })

  return insertFirstGenre(tvShows, genres)
}

export async function getLatestShow() {
  const show = await createEpicStage([getLatestMovies(), getLatestSeries()])
  return show.sort((a, b) => dayjs(b.releasedAt).diff(a.releasedAt))
  // return await createEpicStage([whatsTrendingNow()])
}

export async function getTrendingMovies() {
  const { genres } = await tmdb.attributes('movie')
  const trending = await tmdb.query<Movie>('/discover/movie', {
    // filterItem: getBackdropPoster,
    key: getTrendingMovies.name,
    params: {
      // 'vote_average.gte': 6,
      // 'primary_release_date.gte': dayjs().subtract(4, 'month').format('YYYY-MM-DD'),
      'release_date.gte': dayjs().subtract(2, 'month').format('YYYY-MM-DD'),
      'release_date.lte': dayjs().format('YYYY-MM-DD'),
      // with_watch_providers: providers.map(({ provider_id }) => provider_id).join('|'),
    },
  })

  trending.sort((a, b) => dayjs(a.popularity).diff(b.popularity))
  console.table(trending, [
    'title',
    'name',
    'vote_average',
    'vote_count',
    'popularity',
    'release_date',
  ])
  return insertFirstGenre(trending, genres)
}

export async function getTrendingSeries(oldest = true) {
  const first_air_date = `first_air_date.${oldest ? 'lte' : 'gte'}`
  const { genres, providers } = await tmdb.attributes('tv')
  const trending = await tmdb.query<TV>('/discover/tv', {
    // filterItem: getBackdropPoster,
    key: getTrendingSeries.name + (oldest ? '#2' : '#1'),
    params: {
      [first_air_date]: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
      'air_date.gte': oldest ? dayjs().subtract(12, 'month').format('YYYY-MM-DD') : null,
      'vote_average.gte': 6,
      'vote_count.gte': 20,
      // without_genres: '16,99,10762,10764',
      with_watch_providers: providers.map(({ provider_id }) => provider_id).join('|'),
    },
  })

  return insertFirstGenre(trending, genres)
}

/**
 *
 */

export async function getTopRatedShows() {
  const [topMovies, topSeries] = await Promise.all([getTopRatedMovies(), getTopRatedSeries()])

  // Select top 10 movies & top 6 series based on given conditions
  const top10Movies = topMovies.filter((_, i) => !((i + 1) % 4))
  const top10Series = topSeries.filter((_, i) => !(i % 3)).slice(0, 5)

  // Combine and sort by vote_average (ascending order)
  const selectedShows = sortByRate([...top10Movies, ...top10Series], true)
  const detailedCard = await Promise.allSettled(selectedShows.slice(0, 10).map(getDetailedCard))

  // Filter only successful results & return clean data
  const result = detailedCard.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  )

  return result.filter(Boolean)
}

export async function getTopRatedMovies() {
  const { genres, providers } = await tmdb.attributes('movie')
  const topMovies = await tmdb.getShows(getTopRatedMovies.name, () =>
    tmdb.query<Movie>('/discover/movie', {
      key: getTopRatedMovies.name,
      params: {
        'primary_release_date.gte': dayjs().subtract(12, 'month').format('YYYY-MM-DD'),
        sort_by: 'vote_count.desc',
        with_watch_providers: providers.map(({ provider_id }) => provider_id).join('|'),
      },
    })
  )

  return insertFirstGenre(topMovies, genres)
}

export async function getTopRatedSeries() {
  const { genres, providers } = await tmdb.attributes('tv')
  const topSeries = await tmdb.getShows(getTopRatedSeries.name, () =>
    tmdb.query<TV>('/discover/tv', {
      // filterItem: getBackdropPoster,
      key: getTopRatedSeries.name,
      params: {
        'first_air_date.gte': dayjs().subtract(12, 'month').format('YYYY-MM-DD'),
        sort_by: 'vote_count.desc',
        without_genres: '16',
        with_watch_providers: providers.map(({ provider_id }) => provider_id).join('|'),
      },
    })
  )

  return insertFirstGenre(topSeries, genres)
}

export async function getTheaterMovies() {
  const { genres } = await tmdb.attributes('movie')
  const cinema = await tmdb.query<Movie>('/movie/now_playing', {
    key: getTheaterMovies.name,
    maxPage: 1,
    filterResults: (shows) => shows.filter((show) => !!show.poster_path && !!show.backdrop_path),
  })

  return insertFirstGenre(cinema, genres)
}

/**
 *
 */

export async function localeSwitcher(formData: FormData) {
  const cookieStore = await cookies()
  const locale = formData.get('locale-switcher') as string

  cookieStore.set('locale', locale)
  tmdb.resetState()
}
