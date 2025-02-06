import FetchLimiter from '@/lib/limiter'
import TMDB from '@/lib/tmdb'

export const limiter = new FetchLimiter()

export const tmdb = new TMDB(limiter)
