import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'

const pkg = require('./package.json')

export default {
  input: `src/index.ts`,
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      exports: 'named',
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
    }),
    commonjs(),
    resolve(),
    sourceMaps({
      include: ['index\.ts'],
      exclude: [/.*\.d\.ts$/]
    }), // prettier-ignore
  ],
  onwarn: function (message) {
    if (/Circular dependency.*d3-interpolate/.test(message)) {
      return
    }
  },
}
