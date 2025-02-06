export default class FetchLimiter {
  private taskQueue: (() => Promise<void>)[] = []
  private activeTaskCount = 0
  private readonly maxConcurrentTasks: number
  private readonly intervalMs: number
  private lastExecutionTime = 0
  private requestCount = 0

  constructor(maxConcurrentTasks = 50, intervalMs = 1_000) {
    this.maxConcurrentTasks = maxConcurrentTasks
    this.intervalMs = intervalMs
  }

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        const startTime = Date.now()

        try {
          this.log(
            `Executing task... Active: ${this.activeTaskCount}, Queue: ${this.taskQueue.length}`
          )
          resolve(await task())
        } catch (error) {
          console.error(`[FetchLimiter] Task failed:`, error)
          reject(error)
        } finally {
          this.activeTaskCount--
          this.requestCount++
          const executionTime = Date.now() - startTime
          this.log(
            `Task completed in ${executionTime}ms. Active: ${this.activeTaskCount}, Queue: ${this.taskQueue.length}`
          )
          this.processQueue()
        }
      }

      this.taskQueue.push(wrappedTask)
      this.log(`Task added to queue. Queue size: ${this.taskQueue.length}`)
      this.processQueue()
    })
  }

  private processQueue(): void {
    if (this.activeTaskCount >= this.maxConcurrentTasks || this.taskQueue.length === 0) {
      return
    }

    const now = Date.now()
    const timeSinceLastExec = now - this.lastExecutionTime
    const minDelay = this.intervalMs / this.maxConcurrentTasks // 1000ms / 50 = 20ms per request

    // If total active requests are below 50, process immediately
    if (this.activeTaskCount < this.maxConcurrentTasks) {
      const nextTask = this.taskQueue.shift()
      if (nextTask) {
        this.activeTaskCount++
        this.lastExecutionTime = Date.now()
        nextTask()
      }
      return
    }

    // If max limit (50) is reached, use setTimeout to avoid exceeding rate limit
    if (timeSinceLastExec < minDelay) {
      setTimeout(() => this.processQueue(), minDelay - timeSinceLastExec)
    } else {
      this.processQueue()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private log(message: string) {
    // console.log(`[FetchLimiter] ${new Date().toISOString()} - ${message}`)
  }
}
