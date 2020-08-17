export const UNKNOWN_VALUE = `Unknown ` // HACK: keep space at the end: workaround for Auspice filtering out "Unknown"

// Borrowed from Nextstrain Auspice
// https://github.com/nextstrain/auspice/blob/05efebfd5eba8a7d086132cf8a182176118b7c28/src/util/globals.js#L90-L92
export const GENOTYPE_COLORS = [
  '#60AA9E',
  '#D9AD3D',
  '#5097BA',
  '#E67030',
  '#8EBC66',
  '#E59637',
  '#AABD52',
  '#DF4327',
  '#C4B945',
  '#75B681',
] as const
