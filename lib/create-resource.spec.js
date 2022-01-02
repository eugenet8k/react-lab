import {createResource} from './create-resource'

describe(__filename, () => {
  let resolve
  let reject
  let fetchSomething
  let resource

  beforeEach(() => {
    fetchSomething = jest.fn(
      () => new Promise((...args) => ([resolve, reject] = args))
    )
    resource = createResource(fetchSomething)
  })

  it('should create a resource in pending state', () => {
    expect(() => resource.value()).toThrow(
      expect.objectContaining({then: expect.any(Function)})
    )
    expect(resource.status()).toEqual('pending')
  })

  describe('when resource was cancelled', () => {
    beforeEach(() => resource.cancel())

    it('should abort the AbortController', () => {
      const [{signal}] = lastCall(fetchSomething)
      expect(signal.aborted).toBeTruthy()
    })
  })

  describe('when promise resolves', () => {
    beforeEach(() => resolve({yes: 'we did it'}))

    it('should resolve the resource', () => {
      expect(resource.value()).toEqual({yes: 'we did it'})
      expect(resource.status()).toEqual('success')
    })
  })

  describe('when promise rejected with an error', () => {
    beforeEach(() => reject(new Error('nope')))

    it('should mark the resource as failed', () => {
      expect(() => resource.value()).toThrow(
        expect.objectContaining({message: 'nope'})
      )
      expect(resource.status()).toEqual('error')
    })
  })
})
