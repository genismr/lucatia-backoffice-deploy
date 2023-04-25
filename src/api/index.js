import axios from 'axios'

export const baseClient = () => {
  return axios.create()
}

export const authClient = () => {
  return axios.create({
    headers: {"Access-Control-Allow-Origin": "*"},
    'Access-Control-Allow-Credentials': true,
  })
}

const PRO = (process.env.NODE_ENV ===  'production' || process.env.NODE_ENV === 'pro')

export const API = PRO
  ? 'https://lucatiaapi.azurewebsites.net/api'
  : 'https://localhost:7285/api'

export const SERVER_URL = /*PRO
  ? ''
  : */'https://localhost:7285'