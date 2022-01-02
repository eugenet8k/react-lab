import {useCallback, useEffect, useState, useRef, useTransition} from 'react'
import {createResource} from './create-resource'

// Creates a singular instance of a resource (one server request) that lives
// as long as the component is mounted and is being cancelled (aborting server
// request if it is in progress) upon the component's unmounting
export const useResourceOnce = (serviceFn, initialValue) => {
  const resource = useRef(initialValue)
  if (!resource.current)
    resource.current = createResource(opts => serviceFn(opts))
  useEffect(() => () => resource.current?.cancel(), [])
  return resource.current
}

// Returns a simple API for creating a resource (imperative) and passing it to
// the branched universe state via React transition.
export const useResource = (serviceFn, initialValue) => {
  const concurrentResource = useRef(initialValue)
  const [resource, setResource] = useState(initialValue)
  const [isPending, startTransition] = useTransition()
  const createResourceTransition = useCallback(
    (serviceFnArgs, transitionCallback) => {
      // aborting pending network activity
      concurrentResource.current?.cancel()
      const newResource = createResource(opts =>
        serviceFn({...opts, ...serviceFnArgs})
      )
      // saving the resource created for a branched universe in a current universe
      // to cancel it if users acted in the UI and want another request to server
      // before the previous one is finished
      concurrentResource.current = newResource
      startTransition(() => {
        setResource({
          ...newResource,
          dispose: () => {
            newResource.cancel()
            setResource(null)
          },
        })
        // allow users to add additional state updates to apply in the branched universe
        transitionCallback?.()
      })
    },
    [serviceFn, startTransition]
  )
  useEffect(() => () => resource?.cancel(), [resource])
  return [resource, isPending, createResourceTransition]
}
