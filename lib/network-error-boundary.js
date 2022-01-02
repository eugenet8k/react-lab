import {ThatErrorBoundary} from './that-error-boundary'
import {isNetworkError} from './error-check'

const NetworkErrorBoundary = props => (
  <ThatErrorBoundary isThatError={isNetworkError} {...props} />
)

export default NetworkErrorBoundary
