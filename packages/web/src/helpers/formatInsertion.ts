import type { NucleotideInsertion } from '@neherlab/nextclade-algorithms'

export function formatInsertion({ pos, ins }: NucleotideInsertion) {
  return ` ${pos}${ins}`
}
