export * from './tmdb'

import type {
  TV,
  Movie,
  Person,
  Cast,
  Crew,
  TvShowDetails,
  MovieDetails,
  TVWithMediaType,
  MovieWithMediaType,
} from './tmdb'

export type Entity = { id: number }

export type Meta<T> = T & {
  poster_blank_path?: string
  first_genre_name?: string
  backdrop_poster_path?: string
}

export type Show = Meta<TV | Movie>

export type Shows = Array<Show>

export type People = Person | Cast | Crew

export type Peoples = Array<People>

export type ShowDetail = Meta<TvShowDetails | MovieDetails>

export type ShowDetails = Array<ShowDetail>

export type ShowType = (TVWithMediaType | MovieWithMediaType)['media_type']
