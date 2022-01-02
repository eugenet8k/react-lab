import {request, fetchJSON} from './request'

describe(__filename, () => {
  let fetchMock

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(fetchMock)
  })

  afterEach(() => {
    delete global.fetch
  })

  describe('request', () => {
    describe('ok', () => {
      let result
      let onBeforeFetch
      let onAfterFetch
      let defaultHeaders

      beforeAll(() => {
        fetchMock = jest.fn(() =>
          Promise.resolve({
            ok: true,
            headers: {get: () => 'application/json'},
            json: () => Promise.resolve({isGoat: true}),
          })
        )
      })

      beforeEach(async () => {
        onBeforeFetch = jest.fn()
        onAfterFetch = jest.fn()
        result = await request('/api/public/v1/goat-status', {
          headers: {TOKEN: 'bleat'},
          ...(defaultHeaders && {defaultHeaders}),
          wat: '?',
          onBeforeFetch,
          onAfterFetch,
        })
      })

      it('should fetch with headers and options', () => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/public/v1/goat-status',
          {
            headers: new global.Headers({
              'Content-Type': 'application/json',
              Accept: 'application/json',
              TOKEN: 'bleat',
            }),
            wat: '?',
          }
        )
      })

      it('should parse the JSON response', () => {
        expect(result).toEqual({isGoat: true})
      })

      it('should call onBeforeFetch', () => {
        expect(onBeforeFetch).toHaveBeenCalledWith(
          '/api/public/v1/goat-status',
          {
            headers: {TOKEN: 'bleat'},
            wat: '?',
          }
        )
      })

      it('should call onAfterFetch', () => {
        expect(onAfterFetch).toHaveBeenCalledWith(
          '/api/public/v1/goat-status',
          {
            headers: {TOKEN: 'bleat'},
            wat: '?',
          }
        )
      })

      describe('when default headers are changed', () => {
        beforeAll(() => (defaultHeaders = {}))
        afterAll(() => (defaultHeaders = undefined))

        it('should fetch with updated headers and options', () => {
          expect(global.fetch).toHaveBeenCalledWith(
            '/api/public/v1/goat-status',
            {
              headers: new global.Headers({
                TOKEN: 'bleat',
              }),
              wat: '?',
            }
          )
        })
      })
    })

    describe('no content', () => {
      let result

      beforeAll(() => {
        fetchMock = jest.fn(() =>
          Promise.resolve({
            ok: true,
            headers: {get: () => 'application/json'},
            status: 204,
          })
        )
      })

      beforeEach(async () => (result = await request('/goat-status')))

      // eslint-disable-next-line jest/no-identical-title
      it('should parse the JSON response', () => {
        expect(result).toEqual({})
      })
    })

    describe('no response', () => {
      let error
      let onError

      beforeAll(() => {
        fetchMock = jest.fn(() => Promise.resolve(undefined))
      })

      beforeEach(async () => {
        error = undefined
        onError = jest.fn()
        try {
          await request('/goat-status', {onError})
        } catch (e) {
          error = e
        }
      })

      it('should throw an error with the status text, response and body', () => {
        expect(error.message).toEqual(
          'Request to server failed with "There is no response!"'
        )
        expect(error.response).toMatchObject({ok: false, status: 0})
        expect(error.body).toEqual({})
      })
    })

    describe('not ok', () => {
      let error
      let onError
      let contentType
      let json
      let text

      beforeAll(() => {
        fetchMock = jest.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            headers: {get: () => contentType},
            json: json || (() => Promise.resolve({isGoat: false})),
            text: text || (() => Promise.resolve('oh well, again')),
          })
        )
      })

      beforeEach(async () => {
        error = undefined
        onError = jest.fn()
        try {
          await request('/api/public/v1/goat-status', {onError})
        } catch (e) {
          error = e
        }
      })

      const expectThrowError = ({body}) =>
        it('should throw an error with the status text, response and body', () => {
          expect(error.message).toEqual(
            'Request to server failed with "Internal Server Error"'
          )
          expect(error.response).toMatchObject({ok: false, status: 500})
          expect(error.body).toEqual(body)
        })

      const expectOnError = ({body}) =>
        it('should pass error to onError', () => {
          const [[errorObj]] = onError.mock.calls
          expect(errorObj.message).toEqual(
            'Request to server failed with "Internal Server Error"'
          )
          expect(errorObj.response).toMatchObject({ok: false, status: 500})
          expect(errorObj.body).toEqual(body)
        })

      describe('when response has application/json content type', () => {
        beforeAll(() => (contentType = 'application/json'))

        expectThrowError({body: {isGoat: false}})

        expectOnError({body: {isGoat: false}})

        describe('when there was an error resolving JSON', () => {
          beforeAll(
            () =>
              (json = () => {
                throw new Error('Something weird')
              })
          )
          afterAll(() => (json = undefined))

          expectThrowError({body: {}})

          expectOnError({body: {}})
        })
      })

      describe('when response has text/html content type', () => {
        beforeAll(() => (contentType = 'text/html'))

        expectThrowError({body: 'oh well, again'})

        expectOnError({body: 'oh well, again'})

        describe('when there was an error resolving JSON', () => {
          beforeAll(
            () =>
              (text = () => {
                throw new Error('Something weird')
              })
          )
          afterAll(() => (text = undefined))

          expectThrowError({body: ''})

          expectOnError({body: ''})
        })
      })

      describe('when response has an unsupported content type', () => {
        beforeAll(() => (contentType = 'image/jpeg'))

        expectThrowError({body: {}})

        expectOnError({body: {}})
      })
    })

    describe('throws', () => {
      let error

      beforeEach(async () => {
        error = undefined
        try {
          await request('/api/public/v1/goat-status')
        } catch (e) {
          error = e
        }
      })

      describe('network or abort error', () => {
        beforeAll(() => {
          fetchMock = jest.fn(() => {
            throw new TypeError('network is offline')
          })
        })

        it('should rethrow an error with the status 0', () => {
          expect(error.message).toEqual('network is offline')
          expect(error.response).toMatchObject({status: 0})
        })
      })

      describe('generic error', () => {
        beforeAll(() => {
          fetchMock = jest.fn(() => {
            throw new TypeError('division by zero')
          })
        })

        it('should rethrow an error without any additions', () => {
          expect(error.message).toEqual('division by zero')
          expect(error.response).toBeUndefined()
        })
      })
    })
  })

  describe('fetchJSON', () => {
    let result

    beforeAll(() => {
      fetchMock = jest.fn(() => Promise.resolve({test: true}))
    })

    beforeEach(async () => {
      result = await fetchJSON('/api/test')
    })

    it('should fetch with headers and options', () => {
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        headers: new global.Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      })
    })

    it('should return the response', () => {
      expect(result).toEqual({test: true})
    })
  })
})
