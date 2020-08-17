export const PROJECT_NAME = 'Nextclade' as const
export const PROJECT_DESCRIPTION = 'Clade assignment, mutation calling, and quality control right inside your browser' as const
export const COPYRIGHT_YEAR_START = 2020 as const
export const COMPANY_NAME = 'Nextstrain developers' as const

export const DOMAIN = process.env.DOMAIN ?? ''
export const URL_FAVICON = `${DOMAIN}/favicon.ico`
export const URL_SOCIAL_IMAGE = `${DOMAIN}/social-1200x600.png`
export const URL_MANIFEST_JSON = `${DOMAIN}/manifest.json`
export const SAFARI_PINNED_TAB_COLOR = '#555555' as const
export const MS_TILE_COLOR = '#2b5797' as const

export const BASE_MIN_WIDTH_PX = 4 as const
export const EXPORT_CSV_FILENAME = 'nextclade.csv' as const
export const EXPORT_JSON_FILENAME = 'nextclade.json' as const
export const EXPORT_AUSPICE_JSON_V2_FILENAME = 'nextclade.auspice.json' as const

export const URL_GITHUB = 'https://github.com/neherlab/webclades' as const
export const URL_GITHUB_FRIENDLY = 'github.com/neherlab/webclades' as const

export const TWITTER_USERNAME = '@nextstrain' as const

// Borrowed with modifications from Nextstrain.org
// https://github.com/nextstrain/nextstrain.org/blob/master/static-site/src/components/splash/title.jsx
export const TITLE_COLORS = [
  '#4377CD',
  '#5097BA',
  '#63AC9A',
  '#7CB879',
  '#B9BC4A',
  '#D4B13F',
  '#E49938',
  '#E67030',
  '#DE3C26',
] as const
