import {request} from '../lib/request'

export const readCats = () =>
  request('https://api.thecatapi.com/v1/images/search', {
    headers: {'x-api-key': '77502001-868b-440c-b09d-5e8647cd939a'},
  })
