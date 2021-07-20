import React from 'react'

import { last } from 'lodash'
import { DateTime } from 'luxon'
import { Col, Row } from 'reactstrap'
import styled from 'styled-components'
import { TableSlimWithBorders } from 'src/components/Common/TableSlim'
import { LinkExternal } from 'src/components/Link/LinkExternal'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import urljoin from 'url-join'
import semver from 'semver'

import { LayoutMain } from 'src/components/Layout/LayoutMain'
import { useAxiosQuery } from 'src/helpers/useAxiosQuery'
import type { Dataset, DatasetFiles, DatasetsJson, DatasetVersion } from 'src/algorithms/types'

const DATA_FULL_DOMAIN = process.env.DATA_FULL_DOMAIN ?? '/'
const DATA_DATASETS_FILE = '_generated/datasets.json'
const DATA_DATASETS_FILE_FULL_URL = urljoin(DATA_FULL_DOMAIN, DATA_DATASETS_FILE)
const thisVersion = process.env.PACKAGE_VERSION ?? ''

export const Ul = styled.ul`
  list-style: none;
  padding-left: 0.5rem;
`

export const Li = styled.li``

export function formatVersion(min?: string, max?: string) {
  if (!min && max) {
    return `up to ${max}`
  }

  if (min && !max) {
    return `from ${min}`
  }

  if (min && max) {
    return `from ${min} to ${max}`
  }

  return `unknown`
}

export function formatDateIsoUtcSimple(dateTimeStr: string) {
  const utc = DateTime.fromISO(dateTimeStr, { zone: 'UTC' })

  const date = utc.toISODate()

  let time = utc.toISOTime({
    suppressMilliseconds: true,
    suppressSeconds: true,
    includeOffset: false,
  })

  if (time === '00:00') {
    time = ''
  }

  return [date, time].join(' ')
}

export interface DatasetFileProps {
  file: string
}

export function DatasetFile({ file }: DatasetFileProps) {
  return (
    <LinkExternal download href={urljoin(DATA_FULL_DOMAIN, file)}>
      {last(file.split('/'))}
    </LinkExternal>
  )
}

export interface DatasetFilesProps {
  files: DatasetFiles
}

export function DatasetFilesView({ files }: DatasetFilesProps) {
  return (
    <Ul>
      {Object.entries(files).map(([filetype, url]) => (
        <Li key={filetype}>
          <DatasetFile file={url} />
        </Li>
      ))}
    </Ul>
  )
}

export interface DatasetVersionProps {
  version: DatasetVersion
}

export function DatasetVersionView({ version }: DatasetVersionProps) {
  const { t } = useTranslationSafe()

  const cliMin = version.compatibility.nextcladeCli.min
  const cliMax = version.compatibility.nextcladeCli.max
  const webMin = version.compatibility.nextcladeWeb.min
  const webMax = version.compatibility.nextcladeWeb.max

  const isCompatible = semver.gte(thisVersion, webMin ?? thisVersion) && semver.lte(thisVersion, webMax ?? thisVersion)

  return (
    <tr>
      <td>{formatDateIsoUtcSimple(version.datetime)}</td>
      <td>{version.comment}</td>
      <td>{formatVersion(cliMin, cliMax)}</td>
      <td>{formatVersion(webMin, webMax)}</td>
      <td>{isCompatible ? t('Yes') : t('No')}</td>
      <td>
        <DatasetFilesView files={version.files} />
      </td>
      <td>
        {
          <LinkExternal download href={urljoin(DATA_FULL_DOMAIN, version.zipBundle)}>
            {last(version.zipBundle.split('/'))}
          </LinkExternal>
        }
      </td>
    </tr>
  )
}

export interface DatasetViewProps {
  dataset: Dataset
  isDefault: boolean
}

export function DatasetView({ dataset, isDefault }: DatasetViewProps) {
  const { t } = useTranslationSafe()

  return (
    <Row noGutters className="mt-3">
      <Col>
        <h3>
          {dataset.nameFriendly}
          {isDefault && <sup className="text-small ml-2">{t('(default)')}</sup>}
        </h3>
        <p>{dataset.description}</p>

        <h5>{t('Versions')}</h5>

        <TableSlimWithBorders>
          <thead>
            <tr>
              <th>{t('Released (UTC)')}</th>
              <th>{t('Changes')}</th>
              <th>{t('Compat. CLI version')}</th>
              <th>{t('Compat. Web version')}</th>
              <th>{t('Compatible')}</th>
              <th>{t('Files')}</th>
              <th>{t('Zip bundle')}</th>
            </tr>
          </thead>
          <tbody>
            {dataset.versions.map((version) => (
              <DatasetVersionView key={version.datetime} version={version} />
            ))}
          </tbody>
        </TableSlimWithBorders>
      </Col>
    </Row>
  )
}

export interface DatasetListProps {
  datasetsJson: DatasetsJson
}

export function DatasetList({ datasetsJson }: DatasetListProps) {
  const { defaultDatasetName } = datasetsJson.settings

  return (
    <div>
      {datasetsJson.datasets.map((dataset) => (
        <DatasetView key={dataset.name} dataset={dataset} isDefault={dataset.name === defaultDatasetName} />
      ))}
    </div>
  )
}

export function DataPage() {
  const { t } = useTranslationSafe()

  const { data: datasetsJson, error, isLoading, isFetching, isError } = useAxiosQuery<DatasetsJson>(
    DATA_DATASETS_FILE_FULL_URL,
  )

  return (
    <LayoutMain>
      <Row noGutters className="landing-page-row mx-auto">
        <Col>
          <Row noGutters>
            <Col>
              <h2 className="text-center">{t('Datasets')}</h2>
            </Col>
          </Row>

          <Row noGutters>
            <Col>{(isLoading || isFetching) && <span className="text-info">{'Loading...'}</span>}</Col>
          </Row>

          <Row noGutters>
            <Col>{isError && error && <span className="text-danger">{`${error?.name}: ${error?.message}`}</span>}</Col>
          </Row>

          {datasetsJson && <DatasetList datasetsJson={datasetsJson} />}
        </Col>
      </Row>
    </LayoutMain>
  )
}
