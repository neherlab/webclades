import 'regenerator-runtime'

import type { FunctionThread } from 'threads'
import { expose } from 'threads/worker'

import { parse } from '@neherlab/nextclade-algorithms'

expose(parse)

export type ParseParameters = Parameters<typeof parse>
export type ParseReturn = ReturnType<typeof parse>
export type ParseThread = FunctionThread<ParseParameters, ParseReturn>
