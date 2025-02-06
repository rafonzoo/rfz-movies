import { useEffect, useRef, useState } from 'react'

const stageActionMap = new Map<any, any>()

export type UseIntersectionStageProps<T extends () => Promise<any[]>> = {
  id: string
  action: T
}

export const useIntersectionStage = <T extends () => Promise<any[]>>({
  id,
  action,
}: UseIntersectionStageProps<T>) => {
  const [shows, setShows] = useState<Awaited<ReturnType<T>>>(stageActionMap.get(id) || [])
  const state = useRef({ id, action })
  const currentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!currentRef.current || shows.length) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const { id, action } = state.current

        action().then((results) => {
          setShows(results as Awaited<ReturnType<T>>)
          stageActionMap.set(id, results)
          observer.disconnect()
        })
      }
    })

    observer.observe(currentRef.current)
    return () => observer.disconnect()
  }, [shows.length])

  return { ref: currentRef, shows }
}
