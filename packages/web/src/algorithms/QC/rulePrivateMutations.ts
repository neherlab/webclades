import type { AnalysisResult, NucleotideSubstitution } from 'src/algorithms/types'
import { getQCRuleStatus } from 'src/algorithms/QC/QCRuleStatus'

export interface QCRulesConfigPrivateMutations {
  typical: number
  cutoff: number
}

export function rulePrivateMutations(
  { substitutions, insertions, deletions }: AnalysisResult,
  privateMutations: NucleotideSubstitution[],
  { typical, cutoff }: QCRulesConfigPrivateMutations,
) {
  const totalNumberOfMutations =
    Object.keys(privateMutations).length + Object.keys(insertions).length + Object.keys(deletions).length

  // the score hits 100 if the excess mutations equals the cutoff value
  const score = (Math.max(0, totalNumberOfMutations - typical) * 100) / cutoff

  const status = getQCRuleStatus(score)

  return { score, total: totalNumberOfMutations, excess: totalNumberOfMutations - typical, cutoff, status }
}

export type QCResultPrivateMutations = ReturnType<typeof rulePrivateMutations>