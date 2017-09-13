import React, {PropTypes} from 'react'
import Dropdown from 'shared/components/Dropdown'
import {Tab, TabList, TabPanels, TabPanel, Tabs} from 'shared/components/Tabs'
import {OPERATORS, PERIODS, CHANGES, SHIFTS} from 'src/kapacitor/constants'
import _ from 'lodash'

const TABS = ['Threshold', 'Relative', 'Deadman']
const mapToItems = (arr, type) => arr.map(text => ({text, type}))

export const ValuesSection = React.createClass({
  propTypes: {
    rule: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
    onChooseTrigger: PropTypes.func.isRequired,
    onUpdateValues: PropTypes.func.isRequired,
    onUpdateCommon: PropTypes.func.isRequired,
    query: PropTypes.shape({}).isRequired,
  },

  render() {
    const {rule, query} = this.props
    const initialIndex = TABS.indexOf(_.startCase(rule.trigger))

    return (
      <div className="rule-section">
        <h3 className="rule-section--heading">Rule Conditions</h3>
        <div className="rule-section--body">
          <Tabs initialIndex={initialIndex} onSelect={this.handleChooseTrigger}>
            <TabList isKapacitorTabs="true">
              {TABS.map(tab =>
                <Tab key={tab} isKapacitorTab={true}>
                  {tab}
                </Tab>
              )}
            </TabList>

            <TabPanels>
              <TabPanel>
                <Common
                  common={rule.common}
                  onChange={this.handleCommonChange}
                />
                <Threshold
                  rule={rule}
                  query={query}
                  onChange={this.handleValuesChange}
                />
              </TabPanel>
              <TabPanel>
                <Common
                  common={rule.common}
                  onChange={this.handleCommonChange}
                />
                <Relative rule={rule} onChange={this.handleValuesChange} />
              </TabPanel>
              <TabPanel>
                <Common
                  common={rule.common}
                  onChange={this.handleCommonChange}
                />
                <Deadman rule={rule} onChange={this.handleValuesChange} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    )
  },

  handleChooseTrigger(triggerIndex) {
    const {rule, onChooseTrigger} = this.props
    if (TABS[triggerIndex] === rule.trigger) {
      return
    }

    onChooseTrigger(rule.id, TABS[triggerIndex])
  },

  handleValuesChange(values) {
    const {onUpdateValues, rule} = this.props
    onUpdateValues(rule.id, rule.trigger, values)
  },

  handleCommonChange(value) {
    const {onUpdateCommon, rule} = this.props
    onUpdateCommon(rule.id, value)
  },
})

const Threshold = React.createClass({
  propTypes: {
    rule: PropTypes.shape({
      values: PropTypes.shape({
        operator: PropTypes.string,
        rangeOperator: PropTypes.string,
        value: PropTypes.string,
        rangeValue: PropTypes.string,
      }),
    }),
    onChange: PropTypes.func.isRequired,
    query: PropTypes.shape({}).isRequired,
  },

  handleDropdownChange(item) {
    this.props.onChange({...this.props.rule.values, [item.type]: item.text})
  },

  handleInputChange() {
    this.props.onChange({
      ...this.props.rule.values,
      value: this.valueInput.value,
      rangeValue: this.valueRangeInput ? this.valueRangeInput.value : '',
    })
  },

  render() {
    const {operator, value, rangeValue} = this.props.rule.values
    const {query} = this.props

    const operators = mapToItems(OPERATORS, 'operator')

    return (
      <div className="rule-section--row rule-section--border-bottom">
        <p>Send Alert where</p>
        <span className="rule-builder--metric">
          {query.fields.length ? query.fields[0].field : 'Select a Time-Series'}
        </span>
        <p>is</p>
        <Dropdown
          className="dropdown-180"
          menuClass="dropdown-malachite"
          items={operators}
          selected={operator}
          onChoose={this.handleDropdownChange}
        />
        <input
          className="form-control input-sm form-malachite monotype"
          style={{width: '160px'}}
          type="text"
          spellCheck="false"
          ref={r => (this.valueInput = r)}
          defaultValue={value}
          onKeyUp={this.handleInputChange}
          placeholder={
            operator === 'inside range' || operator === 'outside range'
              ? 'Lower'
              : null
          }
        />
        {(operator === 'inside range' || operator === 'outside range') &&
          <input
            className="form-control input-sm form-malachite monotype"
            style={{width: '160px'}}
            placeholder="Upper"
            type="text"
            spellCheck="false"
            ref={r => (this.valueRangeInput = r)}
            defaultValue={rangeValue}
            onKeyUp={this.handleInputChange}
          />}
      </div>
    )
  },
})

const Relative = React.createClass({
  propTypes: {
    rule: PropTypes.shape({
      values: PropTypes.shape({
        change: PropTypes.string,
        shift: PropTypes.string,
        operator: PropTypes.string,
        value: PropTypes.string,
      }),
    }),
    onChange: PropTypes.func.isRequired,
  },

  handleDropdownChange(item) {
    this.props.onChange({...this.props.rule.values, [item.type]: item.text})
  },

  handleInputChange() {
    this.props.onChange({...this.props.rule.values, value: this.input.value})
  },

  render() {
    const {change, shift, operator, value} = this.props.rule.values

    const changes = mapToItems(CHANGES, 'change')
    const shifts = mapToItems(SHIFTS, 'shift')
    const operators = mapToItems(OPERATORS, 'operator')

    return (
      <div className="rule-section--row rule-section--border-bottom">
        <p>Send Alert when</p>
        <Dropdown
          className="dropdown-110"
          menuClass="dropdown-malachite"
          items={changes}
          selected={change}
          onChoose={this.handleDropdownChange}
        />
        <p>compared to previous</p>
        <Dropdown
          className="dropdown-80"
          menuClass="dropdown-malachite"
          items={shifts}
          selected={shift}
          onChoose={this.handleDropdownChange}
        />
        <p>is</p>
        <Dropdown
          className="dropdown-160"
          menuClass="dropdown-malachite"
          items={operators}
          selected={operator}
          onChoose={this.handleDropdownChange}
        />
        <input
          className="form-control input-sm form-malachite monotype"
          style={{width: '160px'}}
          ref={r => (this.input = r)}
          defaultValue={value}
          onKeyUp={this.handleInputChange}
          required={true}
          type="text"
          spellCheck="false"
        />
        {change === CHANGES[1] ? <p>%</p> : null}
      </div>
    )
  },
})

const Deadman = React.createClass({
  propTypes: {
    rule: PropTypes.shape({
      values: PropTypes.shape({
        period: PropTypes.string,
      }),
    }),
    onChange: PropTypes.func.isRequired,
  },

  handleChange(item) {
    this.props.onChange({period: item.text})
  },

  render() {
    const periods = PERIODS.map(text => {
      return {text}
    })

    return (
      <div className="rule-section--row">
        <p>Send Alert if Data is missing for</p>
        <Dropdown
          className="dropdown-80"
          menuClass="dropdown-malachite"
          items={periods}
          selected={this.props.rule.values.period}
          onChoose={this.handleChange}
        />
      </div>
    )
  },
})

const Common = React.createClass({
  propTypes: {
    common: PropTypes.shape({
      periodValue: PropTypes.string,
    }),
    onChange: PropTypes.func.isRequired,
  },

  handleInputChange() {
    this.props.onChange({
      ...this.props.common,
      periodValue: this.valuePeriodInput
        ? this.handleDuration(this.valuePeriodInput.value)
        : '',
    })
  },

  handleDuration(dur) {
    const s = String(dur)
    if (s.indexOf('w') > 0) {
      return s.substr(0, s.indexOf('w') + 1)
    }
    if (s.indexOf('d') > 0) {
      return s.substr(0, s.indexOf('d') + 1)
    }
    if (s.indexOf('h') > 0) {
      return s.substr(0, s.indexOf('h') + 1)
    }
    if (s.indexOf('m') > 0) {
      return s.substr(0, s.indexOf('m') + 1)
    }
  },

  render() {
    const {periodValue} = this.props.common

    return (
      <div className="rule-section--row rule-section--border-bottom">
        <p>Alert Period</p>
        <input
          className="form-control input-sm form-malachite monotype"
          style={{width: '160px'}}
          placeholder="1s 1m or 1h"
          type="text"
          spellCheck="false"
          ref={r => (this.valuePeriodInput = r)}
          defaultValue={this.handleDuration(periodValue)}
          onKeyUp={this.handleInputChange}
        />
      </div>
    )
  },
})

export default ValuesSection
