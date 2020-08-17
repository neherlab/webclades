import 'regenerator-runtime'

import type { FunctionThread } from 'threads'
import { expose } from 'threads/worker'

import { analyze } from '@neherlab/nextclade-algorithms'

expose(analyze)

export type AnalyzeParameters = Parameters<typeof analyze>
export type AnalyzeReturn = ReturnType<typeof analyze>
export type AnalyzeThread = FunctionThread<AnalyzeParameters, AnalyzeReturn>
