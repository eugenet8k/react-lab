import {Suspense, useEffect, useState, useMemo, useRef} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {useResource} from '../lib/use-resource'
import NetworkErrorBoundary from '../lib/network-error-boundary'
import {readGifs} from './service'

const Gifs = ({gifs}) =>
  _.map(
    gifs.value().data,
    ({
      images: {
        downsized: {url},
      },
    }) => (
      <div key={url} css={{width: 300, height: 300, display: 'inline-block'}}>
        <img src={url} css={{maxWidth: '100%', maxHeight: '100%'}} alt="Gif" />
      </div>
    )
  )

const Application = () => {
  const [gifsResource, isPending, startTransition] = useResource(readGifs)
  const [query, setQuery] = useState('')
  const [offset, setOffset] = useState(0)
  const [cache, setCache] = useState([])

  useEffect(() => {
    if (gifsResource) {
      gifsResource.key = _.uniqueId('gifs')
      setCache(prevState => [...prevState, gifsResource])
    }
  }, [gifsResource])

  const carefulStart = useMemo(
    () => _.debounce(startTransition, 500, {}),
    [startTransition]
  )

  useEffect(() => {
    if (query) {
      setCache([])
      carefulStart({q: query})
    }
  }, [query, carefulStart])

  return (
    <div className="application" css={{margin: 20}}>
      <ErrorBoundary
        fallback={
          <div>There was an unhandled error, please restart the app.</div>
        }
      >
        <h1 css={{color: 'silver'}}>Hello gifs!</h1>
        <input
          type="text"
          css={{width: 300}}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            setOffset(offset + 5)
            carefulStart({q: query, offset: offset + 5})
          }}
        >
          Next page
        </button>
        <span>{isPending && 'Loading...'}</span>
        {_.size(cache) > 0 && (
          <NetworkErrorBoundary
            fallback={<div>There was a network or server error!</div>}
            resetKeys={[_.tail(cache)]}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <div
                css={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 20,
                  marginTop: 20,
                }}
              >
                {_.map(cache, c => (
                  <Gifs key={c.key} gifs={c} />
                ))}
              </div>
            </Suspense>
          </NetworkErrorBoundary>
        )}
      </ErrorBoundary>
    </div>
  )
}

export default Application
