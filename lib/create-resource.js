/* eslint-disable import/prefer-default-export */
export const createResource = func => {
  let isPending = true
  let result
  let error

  const abortController = new global.AbortController()
  const promise = func({signal: abortController.signal}).then(
    r => {
      result = r
      isPending = false
    },
    e => {
      error = e
      isPending = false
    }
  )

  return {
    value: () => {
      if (isPending) throw promise
      if (error) throw error
      return result
    },
    cancel: () => abortController.abort(),
    status: () => (isPending ? 'pending' : error ? 'error' : 'success'),
  }
}
