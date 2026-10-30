const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const UNITS = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'week', seconds: 604800 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
]

export function formatTimeAgo(dateString) {
  const secondsAgo = Math.round((Date.now() - new Date(dateString).getTime()) / 1000)

  if (secondsAgo < 60) return 'just now'

  for (const { unit, seconds } of UNITS) {
    if (secondsAgo >= seconds) {
      return formatter.format(-Math.floor(secondsAgo / seconds), unit)
    }
  }

  return 'just now'
}