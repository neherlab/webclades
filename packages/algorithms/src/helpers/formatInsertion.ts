import type { NucleotideInsertion } from 'src/types'

export function formatInsertion({ pos, ins }: NucleotideInsertion) {
  return ` ${pos}${ins}`
}
