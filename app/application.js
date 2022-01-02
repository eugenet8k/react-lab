import {Suspense, useEffect} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {useResource} from '../lib/use-resource'
import NetworkErrorBoundary from '../lib/network-error-boundary'
import {readCats} from './service'

let c = 0

const Cats = ({cats}) =>
  _.map(cats.value(), ({url}) => (
    <div key={url}>
      <img
        src={url}
        css={{width: 500}}
        alt="Cat"
        // To test unhandled exception boundary, throw after 10 renders
        // eslint-disable-next-line no-plusplus
        name={c++ > 10 ? c.throw.error : null}
      />
    </div>
  ))

const Application = () => {
  const [catsResource, isPending, startTransition] = useResource(readCats)

  useEffect(() => {
    startTransition({})
  }, [startTransition])

  return (
    <div className="application" css={{margin: 20}}>
      <ErrorBoundary
        fallback={
          <div>There was an unhandled error, please restart the app.</div>
        }
      >
        <h1 css={{color: 'silver'}}>Hello cats!</h1>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition({})}
          css={{marginBottom: 20}}
        >
          {isPending ? 'Loading...' : 'Show another'}
        </button>
        {catsResource && (
          <NetworkErrorBoundary
            fallback={<div>There was a network or server error!</div>}
            resetKeys={[catsResource]}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <Cats cats={catsResource} />
            </Suspense>
          </NetworkErrorBoundary>
        )}
      </ErrorBoundary>
    </div>
  )
}

export default Application
