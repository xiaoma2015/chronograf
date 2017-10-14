import axios from 'axios'

let links

// do not prefix route with basepath, ex. for external links
const addBasepath = (url, excludeBasepath) => {
  const basepath = window.basepath || ''

  return excludeBasepath ? url : `${basepath}${url}`
}

const generateResponseWithLinks = (response, {auth, logout, external}) => ({
  ...response,
  auth: {links: auth},
  logoutLink: logout,
  external,
})

const AJAX = async (
  {url, resource, id, method = 'GET', data = {}, params = {}, headers = {}},
  excludeBasepath
) => {
  try {
    let response
    // if (url.substring(0, 4) === 'http') {
    if (url === 'http://10.10.1.96:9092/kapacitor/v1preview/alerts/topics') {
      response = await axios({
        url,
        method,
        data,
        params,
        headers,
      })
      return response
    }

    url = addBasepath(url, excludeBasepath)

    if (!links) {
      const linksRes = (response = await axios({
        url: addBasepath('/chronograf/v1', excludeBasepath),
        method: 'GET',
      }))
      links = linksRes.data
    }

    if (resource) {
      url = id
        ? addBasepath(`${links[resource]}/${id}`, excludeBasepath)
        : addBasepath(`${links[resource]}`, excludeBasepath)
    }

    response = await axios({
      url,
      method,
      data,
      params,
      headers,
    })

    return generateResponseWithLinks(response, links)
  } catch (error) {
    const {response} = error

    throw generateResponseWithLinks(response, links) // eslint-disable-line no-throw-literal
  }
}

export const get = async url => {
  try {
    return await AJAX({
      method: 'GET',
      url,
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}

export default AJAX
