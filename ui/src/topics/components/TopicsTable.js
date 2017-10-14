import React, {Component, PropTypes} from 'react'

import _ from 'lodash'
import classnames from 'classnames'
import {Link} from 'react-router'
import uuid from 'node-uuid'

import FancyScrollbar from 'shared/components/FancyScrollbar'

import {TOPICS_TABLE} from 'src/topics/constants/tableSizing'

class TopicsTable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      searchTerm: '',
      filteredTopics: this.props.topics,
      sortDirection: null,
      sortKey: null,
    }
  }

  componentWillReceiveProps(newProps) {
    this.filterTopics(this.state.searchTerm, newProps.topics)
  }

  filterTopics = (searchTerm, newTopics) => {
    const topics = newTopics || this.props.topics
    const filterText = searchTerm.toLowerCase()
    const filteredTopics = topics.filter(({name, level}) => {
      return (
        (name && name.toLowerCase().includes(filterText)) ||
        (level && level.toLowerCase().includes(filterText))
      )
    })
    this.setState({searchTerm, filteredTopics})
  }

  changeSort = key => () => {
    // if we're using the key, reverse order; otherwise, set it with ascending
    if (this.state.sortKey === key) {
      const reverseDirection =
        this.state.sortDirection === 'asc' ? 'desc' : 'asc'
      this.setState({sortDirection: reverseDirection})
    } else {
      this.setState({sortKey: key, sortDirection: 'asc'})
    }
  }

  sortableClasses = key => () => {
    if (this.state.sortKey === key) {
      if (this.state.sortDirection === 'asc') {
        return 'alert-history-table--th sortable-header sorting-ascending'
      }
      return 'alert-history-table--th sortable-header sorting-descending'
    }
    return 'alert-history-table--th sortable-header'
  }

  sort = (topics, key, direction) => {
    switch (direction) {
      case 'asc':
        return _.sortBy(topics, e => e[key])
      case 'desc':
        return _.sortBy(topics, e => e[key]).reverse()
      default:
        return topics
    }
  }

  renderTable() {
    const {source: {id}} = this.props
    const topics = this.sort(
      this.state.filteredTopics,
      this.state.sortKey,
      this.state.sortDirection
    )
    const {colName, colLevel, colCollected} = TOPICS_TABLE
    return this.props.topics.length
      ? <div className="alert-history-table">
          <div className="alert-history-table--thead">
            <div
              onClick={this.changeSort('name')}
              className={this.sortableClasses('name')}
              style={{width: colName}}
            >
              Name
            </div>
            <div
              onClick={this.changeSort('level')}
              className={this.sortableClasses('level')}
              style={{width: colLevel}}
            >
              Level
            </div>
            <div
              onClick={this.changeSort('collected')}
              className={this.sortableClasses('collected')}
              style={{width: colCollected}}
            >
              Collected
            </div>
          </div>
          <FancyScrollbar
            className="alert-history-table--tbody"
            autoHide={false}
          >
            {topics.map(({name, level, collected}) => {
              return (
                <div className="alert-history-table--tr" key={uuid.v4()}>
                  <div
                    className="alert-history-table--td"
                    style={{width: colName}}
                  >
                    <Link to={`/sources/${id}/topics/${name}`} title={name}>
                      {name}
                    </Link>
                  </div>
                  <div
                    className={`alert-history-table--td alert-level-${level.toLowerCase()}`}
                    style={{width: colLevel}}
                  >
                    <span
                      className={classnames(
                        'table-dot',
                        {'dot-critical': level === 'CRITICAL'},
                        {'dot-warning': level === 'WARNING'},
                        {'dot-success': level === 'OK'}
                      )}
                    />
                  </div>
                  <div
                    className="alert-history-table--td"
                    style={{width: colCollected}}
                  >
                    {collected}
                  </div>
                </div>
              )
            })}
          </FancyScrollbar>
        </div>
      : this.renderTableEmpty()
  }

  renderTableEmpty() {
    const {source: {id}, shouldNotBeFilterable} = this.props

    return shouldNotBeFilterable
      ? <div className="graph-empty">
          <p>
            Learn how to configure your first <strong>Topic</strong> in<br />
            the <em>Getting Started</em> guide
          </p>
        </div>
      : <div className="generic-empty-state">
          <h4 className="no-user-select">There are no Topics to display</h4>
          <br />
          <h6 className="no-user-select">
            <Link
              style={{marginLeft: '10px'}}
              to={`/sources/${id}/topics/new`}
              className="btn btn-primary btn-sm"
            >
              Create an Alert Topic
            </Link>
          </h6>
        </div>
  }

  render() {
    const {
      shouldNotBeFilterable,
      limit,
      onGetMoreTopics,
      isTopicsMaxedOut,
      topicsCount,
    } = this.props

    return shouldNotBeFilterable
      ? <div className="topics-widget">
          {this.renderTable()}
          {limit && topicsCount
            ? <button
                className="btn btn-sm btn-default btn-block"
                onClick={onGetMoreTopics}
                disabled={isTopicsMaxedOut}
                style={{marginBottom: '20px'}}
              >
                {isTopicsMaxedOut
                  ? `All ${topicsCount} Topics displayed`
                  : 'Load next 30 Topics'}
              </button>
            : null}
        </div>
      : <div className="panel panel-minimal">
          <div className="panel-heading u-flex u-ai-center u-jc-space-between">
            <h2 className="panel-title">
              {this.props.topics.length} Topics
            </h2>
            {this.props.topics.length
              ? <SearchBar onSearch={this.filterTopics} />
              : null}
          </div>
          <div className="panel-body">
            {this.renderTable()}
          </div>
        </div>
  }
}

class SearchBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      searchTerm: '',
    }

    this.handleSearch = ::this.handleSearch
    this.handleChange = ::this.handleChange
  }

  componentWillMount() {
    const waitPeriod = 300
    this.handleSearch = _.debounce(this.handleSearch, waitPeriod)
  }

  handleSearch() {
    this.props.onSearch(this.state.searchTerm)
  }

  handleChange(e) {
    this.setState({searchTerm: e.target.value}, this.handleSearch)
  }

  render() {
    return (
      <div className="users__search-widget input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Filter Topics..."
          onChange={this.handleChange}
          value={this.state.searchTerm}
        />
        <div className="input-group-addon">
          <span className="icon search" />
        </div>
      </div>
    )
  }
}

const {arrayOf, bool, func, number, shape, string} = PropTypes

TopicsTable.propTypes = {
  topics: arrayOf(
    shape({
      name: string,
      collected: string,
      level: string,
    })
  ),
  source: shape({
    id: string.isRequired,
    name: string.isRequired,
  }).isRequired,
  shouldNotBeFilterable: bool,
  limit: number,
  onGetMoreTopics: func,
  isTopicsMaxedOut: bool,
  topicsCount: number,
}

SearchBar.propTypes = {
  onSearch: func.isRequired,
}

export default TopicsTable
