import 'regenerator-runtime'

import type { FunctionThread } from 'threads'
import { expose } from 'threads/worker'

import { locateInTree } from '@neherlab/nextclade-algorithms'

expose(locateInTree)

export type TreeBuildParameters = Parameters<typeof locateInTree>
export type TreeBuildReturn = ReturnType<typeof locateInTree>
export type TreeBuildThread = FunctionThread<TreeBuildParameters, TreeBuildReturn>
