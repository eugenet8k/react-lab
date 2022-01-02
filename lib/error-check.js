import _ from 'lodash'
import {ServerError} from './server-error'

export const isAbortError = error =>
  error instanceof Error && error.name === 'AbortError'

export const isServerError = error => error instanceof ServerError

// Is it a network related error?
// For simplicity in generic catch blocks we consider that Server are
// Network related errors. If a special check
// needed for only network errors, something like this should be used:
// isNetwork(error) && !isServerError(error)
export const isNetworkError = error =>
  isServerError(error) ||
  (error instanceof Error &&
    !isAbortError(error) &&
    // If error has `response.status === 0`, it is 100% network error,
    // because we put `0` there in `fetchJSON` function's catch block.
    (error.response?.status === 0 ||
      // `global.fetch` raises TypeError if there is no network connection (browser is offline).
      (error.name === 'TypeError' &&
        _.thru(_.lowerCase(error.message), message =>
          _.some(['fetch', 'network', 'offline', 'request', 'timed out'], str =>
            _.includes(message, str)
          )
        ))))
