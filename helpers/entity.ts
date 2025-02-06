import { getLanguageCode } from '@/helpers/utils'
import type {
  Entity,
  Genre,
  Image,
  Movie,
  MovieDetails,
  Show,
  Shows,
  TV,
  TvShowDetails,
} from '@/types/entity'

export function isTVShow(entity: Entity): entity is TV {
  return 'first_air_date' in entity
}

export function isDetailedTVShow(entity: Entity): entity is TvShowDetails {
  return isTVShow(entity)
}

export function isMovieShow(entity: Entity): entity is Movie {
  return 'release_date' in entity
}

export function isDetailedMovieShow(entity: Entity): entity is MovieDetails {
  return isMovieShow(entity)
}

export function getShowTitle<T extends Show>(show: T) {
  // ? show.original_language === defaultLanguage
  //   ? show.original_title
  //   : show.title
  return (isMovieShow(show) ? show.title : show.name) || ''
}

export function getShowDate(show: Show) {
  return (isTVShow(show) ? show.first_air_date : show.release_date) || ''
}

export function getMediaType(entity: Entity) {
  if ('release_date' in entity) return 'movie'
  if ('first_air_date' in entity) return 'tv'
  if ('character' in entity) return 'cast'
  if ('department' in entity) return 'crew'

  return 'person'
}

/**
 * Available sizes:
 * - Poster: 92, 154, 185, 342, 500, 780, original
 * - Logo: 45, 92, 154, 185, 300, 500, original
 * - Backdrop: 300, 780, 1280, original
 * - Profile: 45, 185, or height: 632, original
 * - Still: 92, 185, 300, original
 */
export function getShowImage(path: string, size: number = 300) {
  const url = [
    process.env.NEXT_PUBLIC_TMDB_IMAGE_URL,
    size ? 'w' + size : 'original',
    path?.slice(1),
  ]

  return url.filter(Boolean).join('/')
}

export function getLogoPath(images: Image[], lang?: string) {
  images = images.filter((image) => !image.file_path.includes('.svg'))

  let logo = images.find((image) => image.iso_639_1 === lang)

  if (!logo) {
    logo = images.find((image) => image.iso_639_1 === 'en')
  }

  return logo?.file_path
}

export function getPosterPath(images: Image[], lang: string | null) {
  return images.find(({ iso_639_1 }) => iso_639_1 == lang)?.file_path
}

export function getBackdropPath(images: Image[], lang: string | null) {
  return images.find(({ iso_639_1 }) => iso_639_1 == lang)?.file_path
}

export function getLanguageFromShow<T extends Show>(show: T, language: string) {
  const current = getLanguageCode(language)
  return current === show.original_language ? current : 'en'
}

export function sortByRate<T extends Shows>(shows: T, asc = false) {
  return shows.sort((a, b) => (asc ? a : b).vote_average - (asc ? b : a).vote_average)
}

export function insertFirstGenre<T extends Shows>(shows: T, genres: Genre[]): T {
  if (!shows.length) return shows

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return shows.map((show) => ({
    ...show,
    first_genre_name: genres.find((genre) => genre.id === show.genre_ids[0])?.name,
  }))
}
