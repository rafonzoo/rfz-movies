'use server'

import {
  getLanguageFromShow,
  getLogoPath,
  getMediaType,
  getPosterPath,
  getShowTitle,
} from '@/helpers/entity'
import {
  Show,
  Images,
  ShowDetail,
  ContentRatings,
  ReleaseDates,
  WatchProviders,
} from '@/types/entity'
import { qstring } from '@/utils'
import { tmdb } from '@/lib/server'

export async function getDetail(id: number, type: string, language = 'en-US') {
  return await tmdb.fetch<ShowDetail>(qstring(`/${type}/${id}`, { language }))
}

export async function getImages(id: number, type: string, ...lang: string[]) {
  return await tmdb.fetch<Images>(
    qstring(`/${type}/${id}/images`, {
      include_image_language: Array.from(new Set(lang)).join(','),
    })
  )
}

export async function getProviders(id: number, type: string) {
  const providers = await tmdb.fetch<WatchProviders>(`/${type}/${id}/watch/providers`)
  return providers.results
}

export async function getMovieCertification(id: number) {
  const certification = await tmdb.fetch<ReleaseDates>(`/movie/${id}/release_dates`)
  return certification.results
}

export async function getTVCertification(id: number) {
  const certification = await tmdb.fetch<ContentRatings>(`/tv/${id}/content_ratings`)
  return certification.results
}

export async function getDetailedCard<T extends Show>(show: T) {
  const locale = await tmdb.getLocale()
  const language = getLanguageFromShow(show, locale.language)
  const [{ tagline }, images] = await Promise.all([
    getDetail(show.id, getMediaType(show)),
    getImages(show.id, getMediaType(show), 'null', language),
  ])

  // Images
  const poster_blank_path = getPosterPath(images.posters, null)
  const logo_path = getLogoPath(images.logos, language)

  if (!poster_blank_path || !logo_path || !tagline) {
    console.log(getShowTitle(show))
    return null
  }

  return { ...show, overview: tagline, poster_blank_path, logo_path }
}
