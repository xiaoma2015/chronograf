import React, {PropTypes} from 'react'

import DataSection from 'src/kapacitor/components/DataSection'
import ValuesSection from 'src/kapacitor/components/ValuesSection'
import RuleHeader from 'src/kapacitor/components/RuleHeader'
import RuleGraph from 'src/kapacitor/components/RuleGraph'
import RuleMessage from 'src/kapacitor/components/RuleMessage'
import FancyScrollbar from 'shared/components/FancyScrollbar'

import {createRule, editRule} from 'src/kapacitor/apis'
import buildInfluxQLQuery from 'utils/influxql'
import timeRanges from 'hson!shared/data/timeRanges.hson'

export const KapacitorRule = React.createClass({
  propTypes: {
    source: PropTypes.shape({}).isRequired,
    rule: PropTypes.shape({}).isRequired,
    query: PropTypes.shape({}).isRequired,
    queryConfigs: PropTypes.shape({}).isRequired,
    queryConfigActions: PropTypes.shape({}).isRequired,
    ruleActions: PropTypes.shape({}).isRequired,
    addFlashMessage: PropTypes.func.isRequired,
    isEditing: PropTypes.bool.isRequired,
    enabledAlerts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    kapacitor: PropTypes.shape({}).isRequired,
  },

  getInitialState() {
    return {
      timeRange: timeRanges.find(tr => tr.lower === 'now() - 15m'),
    }
  },

  render() {
    const {
      queryConfigActions,
      source,
      enabledAlerts,
      queryConfigs,
      query,
      rule,
      ruleActions,
      isEditing,
    } = this.props
    const {chooseTrigger, updateRuleValues, updateCommon} = ruleActions
    const {timeRange} = this.state

    return (
      <div className="page">
        <RuleHeader
          rule={rule}
          actions={ruleActions}
          onSave={isEditing ? this.handleEdit : this.handleCreate}
          onChooseTimeRange={this.handleChooseTimeRange}
          validationError={this.validationError()}
          timeRange={timeRange}
          source={source}
        />
        <FancyScrollbar className="page-contents fancy-scroll--kapacitor">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12">
                <div className="rule-builder">
                  <DataSection
                    timeRange={timeRange}
                    source={source}
                    query={query}
                    actions={queryConfigActions}
                    onAddEvery={this.handleAddEvery}
                    onRemoveEvery={this.handleRemoveEvery}
                    isKapacitorRule={true}
                  />
                  <ValuesSection
                    rule={rule}
                    query={queryConfigs[rule.queryID]}
                    onChooseTrigger={chooseTrigger}
                    onUpdateValues={updateRuleValues}
                    onUpdateCommon={updateCommon}
                  />
                  <RuleGraph
                    timeRange={timeRange}
                    source={source}
                    query={query}
                    rule={rule}
                  />
                  <RuleMessage
                    rule={rule}
                    actions={ruleActions}
                    enabledAlerts={enabledAlerts}
                  />
                </div>
              </div>
            </div>
          </div>
        </FancyScrollbar>
      </div>
    )
  },

  handleChooseTimeRange({lower}) {
    const timeRange = timeRanges.find(range => range.lower === lower)
    this.setState({timeRange})
  },

  handleCreate() {
    const {
      addFlashMessage,
      queryConfigs,
      rule,
      source,
      router,
      kapacitor,
    } = this.props

    const newRule = Object.assign({}, rule, {
      query: queryConfigs[rule.queryID],
    })
    delete newRule.queryID

    createRule(kapacitor, newRule)
      .then(() => {
        router.push(`/sources/${source.id}/alert-rules`)
        addFlashMessage({type: 'success', text: 'Rule successfully created'})
      })
      .catch(() => {
        addFlashMessage({
          type: 'error',
          text: 'There was a problem creating the rule',
        })
      })
  },

  handleEdit() {
    const {addFlashMessage, queryConfigs, rule} = this.props
    const updatedRule = Object.assign({}, rule, {
      query: queryConfigs[rule.queryID],
    })

    editRule(updatedRule)
      .then(() => {
        addFlashMessage({type: 'success', text: 'Rule successfully updated!'})
      })
      .catch(() => {
        addFlashMessage({
          type: 'error',
          text: 'There was a problem updating the rule',
        })
      })
  },

  handleAddEvery(frequency) {
    const {rule: {id: ruleID}, ruleActions: {addEvery}} = this.props
    addEvery(ruleID, frequency)
  },

  handleRemoveEvery() {
    const {rule: {id: ruleID}, ruleActions: {removeEvery}} = this.props
    removeEvery(ruleID)
  },

  validationError() {
    const {rule, query} = this.props
    if (rule.trigger === 'deadman') {
      return this.deadmanValidation()
    }

    if (!buildInfluxQLQuery({}, query)) {
      return 'Please select a database, measurement, and field'
    }

    if (!rule.values.value) {
      return 'Please enter a value in the Rule Conditions section'
    }

    if (!rule.common || !rule.common.periodValue) {
      return 'Please enter a value in the Rule Common section'
    }

    return ''
  },

  deadmanValidation() {
    const {query} = this.props
    if (query && (!query.database || !query.measurement)) {
      return 'Deadman requires a database and measurement'
    }

    return ''
  },
})

export default KapacitorRule
