import type FetchLimiter from './limiter'
import type { Entity, Genre, Search, Show, Shows, ShowType, WatchProvider } from '@/types/entity'
import { getShowTitle, isMovieShow, isTVShow } from '@/helpers/entity'
import { defaultLocale, defaultRegion } from '@/config'
import { slugify } from '@/helpers/utils'
import { qstring } from '@/utils'
import { cookies } from 'next/headers'

type TMDBConstructor = {
  maxPage: number
  maxItem: number
  startOnPage: number
}

type TMDBOption<T> = Partial<TMDBConstructor> & {
  filterResults?: (items: T[]) => T[]
  filterItem?: (item: T, lang: string) => Promise<T | null | undefined>
  params?: Record<string, any>
  option?: RequestInit
  key: string
}

const API_URL = process.env.TMDB_API_URL
const API_KEY = process.env.TMDB_API_KEY

const defaultParams = {
  language: defaultLocale,
  region: defaultRegion,
  watch_region: defaultRegion,
}

export default class TMDB {
  #limiter: FetchLimiter
  #shows = new Map<string, Shows>()
  #genre = new Map<ShowType, Genre[]>()
  #watch = new Map<ShowType, WatchProvider[]>()

  constructor(request: FetchLimiter) {
    this.#limiter = request
  }

  async init() {
    if (this.#genre.size || this.#watch.size) return

    try {
      const locale = await this.getLocale()
      const endpoints = [
        '/genre/tv/list',
        '/genre/movie/list',
        qstring('/watch/providers/tv', locale),
        qstring('/watch/providers/movie', locale),
      ]

      const results = await Promise.allSettled(endpoints.map((path) => this.fetch(path)))
      const [genreTV, genreMovie, providerTV, providerMovie] = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<any>).value)

      this.#genre.set('tv', genreTV?.genres || [])
      this.#genre.set('movie', genreMovie?.genres || [])
      this.#watch.set('tv', providerTV?.results || [])
      this.#watch.set('movie', providerMovie?.results || [])
    } catch (error) {
      console.error('Failed to fetch genre/provider:', error)
    }
  }

  async fetch<T>(path: string, opt?: RequestInit): Promise<T> {
    const url = `${API_URL}${path}`
    const options: RequestInit = {
      next: { revalidate: 60 * 60 * 24 }, // 1 day
      method: 'GET',
      headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` },
      ...opt,
    }

    return this.#limiter.enqueue(async () => {
      const res = await fetch(url, options)
      return res.json() as Promise<T>
    })
  }

  async query<T extends Entity>(url: string, options: TMDBOption<T>): Promise<T[]> {
    const locale = await this.getLocale()
    const result: T[] = []
    const {
      filterItem,
      filterResults,
      maxItem = 20,
      maxPage = 5,
      startOnPage = 1,
      option,
    } = options

    let fetchedItems: T[] = []
    let totalPages = Infinity
    let currentPage = startOnPage
    let withMappedItem = []

    while (result.length < maxItem && currentPage <= maxPage && currentPage <= totalPages) {
      try {
        const path = qstring(url, {
          ...locale,
          ...options.params,
          language: 'en-US',
          page: currentPage,
        })

        const { results, total_pages } = await this.fetch<{ results: T[]; total_pages: number }>(
          path,
          option
        )

        totalPages = total_pages
        currentPage++

        // Deduplicate merged results
        const merged = [
          ...fetchedItems,
          ...results.filter((item) => !fetchedItems.some((f) => f.id === item.id)),
        ]

        fetchedItems = filterResults?.(merged) || merged
        withMappedItem = await Promise.allSettled(
          fetchedItems
            .slice(0, maxItem - result.length)
            .map((item) => filterItem?.(item, locale.language) ?? item)
        )

        withMappedItem = withMappedItem
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value)

        // Add only unique items to the result
        result.push(
          ...withMappedItem
            .filter((item) => item && !result.some((r) => r.id === item.id))
            .filter(Boolean)
        )

        // Remove processed items from fetchedItems
        fetchedItems = fetchedItems.slice(withMappedItem.length)
      } catch (error) {
        console.error(`Failed to fetch page ${currentPage - 1}:`, error)
        break
      }
    }

    if (result.every((res) => isTVShow(res) || isMovieShow(res))) {
      this.#shows.set(options.key, result)
    }
    return result
  }

  async attributes(type: ShowType) {
    if (!this.#genre.has(type) && !this.#watch.has(type)) await this.init()
    return { genres: this.#genre.get(type) ?? [], providers: this.#watch.get(type) || [] }
  }

  async getShows<T extends Shows>(key: string, instance: () => Promise<T>) {
    let current = this.#shows.get(key)

    if (!current) {
      current = await instance()
      this.#shows.set(key, current) // Cache the fetched data
    }

    return current as Awaited<ReturnType<typeof instance>>
  }

  async searchShows<T extends Show>(options: {
    queries: string[]
    type: string
    params: object
    key: string
  }) {
    try {
      const locale = await this.getLocale()
      const searchResults = await Promise.allSettled(
        options.queries.map(async (query) => {
          const { results } = await this.fetch<Search<T>>(
            qstring(`/search/${options.type}`, { query, ...locale, ...options.params })
          )

          return results.find((result) => slugify(getShowTitle(result)) === query)
        })
      )

      return searchResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
        .filter(Boolean)
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  async getLocale() {
    const locale = (await cookies()).get('locale')?.value || defaultParams.language
    const region = locale.split('-')[1] || defaultParams.region
    const current = {
      language: locale,
      region,
      watch_region: region,
    }

    return current
  }

  resetState() {
    this.#shows.clear()
    this.#genre.clear()
    this.#watch.clear()
  }
}
