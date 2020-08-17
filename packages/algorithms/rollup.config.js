import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      // exports: 'named',
    },
  ],
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    typescript({
      useTsconfigDeclarationDir: true,
      rollupCommonJSResolveHack: false,
      clean: true,
      typescript: require('ttypescript'),
      tsconfigDefaults: {
        compilerOptions: {
          plugins: [
            { transform: 'typescript-transform-paths' },
            { transform: 'typescript-transform-paths', afterDeclarations: true },
          ],
        },
      },
    }),
    commonjs(),
    resolve({ rootDir: './src' }),
    sourceMaps(), // prettier-ignore
  ],
  onwarn: function (message) {
    if (/Circular dependency.*d3-interpolate/.test(message)) {
      return
    }
  },
}
