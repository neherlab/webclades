import 'regenerator-runtime'

import { expose } from 'threads/worker'

import type { SequenceParserResult } from 'src/algorithms/types'
import { loadWasmModule, runWasmModule } from 'src/workers/wasmModule'

export interface ParseRefSequenceWasmModule {
  parseRefSequence(fastaStr: string): SequenceParserResult
}

export async function parseRefSequence(refFastaStr: string) {
  const module = await loadWasmModule<ParseRefSequenceWasmModule>('nextclade_wasm')
  return runWasmModule<ParseRefSequenceWasmModule, SequenceParserResult>(module, (module) =>
    module.parseRefSequence(refFastaStr),
  )
}

const worker = { parseRefSequence }
export type ParseRefSequenceWorker = typeof worker
export type ParseRefSequenceThread = ParseRefSequenceWorker

expose(worker)