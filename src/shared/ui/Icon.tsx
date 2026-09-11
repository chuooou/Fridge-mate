type IconName = 'fridge' | 'leaf' | 'plus' | 'arrow' | 'snow' | 'clock' | 'logout' | 'check' | 'box'
const paths: Record<IconName, string> = {
  fridge: 'M5 3h14v18H5z M5 10h14 M8 6v2 M8 13v4',
  leaf: 'M20 4C9 3 3 8 5 15c2 6 11 6 14-2 1-3 1-6 1-9Z M4 21 15 10',
  plus: 'M12 5v14 M5 12h14',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  snow: 'M12 2v20 M3.3 7l17.4 10 M3.3 17 20.7 7 M9 4l3 3 3-3 M9 20l3-3 3 3',
  clock: 'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  logout: 'M9 5H4v14h5 M10 12h11 M17 8l4 4-4 4',
  check: 'm5 12 4 4L19 6',
  box: 'm3 7 9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',
}
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
