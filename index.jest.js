/* istanbul ignore file */
require('@testing-library/jest-dom')
const {
  act,
  fireEvent,
  prettyDOM,
  render,
  waitFor,
} = require('@testing-library/react')
const _ = require('lodash')

global._ = _
global.act = act
global.fireEvent = fireEvent
global.prettyDOM = prettyDOM
global.render = (...args) => {
  const {container, ...rest} = render(...args)
  const find = container.querySelector.bind(container)
  const findAll = container.querySelectorAll.bind(container)
  return {container, find, findAll, ...rest}
}
global.waitFor = waitFor
global.lastCall = fn => fn.mock.calls[fn.mock.calls.length - 1]
