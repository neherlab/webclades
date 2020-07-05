import path from 'path'

import type { NextConfig } from 'next'
import getWithMDX from '@next/mdx'
// import withBundleAnalyzer from '@zeit/next-bundle-analyzer'
import withPlugins from 'next-compose-plugins'
import getWithTranspileModules from 'next-transpile-modules'

import { findModuleRoot } from '../../lib/findModuleRoot'
import { getGitBranch } from '../../lib/getGitBranch'
import { getBuildNumber } from '../../lib/getBuildNumber'
import { getBuildUrl } from '../../lib/getBuildUrl'
import { getGitCommitHash } from '../../lib/getGitCommitHash'

import { getEnvVars } from './lib/getEnvVars'

import getWithEnvironment from './withEnvironment'
import getWithExtraWatch from './withExtraWatch'
import getWithFriendlyConsole from './withFriendlyConsole'
import getWithLodash from './withLodash'
import getWithStaticComprression from './webpackCompression'
import getWithTypeChecking from './withTypeChecking'
import withRaw from './withRaw'
import withSvg from './withSvg'
import withThreads from './withThreads'
// import withoutMinification from './withoutMinification'

const {
  BABEL_ENV,
  NODE_ENV,
  // ANALYZE,
  // PROFILE,
  PRODUCTION,
  ENABLE_SOURCE_MAPS,
  ENABLE_ESLINT,
  ENABLE_TYPE_CHECKS,
  // ENABLE_STYLELINT,
  ENABLE_REDUX_DEV_TOOLS,
  ENABLE_REDUX_IMMUTABLE_STATE_INVARIANT,
} = getEnvVars()

const { pkg, moduleRoot } = findModuleRoot()

const nextConfig: NextConfig = {
  distDir: `.build/${process.env.NODE_ENV}/tmp`,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    modern: false, // this breaks Threads.js workers in production
    productionBrowserSourceMaps: ENABLE_SOURCE_MAPS,
  },
  future: {
    excludeDefaultMomentLocales: true,
  },
  devIndicators: {
    buildActivity: false,
    autoPrerender: true,
  },
  typescript: {
    ignoreDevErrors: true,
    ignoreBuildErrors: true,
  },
}

const withMDX = getWithMDX({
  extension: /\.mdx?$/,
  remarkPlugins: ['remark-images', 'remark-math'].map(require),
  rehypePlugins: [].map(require),
})

const withFriendlyConsole = getWithFriendlyConsole({
  clearConsole: false,
  projectRoot: path.resolve(moduleRoot),
  packageName: pkg.name || 'web',
  progressBarColor: 'blue',
})

const withEnvironment = getWithEnvironment({
  BABEL_ENV,
  NODE_ENV,
  ENABLE_REDUX_DEV_TOOLS: ENABLE_REDUX_DEV_TOOLS.toString(),
  ENABLE_REDUX_IMMUTABLE_STATE_INVARIANT: ENABLE_REDUX_IMMUTABLE_STATE_INVARIANT.toString(),
  BRANCH_NAME: getGitBranch(),
  PACKAGE_VERSION: pkg.version ?? '',
  BUILD_NUMBER: getBuildNumber(),
  TRAVIS_BUILD_WEB_URL: getBuildUrl(),
  COMMIT_HASH: getGitCommitHash(),
})

const withExtraWatch = getWithExtraWatch({
  files: [path.join(moduleRoot, 'src/types/**/*.d.ts')],
  dirs: [],
})

const withLodash = getWithLodash({ unicode: false })

const withStaticComprression = getWithStaticComprression({ brotli: false })

const withTypeChecking = getWithTypeChecking({
  typeChecking: ENABLE_TYPE_CHECKS,
  eslint: ENABLE_ESLINT,
  memoryLimit: 2048,
})

const withTranspileModules = getWithTranspileModules([
  '!d3-array/src/cumsum.js',
  '@loadable',
  'create-color',
  'd3-array',
  'd3-scale',
  'debug',
  'delay',
  'immer',
  'lodash',
  'observable-fns',
  'p-min-delay',
  'proper-url-join',
  'query-string',
  'react-router',
  'is-observable',
  'react-share',
  'recharts',
  'redux-saga',
  'redux/es',
  'semver',
  'split-on-first',
  'strict-uri-encode',
  'threads',
])

const config = withPlugins(
  [
    [withEnvironment],
    [withExtraWatch],
    [withThreads],
    [withSvg],
    [withRaw],
    // ANALYZE && [withBundleAnalyzer],
    [withFriendlyConsole],
    [withMDX, { pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'] }],
    [withLodash],
    [withTypeChecking],
    PRODUCTION && [withTranspileModules],
    PRODUCTION && [withStaticComprression],
    // [withoutMinification],
  ].filter(Boolean),
  nextConfig,
)

export default config
