export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') // Hapus tanda - berlebih
    .replace(/^-+|-+$/g, '')
}

export function getLanguageCode(locale: string) {
  return locale.split('-')[0]
}

export function expandFromMid<T>(arr: T[]): T[] {
  const n = arr.length

  if (n === 0) {
    return []
  }

  const mid = Math.floor(n / 2)
  const result: T[] = [arr[mid]]

  let left = mid - 1
  let right = mid + 1

  while (result.length < n && (left >= 0 || right < n)) {
    if (right < n) {
      result.push(arr[right])
      right++
    }
    if (result.length < n && left >= 0) {
      result.push(arr[left])
      left--
    }
  }

  return result
}

export function interleaveByMid<T>(data: T[], n = 2): T[] {
  const mid = Math.floor(data.length / 2)
  const group1 = data.slice(0, mid)
  const group2 = data.slice(mid)
  const result: T[] = []

  let i = 0
  let j = 0

  while (i < group1.length || j < group2.length) {
    result.push(...group1.slice(i, i + n), ...group2.slice(j, j + n))
    i += n
    j += n
  }

  return result
}
