import PropTypes from 'prop-types'
import {ErrorBoundary} from 'react-error-boundary'

// A simple add-on to ErrorBoundary that will filter all the errors passing through
// and catch only a specific type of errors. If an error is not _that_ that we
// want this component won't do anything, therefore make sure there
// is another catch all ErrorBoundary higher the React DOM tree.
export const ThatErrorBoundary = ({
  fallback,
  fallbackRender,
  isThatError,
  onError,
  ...props
}) => (
  <ErrorBoundary
    fallbackRender={({error, resetErrorBoundary}) =>
      isThatError(error)
        ? fallbackRender?.({error, resetErrorBoundary}) || fallback
        : undefined
    }
    onError={error => {
      if (isThatError(error)) onError?.(error)
      else throw error // to allow other parent error boundary to handle it
    }}
    {...props}
  />
)

// Please see https://github.com/bvaughn/react-error-boundary#api as a reference
// to props supported by ErrorBoundary
ThatErrorBoundary.propTypes = {
  fallback: PropTypes.node,
  fallbackRender: PropTypes.func,
  onError: PropTypes.func,
  isThatError: PropTypes.func.isRequired,
}
