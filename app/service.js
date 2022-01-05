import {request} from '../lib/request'

export const readGifs = ({q, offset = 0, limit = 5}) =>
  request(
    `http://api.giphy.com/v1/gifs/search?api_key=pToF9vgGtxRuCD192XkxmfWlB0CelCQb&q=${q}&offset=${offset}&limit=${limit}`
  )
