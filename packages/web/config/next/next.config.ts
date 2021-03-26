import path from 'path'

import { get, set, uniq } from 'lodash'

import type { NextConfig } from 'next'
import getWithMDX from '@next/mdx'
import withPlugins from 'next-compose-plugins'
import getWithTranspileModules from 'next-transpile-modules'

import { findModuleRoot } from '../../lib/findModuleRoot'
import { getGitBranch } from '../../lib/getGitBranch'
import { getBuildNumber } from '../../lib/getBuildNumber'
import { getBuildUrl } from '../../lib/getBuildUrl'
import { getGitCommitHash } from '../../lib/getGitCommitHash'
import { getEnvVars } from './lib/getEnvVars'
import { addWebpackConfig } from './lib/addWebpackConfig'

import getWithFriendlyConsole from './withFriendlyConsole'
import getWithLodash from './withLodash'
import getWithTypeChecking from './withTypeChecking'
import withFriendlyChunkNames from './withFriendlyChunkNames'
import withIgnore from './withIgnore'
import withImages from './withImages'
import withJson from './withJson'
import withRaw from './withRaw'
import withSvg from './withSvg'
import withoutMinification from './withoutMinification'

const {
  // BABEL_ENV,
  // NODE_ENV,
  // ANALYZE,
  PROFILE,
  PRODUCTION,
  ENABLE_SOURCE_MAPS,
  ENABLE_ESLINT,
  ENABLE_TYPE_CHECKS,
  // ENABLE_STYLELINT,
  ENABLE_REDUX_DEV_TOOLS,
  ENABLE_REDUX_IMMUTABLE_STATE_INVARIANT,
  ENABLE_REDUX_LOGGER,
  DEBUG_SET_INITIAL_DATA,
  DOMAIN,
} = getEnvVars()

const { pkg, moduleRoot } = findModuleRoot()

const clientEnv = {
  ENABLE_REDUX_DEV_TOOLS: ENABLE_REDUX_DEV_TOOLS.toString(),
  ENABLE_REDUX_LOGGER: ENABLE_REDUX_LOGGER.toString(),
  ENABLE_REDUX_IMMUTABLE_STATE_INVARIANT: ENABLE_REDUX_IMMUTABLE_STATE_INVARIANT.toString(),
  DEBUG_SET_INITIAL_DATA: DEBUG_SET_INITIAL_DATA.toString(),
  BRANCH_NAME: getGitBranch(),
  PACKAGE_VERSION: pkg.version ?? '',
  BUILD_NUMBER: getBuildNumber(),
  TRAVIS_BUILD_WEB_URL: getBuildUrl(),
  COMMIT_HASH: getGitCommitHash(),
  DOMAIN,
}

console.info(`Client-side Environment:\n${JSON.stringify(clientEnv, null, 2)}`)

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
    webpack5: true,
  },
  devIndicators: {
    buildActivity: false,
    autoPrerender: false,
  },
  typescript: {
    ignoreDevErrors: true,
    ignoreBuildErrors: true,
  },
  env: clientEnv,
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

const withLodash = getWithLodash({ unicode: false })

const withTypeChecking = getWithTypeChecking({
  typeChecking: ENABLE_TYPE_CHECKS,
  eslint: ENABLE_ESLINT,
  memoryLimit: 2048,
})

const transpilationListDev = [
  // prettier-ignore
  'auspice',
  'd3-scale',
]

const transpilationListProd = uniq([
  ...transpilationListDev,
  'd3-array',
  'debug',
  'immer',
  'is-observable',
  'lodash',
  'observable-fns',
  'query-string',
  'recharts',
  'redux-saga',
  'semver',
  'strict-uri-encode',
  'threads',
  // '!d3-array/src/cumsum.js',
  // '@loadable',
  // 'create-color',
  // 'delay',
  // 'p-min-delay',
  // 'proper-url-join',
  // 'react-router',
  // 'react-share',
  // 'redux/es',
  // 'split-on-first',
])

const withTranspileModules = getWithTranspileModules(PRODUCTION ? transpilationListProd : transpilationListDev, {
  unstable_webpack5: true,
})

/**
 * Workaround for the warning:
 * "
 * HotModuleReplacementPlugin
 * The configured output.hotUpdateMainFilename doesn't lead to unique filenames per runtime and HMR update differs between runtimes.
 * This might lead to incorrect runtime behavior of the applied update.
 * To fix this, make sure to include [runtime] in the output.hotUpdateMainFilename option, or use the default config.
 * "
 *
 * See: https://github.com/vercel/next.js/issues/19865
 */
function withHmrWorkaround(nextConfig: NextConfig) {
  return addWebpackConfig(nextConfig, (nextConfig, webpackConfig, options) => {
    // The default Next.js `hotUpdateMainFilename` does not contain `[runtime]` placeholder. We add it here.
    set(webpackConfig, 'output.hotUpdateMainFilename', 'static/webpack/[runtime].[fullhash].hot-update.json')
    return webpackConfig
  })
}

// Workaround for the warning:
// "Watchpack Error (initial scan): Error: ENOTDIR: not a directory, scandir 'packages/web/node_modules/next/dist/next-server/lib/router/utils/resolve-rewrites.js'"
function withWatchpackWorkaround(nextConfig: NextConfig) {
  return addWebpackConfig(nextConfig, (nextConfig, webpackConfig, options) => {
    const ignored = get(webpackConfig, 'watchOptions.ignored')
    if (Array.isArray(ignored)) {
      // The `node_modules` entry is incorrectly modified by `next-transpile-modules`. We restore the entry here.
      set(webpackConfig, 'watchOptions.ignored', [...ignored, '**/node_modules/**'])
    }
    return webpackConfig
  })
}

const config = withPlugins(
  [
    [withHmrWorkaround],
    [withWatchpackWorkaround],
    [withIgnore],
    [withSvg],
    [withImages],
    [withRaw],
    [withJson],
    [withFriendlyConsole],
    [withMDX, { pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'] }],
    [withLodash],
    [withTypeChecking],
    [withTranspileModules],
    PROFILE && [withoutMinification],
    [withFriendlyChunkNames],
  ].filter(Boolean),
  nextConfig,
)

export default config
