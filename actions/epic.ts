'use server'

import {
  getLanguageFromShow,
  getLogoPath,
  getMediaType,
  getPosterPath,
  isDetailedMovieShow,
  isDetailedTVShow,
  isMovieShow,
  isTVShow,
} from '@/helpers/entity'
import { dayjs } from '@/lib'
import { tmdb } from '@/lib/server'
import { ContentRatings, ReleaseDates, Show, WatchLocale } from '@/types/entity'
import { EpicStageShow } from '@/components/Stage/Epic'
import {
  getDetail,
  getImages,
  getProviders,
  getMovieCertification,
  getTVCertification,
} from '@/actions/helper'

function findTVCertification(results: ContentRatings['results'], region?: string) {
  let tvCertification = results.find(({ iso_3166_1 }) => iso_3166_1 === region)
  if (!tvCertification) {
    tvCertification = results.find(({ iso_3166_1 }) => iso_3166_1 === 'US')
  }
  return tvCertification
}

function findMovieCertification(results: ReleaseDates['results'], region?: string) {
  let certificate = results.find(({ iso_3166_1 }) => iso_3166_1 === region)
  if (!certificate) {
    certificate = results.find(({ iso_3166_1 }) => iso_3166_1 === 'US')
  }
  if (certificate && certificate.release_dates.every(({ certification }) => !certification)) {
    certificate = results.find(({ release_dates }) =>
      release_dates.some((release) => !!release.certification)
    )
  }
  return certificate
}

function mergeWatchProviders(providerID: Partial<WatchLocale['ID']> | undefined) {
  if (!providerID) return []
  return Array.from(
    new Map(
      [
        ...((providerID as any).free || []),
        ...((providerID as any).ads || []),
        ...(providerID.flatrate || []),
        ...(providerID.rent || []),
        ...(providerID.buy || []),
      ]
        .sort((a, b) => a.display_priority - b.display_priority)
        .map((provider) => [provider.provider_id, provider])
    ).values()
  )
}

export async function getDetailedEpic(show: Show) {
  try {
    const locale = await tmdb.getLocale()
    const language = getLanguageFromShow(show, locale.language)

    const [detail, images] = await Promise.all([
      getDetail(show.id, getMediaType(show), locale.language),
      getImages(show.id, getMediaType(show), 'null', language),
    ])

    // Images
    const poster_blank_path = getPosterPath(images.posters, null)
    const logo_path = getLogoPath(images.logos, language)

    if (!poster_blank_path || !logo_path || !detail.overview) {
      return null
    }

    const [watches, release_dates, content_ratings] = await Promise.all([
      getProviders(show.id, getMediaType(show)),
      isMovieShow(show) ? getMovieCertification(show.id) : null,
      isTVShow(show) ? getTVCertification(show.id) : null,
    ])

    // Watches
    const region = locale.region as 'ID'
    const watch = watches?.[region]
    const provider = watch || watches?.US

    // if (!provider) return null

    const option = {
      overview: detail.overview || show.overview || '',
      latest_season_number: 0,
      latest_season_length: 0,
      providers: mergeWatchProviders(provider),
      canWatch: !detail.overview && !!watch,
      certification: 'NR',
      releasedAt: '',
      isUpcoming: false,
    }

    if (isDetailedTVShow(detail) && content_ratings) {
      const certification = findTVCertification(content_ratings, region)
      const nextEpisode = detail.next_episode_to_air
      const lastEpisode = detail.last_episode_to_air

      const isUpcoming = nextEpisode
        ? nextEpisode.episode_number === 1 &&
          dayjs(nextEpisode.air_date).isBefore(dayjs().add(1, 'month'), 'date')
        : false

      const latestSeason = detail.seasons.find((s) => lastEpisode.season_number === s.season_number)
      const currentEpisode = isUpcoming ? nextEpisode || lastEpisode : lastEpisode

      option.overview = latestSeason?.overview || detail.overview || show.overview
      option.certification = certification?.rating || 'NR'
      option.latest_season_number = currentEpisode.season_number
      option.latest_season_length = currentEpisode.episode_number
      option.releasedAt = currentEpisode.air_date
      option.isUpcoming = isUpcoming
    }

    if (isMovieShow(show) && isDetailedMovieShow(detail) && release_dates) {
      const certification = findMovieCertification(release_dates, region)

      option.overview = detail.overview || show.overview
      option.isUpcoming = dayjs(show.release_date).isAfter(dayjs(), 'day')
      option.releasedAt = detail.release_date
      option.certification =
        certification?.release_dates.find((c) => !!c.certification)?.certification || 'NR'
    }

    return { ...show, ...option, poster_blank_path, logo_path }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to fetch details for item ID ${show.id}: ${error.message}`)
    } else {
      console.error(`Unexpected error for item ID ${show.id}:`, error)
    }
  }

  return null
}

export async function createEpicStage<T extends Promise<EpicType[]>[]>(promises: T) {
  const shows = await Promise.allSettled(promises)
  const epicShows = shows
    .filter((shows) => shows.status === 'fulfilled')
    .map((shows) => shows.value)
    .flat()

  return epicShows
}

export type EpicType = EpicStageShow & { releasedAt: string }
