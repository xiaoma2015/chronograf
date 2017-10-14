import React, {PropTypes, Component} from 'react'

import SourceIndicator from 'shared/components/SourceIndicator'
import TopicsTable from 'src/topics/components/TopicsTable'
import NoKapacitorError from 'shared/components/NoKapacitorError'

import {getTopics} from 'src/topics/apis'
import AJAX from 'utils/ajax'

import _ from 'lodash'

class TopicsApp extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      hasKapacitor: false,
      topics: [],
      limit: 100, // only used if TopicsApp receives a limit prop
      limitMultiplier: 1, // only used if TopicsApp receives a limit prop
      isTopicsMaxedOut: false, // only used if TopicsApp receives a limit prop
    }

    this.fetchTopics = ::this.fetchTopics
    this.renderSubComponents = ::this.renderSubComponents
    this.handleGetMoreTopics = ::this.handleGetMoreTopics
  }

  // TODO: show a loading screen until we figure out if there is a kapacitor and fetch the topics
  componentDidMount() {
    const {source} = this.props
    AJAX({
      url: source.links.kapacitors,
      method: 'GET',
    }).then(({data}) => {
      if (data.kapacitors[0]) {
        this.setState({hasKapacitor: true})

        this.fetchTopics()
      } else {
        this.setState({loading: false})
      }
    })
  }

  componentDidUpdate() {
    // this.fetchTopics()
  }

  fetchTopics() {
    getTopics()
      .then(resp => {
        const results = []
        const alertTopics = _.get(resp, ['data', 'topics'], [])
        if (alertTopics.length === 0) {
          this.setState({loading: false, topics: []})
          return
        }
        alertTopics.forEach(s => {
          results.push({
            collected: s.collected,
            level: s.level,
            name: s.id,
          })
        })
        // console.error(results)
        // TODO: factor these setStates out to make a pure function and implement true limit & offset
        this.setState({
          loading: false,
          topics: results,
          // this.state.topics.length === results.length ||
          isTopicsMaxedOut: false,
        })
      })
      .catch(() => {
        console.error('error')
      })
  }

  handleGetMoreTopics() {
    this.setState({limitMultiplier: this.state.limitMultiplier + 1}, () => {
      this.fetchTopics(this.state.limitMultiplier)
    })
  }

  renderSubComponents() {
    const {source, isWidget, limit} = this.props
    const {isTopicsMaxedOut, topics} = this.state

    return this.state.hasKapacitor
      ? <TopicsTable
          source={source}
          topics={this.state.topics}
          shouldNotBeFilterable={isWidget}
          limit={limit}
          onGetMoreTopics={this.handleGetMoreTopics}
          isTopicsMaxedOut={isTopicsMaxedOut}
          topicsCount={topics.length}
        />
      : <NoKapacitorError source={source} />
  }

  render() {
    const {isWidget, source} = this.props
    const {loading} = this.state

    if (loading || !source) {
      return <div className="page-spinner" />
    }

    return isWidget
      ? this.renderSubComponents()
      : <div className="page alert-history-page">
          <div className="page-header">
            <div className="page-header__container">
              <div className="page-header__left">
                <h1 className="page-header__title">Alert Topics</h1>
              </div>
              <div className="page-header__right">
                <SourceIndicator sourceName={source.name} />
              </div>
            </div>
          </div>
          <div className="page-contents">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-12">
                  {this.renderSubComponents()}
                </div>
              </div>
            </div>
          </div>
        </div>
  }
}

const {bool, number, shape, string} = PropTypes

TopicsApp.propTypes = {
  source: shape({
    id: string.isRequired,
    name: string.isRequired,
    type: string, // 'influx-enterprise'
    links: shape({
      proxy: string.isRequired,
    }).isRequired,
  }),
  isWidget: bool,
  limit: number,
}

export default TopicsApp
