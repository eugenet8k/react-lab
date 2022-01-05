import _ from 'lodash'
import {isNetworkError, isAbortError} from './error-check'
import {ServerError, polyfillError} from './server-error'

export const fetchJSON = async (
  url,
  {headers, defaultHeaders = {}, ...opts} = {}
) => {
  try {
    const response = await global.fetch(url, {
      headers: new global.Headers({
        ...defaultHeaders,
        ...headers,
      }),
      ...opts,
    })
    if (response) return response
    throw new ServerError('There is no response!')
  } catch (error) {
    if (isNetworkError(error) || isAbortError(error)) throw polyfillError(error)
    else throw error
  }
}

// When the response body is empty (status 204 or 205) and
// response.json() is called, an unexpected end of
// input error is thrown unless we intercede.
const resolveJSON = response =>
  _.includes([204, 205], response.status) ? {} : _.result(response, 'json')

const resolveText = response => _.result(response, 'text')

export const parseResponse = async response => {
  const contentType = response.headers.get('content-type')

  // Header could be `Content-Type: application/json;charset=utf-8`
  if (_.startsWith(contentType, 'application/json'))
    try {
      return await resolveJSON(response)
    } catch {
      return {}
    }

  if (_.startsWith(contentType, 'text/html'))
    try {
      return await resolveText(response)
    } catch {
      return ''
    }
}

export const request = async (
  url,
  {onBeforeFetch, onAfterFetch, onError, ...opts} = {}
) => {
  onBeforeFetch?.(url, opts)
  const response = await fetchJSON(url, opts)
  onAfterFetch?.(url, opts)
  const body = await parseResponse(response)
  if (response.ok) return body
  const error = new ServerError(response.statusText, {response, body})
  onError?.(error)
  throw error
}
