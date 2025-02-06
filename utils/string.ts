export function qstring(path: string, params: Record<string, any>): string {
  // Filter the params to exclude invalid values
  const filteredParams = Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0) // Exclude empty arrays
      ) {
        acc[key] = value // Keep valid values
      }
      return acc
    },
    {} as Record<string, any>
  )

  // Build the query string with filtered parameters
  const queryString = new URLSearchParams(filteredParams).toString()
  return queryString ? `${path}?${queryString}` : path
}
