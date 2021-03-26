import { Pool, spawn } from 'threads'

import type { WorkerPools } from 'src/workers/types'
import type { ParseThread } from 'src/workers/worker.parse'
import type { AnalyzeThread } from 'src/workers/worker.analyze'
import type { TreeFinalizeThread } from 'src/workers/worker.treeAttachNodes'
import type { RunQcThread } from 'src/workers/worker.runQc'
import type { TreeBuildThread } from 'src/workers/worker.treeFindNearest'

const DEFAULT_NUM_THREADS = 4

export async function createWorkerPools({ numThreads = DEFAULT_NUM_THREADS } = {}): Promise<WorkerPools> {
  if (typeof window !== 'undefined' || process.env.FORCE_USE_WORKERS === 'true') {
    const threadParse = await spawn<ParseThread>(new Worker(new URL('./worker.parse.ts', import.meta.url)))

    const poolAnalyze = Pool<AnalyzeThread>(() => spawn(new Worker(new URL('./worker.analyze.ts', import.meta.url))), {
      size: numThreads, // number of workers to spawn, defaults to the number of CPU cores
      concurrency: 1, // number of tasks to run simultaneously per worker, defaults to one
      name: 'analyze',
      maxQueuedJobs: undefined,
    })

    const threadTreeBuild = await spawn<TreeBuildThread>(
      new Worker(new URL('./worker.treeFindNearest.ts', import.meta.url)),
    )

    const poolRunQc = Pool<RunQcThread>(() => spawn(new Worker(new URL('./worker.runQc.ts', import.meta.url))), {
      size: numThreads, // number of workers to spawn, defaults to the number of CPU cores
      concurrency: 1, // number of tasks to run simultaneously per worker, defaults to one
      name: 'runQc',
      maxQueuedJobs: undefined,
    })

    const threadTreeFinalize = await spawn<TreeFinalizeThread>(
      new Worker(new URL('./worker.treeAttachNodes.ts', import.meta.url)),
    )

    return { threadParse, poolAnalyze, threadTreeBuild, poolRunQc, threadTreeFinalize }
  }

  throw new Error(' createWorkerPools: unable to create worker pools')
}
