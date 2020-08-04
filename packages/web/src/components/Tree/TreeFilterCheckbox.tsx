import React from 'react'

import { connect } from 'react-redux'
import { get } from 'lodash'

import { AuspiceFiltersState } from 'src/state/auspice/auspice.state'
import { State } from 'src/state/reducer'
import { applyFilter } from 'auspice/src/actions/tree'

import { FormGroup, Label, InputCheckbox } from './Form'

export interface TreeFilterCheckboxProps {
  filters: AuspiceFiltersState
  text: string
  trait: string
  value: string
  applyFilter(mode: string, trait: string, values: string[]): void
}

const mapStateToProps = (state: State) => ({
  filters: state.controls.filters,
})

const mapDispatchToProps = {
  applyFilter,
}

export const TreeFilterCheckbox = connect(mapStateToProps, mapDispatchToProps)(TreeFilterCheckboxDisconnected)

export function TreeFilterCheckboxDisconnected({ filters, applyFilter, text, trait, value }: TreeFilterCheckboxProps) {
  const concreteFilters = get(filters, trait) as string[]
  const isChecked = concreteFilters?.includes(value) ?? false

  const handleCheck = () => applyFilter('add', trait, [value])
  const handleUncheck = () => applyFilter('remove', trait, [value])
  const toggle = isChecked ? handleUncheck : handleCheck

  return (
    <FormGroup check>
      <Label check>
        <InputCheckbox type="checkbox" checked={isChecked} onChange={toggle} />
        {text}
      </Label>
    </FormGroup>
  )
}