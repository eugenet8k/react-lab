import {Suspense, useEffect} from 'react'
import {useResource} from '../lib/use-resource'
import {readCats} from './service'

const Cats = ({cats}) =>
  _.map(cats.value(), ({url}) => (
    <div>
      <img src={url} css={{width: 500}} alt="Cat" />
    </div>
  ))

const Application = () => {
  const [catsResource, isPending, startTransition] = useResource(readCats)

  useEffect(() => {
    startTransition({})
  }, [startTransition])

  return (
    <div className="application" css={{margin: 20}}>
      <h1 css={{color: 'silver'}}>Hello cats!</h1>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition({})}
        css={{marginBottom: 20}}
      >
        {isPending ? 'Loading...' : 'Another'}
      </button>
      {catsResource && (
        <Suspense fallback={<div>Loading...</div>}>
          <Cats cats={catsResource} />
        </Suspense>
      )}
    </div>
  )
}

export default Application
