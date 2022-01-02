import {isAbortError, isNetworkError} from './error-check'
import {ServerError} from './server-error'

function AbortError(message) {
  this.name = 'AbortError'
  this.message = message
}
AbortError.prototype = new Error()

describe(`isAbortError`, () => {
  it('should return true for AbortError', () => {
    const error = new AbortError('I can not do it anymore')
    expect(isAbortError(error)).toBeTruthy()
  })
})

describe(`isNetworkError`, () => {
  it('should return true for error with {response: {status: 0}', () => {
    const error = _.extend(new Error('oh'), {response: {status: 0}})
    expect(isNetworkError(error)).toBeTruthy()
  })

  it('should return true for a browser Offline error', () => {
    const error = new TypeError('browser is offline')
    expect(isNetworkError(error)).toBeTruthy()
  })

  it('should return true for a server  error', () => {
    const error = new ServerError('bad thing')
    expect(isNetworkError(error)).toBeTruthy()
    expect(error.response.status).toEqual(0)
  })

  it('should return false for AbortError', () => {
    const error = new AbortError('fetch failed due to abort')
    expect(isNetworkError(error)).toBeFalsy()
  })
})
