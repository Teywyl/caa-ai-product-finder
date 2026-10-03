const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
}

const make = (children) =>
  function Icon({ size = 20, className, ...rest }) {
    return (
      <svg {...base} width={size} height={size} className={className} {...rest}>
        {children}
      </svg>
    )
  }

export const IconSearch = make(<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>)
export const IconChevronRight = make(<path d="M9 5l7 7-7 7" />)
export const IconChevronLeft = make(<path d="M15 5l-7 7 7 7" />)
export const IconChevronDown = make(<path d="M5 9l7 7 7-7" />)
export const IconMenu = make(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>)
export const IconClose = make(<><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>)
export const IconUser = make(<><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" /></>)
export const IconLogout = make(<><path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" /><path d="M10 16l-4-4 4-4" /><path d="M6 12h10" /></>)
export const IconHome = make(<><path d="M4 11l8-6.5 8 6.5" /><path d="M6 9.5V20h12V9.5" /></>)
export const IconGrid = make(<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>)
export const IconSpark = make(<><path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" /><path d="M18.5 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>)
export const IconList = make(<><path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" /><circle cx="5" cy="6" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="5" cy="18" r="1" /></>)
export const IconShield = make(<><path d="M12 3.5l7 2.5v5.5c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6z" /><path d="M9 12l2 2 4-4" /></>)
export const IconExternal = make(<><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" /></>)
export const IconCheck = make(<path d="M5 12.5l4.5 4.5L19 7.5" />)
export const IconAlert = make(<><path d="M12 4l9 16H3z" /><path d="M12 10v4" /><path d="M12 17.2v.1" /></>)
export const IconInfo = make(<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><path d="M12 8v.1" /></>)
export const IconCube = make(<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5l8 4.5 8-4.5" /><path d="M12 12v9" /></>)
export const IconImage = make(<><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M3.5 16l5-5 4 4 3-3 5 5" /></>)
export const IconPlus = make(<><path d="M12 5v14" /><path d="M5 12h14" /></>)
export const IconTrash = make(<><path d="M5 7h14" /><path d="M10 7V5h4v2" /><path d="M7 7l1 13h8l1-13" /></>)
export const IconEdit = make(<><path d="M4 20h4l11-11-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>)
export const IconLink = make(<><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></>)
export const IconCar = make(<><path d="M3.5 15.5v-3l2-4.5h13l2 4.5v3" /><path d="M3.5 15.5h17v2.5h-17z" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="16.5" cy="18" r="1.5" /><path d="M5.5 12h13" /></>)
export const IconRotate = make(<><path d="M20 12a8 8 0 11-2.3-5.6" /><path d="M20 4v4h-4" /></>)

const catBase = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
}

const categoryArt = {
  Evaporator: (
    <>
      <rect x="12" y="14" width="40" height="34" rx="2" />
      {[18, 23, 28, 33, 38, 43, 48].map((x) => (
        <path key={x} d={`M${x - 2} 17v28`} strokeWidth="1.5" />
      ))}
      <path d="M52 22h6v-4" />
      <path d="M52 40h6v4" />
      <path d="M12 51h40" strokeWidth="1.5" />
    </>
  ),
  'Cabin Filter': (
    <>
      <rect x="8" y="18" width="48" height="28" rx="2" />
      <path d="M12 42l4-20 4 20 4-20 4 20 4-20 4 20 4-20 4 20 4-20 4 20" strokeWidth="1.5" />
    </>
  ),
  'Air Filter': (
    <>
      <rect x="10" y="20" width="44" height="26" rx="6" />
      <path d="M16 26h32M16 31h32M16 36h32M16 41h32" strokeWidth="1.5" />
      <path d="M4 12c6 0 6 4 12 4M26 10c6 0 6 4 12 4M46 12c6 0 6 4 12 4" strokeWidth="1.5" />
    </>
  ),
  'Fuel Filter': (
    <>
      <rect x="20" y="16" width="24" height="34" rx="5" />
      <path d="M20 24h24M20 42h24" strokeWidth="1.5" />
      <path d="M28 16v-6h8v6" />
      <path d="M32 50v6" />
      <path d="M32 28c-3 4-4 6-4 8a4 4 0 008 0c0-2-1-4-4-8z" strokeWidth="1.5" />
    </>
  ),
  'Blower Motor': (
    <>
      <circle cx="28" cy="34" r="18" />
      <circle cx="28" cy="34" r="6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <path key={a} d="M28 22c3 2 4 4 4 6" strokeWidth="1.5" transform={`rotate(${a} 28 34)`} />
      ))}
      <rect x="46" y="28" width="12" height="12" rx="2" />
    </>
  ),
  Compressor: (
    <>
      <rect x="14" y="20" width="34" height="26" rx="6" />
      <circle cx="50" cy="33" r="8" />
      <circle cx="50" cy="33" r="2.5" />
      <path d="M22 20v-6h8v6M34 20v-6h8v6" />
    </>
  ),
}

export function CategoryArt({ category, size = 64 }) {
  const art = categoryArt[category] || (
    <>
      <rect x="14" y="14" width="36" height="36" rx="4" />
      <path d="M22 32h20M32 22v20" />
    </>
  )

  return (
    <svg {...catBase} width={size} height={size}>
      {art}
    </svg>
  )
}
