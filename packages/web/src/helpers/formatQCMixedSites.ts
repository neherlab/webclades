import { round } from 'lodash'

import type { DeepReadonly } from 'ts-essentials'

import type { QCResultMixedSites } from '@neherlab/nextclade-algorithms'
import type { TFunctionInterface } from 'src/helpers/TFunctionInterface'

export function formatQCMixedSites<TFunction extends TFunctionInterface>(
  t: TFunction,
  mixedSites?: DeepReadonly<QCResultMixedSites>,
) {
  if (!mixedSites || mixedSites.score === 0) {
    return undefined
  }

  const { score, totalMixedSites, mixedSitesThreshold } = mixedSites
  return t('Too many mixed sites: Total mixed: {{total}} ({{allowed}} allowed). QC score: {{score}}', {
    total: totalMixedSites,
    allowed: mixedSitesThreshold,
    score: round(score),
  })
}
