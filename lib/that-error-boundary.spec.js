import {Suspense} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {useResourceOnce} from './use-resource'
import {ThatErrorBoundary} from './that-error-boundary'

const ResourceContent = ({resource}) => (
  <div className="content">{resource.value()}</div>
)

const isNetworkError = error => !!error.response

describe(__filename, () => {
  let find
  let serviceFn
  let resolve
  let reject
  let fallbackRender

  const TestResourceOnce = () => {
    const resource = useResourceOnce(serviceFn)
    return (
      <ErrorBoundary
        fallback={<div className="error">Unhandled error happened</div>}
      >
        <ThatErrorBoundary
          isThatError={isNetworkError}
          fallback={<div className="service-error">Server is down</div>}
          fallbackRender={fallbackRender}
        >
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <ResourceContent resource={resource} />
          </Suspense>
        </ThatErrorBoundary>
      </ErrorBoundary>
    )
  }

  beforeEach(() => {
    serviceFn = jest.fn(
      () => new Promise((...args) => ([resolve, reject] = args))
    )
    ;({find} = render(<TestResourceOnce />))
  })

  it('should render loading state', () => {
    expect(find('.loading')).toHaveTextContent('Loading...')
  })

  describe('when service success', () => {
    beforeEach(() => act(() => resolve('My Data')))

    it('should render content', () => {
      expect(find('.content')).toHaveTextContent('My Data')
    })
  })

  describe('when a generic error raised', () => {
    beforeEach(() => act(() => reject(new Error('oops'))))

    it('should render error', () => {
      expect(find('.error')).toHaveTextContent('Unhandled error happened')
      expect(find('.service-error')).not.toBeInTheDocument()
    })

    describe('when fallbackRender is set', () => {
      beforeAll(
        () =>
          (fallbackRender = ({error}) => (
            <div className="special-service-error">{error.response.status}</div>
          ))
      )
      afterAll(() => (fallbackRender = undefined))

      it('should not render special service error', () => {
        expect(find('.error')).toBeInTheDocument()
        expect(find('.service-error')).not.toBeInTheDocument()
        expect(find('.special-service-error')).not.toBeInTheDocument()
      })
    })
  })

  describe('when a network error raised', () => {
    beforeEach(() =>
      act(() => reject(_.extend(new Error('oops'), {response: {status: 500}})))
    )

    it('should render service error', () => {
      expect(find('.error')).not.toBeInTheDocument()
      expect(find('.service-error')).toHaveTextContent('Server is down')
    })

    describe('when fallbackRender is set', () => {
      beforeAll(
        () =>
          (fallbackRender = ({error}) => (
            <div className="special-service-error">{error.response.status}</div>
          ))
      )
      afterAll(() => (fallbackRender = undefined))

      it('should render special service error', () => {
        expect(find('.error')).not.toBeInTheDocument()
        expect(find('.service-error')).not.toBeInTheDocument()
        expect(find('.special-service-error')).toHaveTextContent('500')
      })
    })
  })
})
