import {Suspense} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {createResource} from './create-resource'
import {useResourceOnce, useResource} from './use-resource'

const ResourceContent = ({resource}) => (
  <div className="content">{resource.value()}</div>
)

describe(__filename, () => {
  describe('useResourceOnce', () => {
    let find
    let unmount
    let serviceFn
    let initialValue
    let resolve
    let reject

    const TestResourceOnce = () => {
      const resource = useResourceOnce(serviceFn, initialValue)
      return (
        <ErrorBoundary fallback={<div className="error">Error happened</div>}>
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <ResourceContent resource={resource} />
          </Suspense>
        </ErrorBoundary>
      )
    }

    beforeEach(() => {
      serviceFn = jest.fn(
        () => new Promise((...args) => ([resolve, reject] = args))
      )
      ;({find, unmount} = render(<TestResourceOnce />))
    })

    it('should render loading state', () => {
      expect(find('.loading')).toBeInTheDocument()
    })

    it('should pass args to service function', () => {
      expect(serviceFn).toHaveBeenCalledWith({
        signal: expect.any(AbortSignal),
      })
    })

    describe('and initialValue is passed', () => {
      beforeAll(
        () => (initialValue = createResource(() => Promise.resolve('Old data')))
      )

      afterAll(() => (initialValue = undefined))

      it('should render content', () => {
        expect(find('.content')).toHaveTextContent('Old data')
      })
    })

    describe('when service success', () => {
      beforeEach(() => act(() => resolve('My Data')))

      it('should render content', () => {
        expect(find('.content')).toHaveTextContent('My Data')
      })
    })

    describe('when service failed', () => {
      beforeEach(() => act(() => reject(new Error('oops'))))

      it('should render error', () => {
        expect(find('.error')).toBeInTheDocument()
      })
    })

    describe('when unmount', () => {
      beforeEach(() => unmount())

      it('should hide content', () => {
        expect(find('.content')).not.toBeInTheDocument()
      })
    })
  })

  describe('useResource', () => {
    let find
    let unmount
    let serviceFn
    let initialValue
    let resolve
    let reject
    let ref

    const TestResource = ({transitionRef}) => {
      const [resource, , startTransition] = useResource(serviceFn, initialValue)
      transitionRef.current = startTransition
      return (
        <ErrorBoundary fallback={<div className="error">Error happened</div>}>
          {resource ? (
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <>
                <ResourceContent resource={resource} />
                <button
                  className="dispose-resource"
                  type="button"
                  onClick={() => resource.dispose()}
                />
              </>
            </Suspense>
          ) : (
            <div className="no-content">Start loading</div>
          )}
        </ErrorBoundary>
      )
    }

    beforeEach(() => {
      serviceFn = jest.fn(
        () => new Promise((...args) => ([resolve, reject] = args))
      )
      ref = {}
      ;({find, unmount} = render(<TestResource transitionRef={ref} />))
    })

    it('should render no content state', () => {
      expect(find('.no-content')).toBeInTheDocument()
    })

    describe('and initialValue is passed', () => {
      beforeAll(
        () => (initialValue = createResource(() => Promise.resolve('Old data')))
      )

      afterAll(() => (initialValue = undefined))

      it('should render content', () => {
        expect(find('.content')).toHaveTextContent('Old data')
      })
    })

    describe('when service request initiated', () => {
      beforeEach(() => act(() => ref.current({get: 'that'})))

      it('should render loading state', () => {
        expect(find('.loading')).toBeInTheDocument()
      })

      it('should pass args to service function', () => {
        expect(serviceFn).toHaveBeenCalledWith({
          get: 'that',
          signal: expect.any(AbortSignal),
        })
      })

      describe('when service success', () => {
        beforeEach(() => act(() => resolve('My Data')))

        it('should render content', () => {
          expect(find('.content')).toHaveTextContent('My Data')
        })

        describe('when resource disposed', () => {
          beforeEach(() =>
            act(() => fireEvent.click(find('.dispose-resource')))
          )

          it('should render no content state', () => {
            expect(find('.no-content')).toBeInTheDocument()
          })
        })
      })

      describe('when service failed', () => {
        beforeEach(() => act(() => reject(new Error('oops'))))

        it('should render error', () => {
          expect(find('.error')).toBeInTheDocument()
        })
      })

      describe('when unmount', () => {
        beforeEach(() => unmount())

        it('should hide content', () => {
          expect(find('.content')).not.toBeInTheDocument()
        })
      })
    })
  })
})
