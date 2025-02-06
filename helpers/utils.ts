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
