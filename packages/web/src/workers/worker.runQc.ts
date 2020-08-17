import 'regenerator-runtime'

import type { FunctionThread } from 'threads'
import { expose } from 'threads/worker'

import { runQC } from '@neherlab/nextclade-algorithms'

expose(runQC)

export type RunQcParameters = Parameters<typeof runQC>
export type RunQcReturn = ReturnType<typeof runQC>
export type RunQcThread = FunctionThread<RunQcParameters, RunQcReturn>
