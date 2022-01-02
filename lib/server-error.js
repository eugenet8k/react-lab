import _ from 'lodash'

// to avoid obnoxious checks for `response` or `body` presence in some Network
// related errors like Blocked Browser Requests or Abortion.
export const polyfillError = error =>
  _.defaults(error, {response: {ok: false, status: 0}, body: {}})

export class ServerError extends Error {
  constructor(errorText, context = {}) {
    super(`Request to server failed with "${errorText}"`)
    this.name = 'ServerError'
    _.extend(this, polyfillError(context))
  }
}
