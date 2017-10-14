import AJAX from 'utils/ajax'

export function getTopics() {
  return AJAX({
    method: 'GET',
    url: 'http://10.10.1.96:9092/kapacitor/v1preview/alerts/topics',
  })
}
