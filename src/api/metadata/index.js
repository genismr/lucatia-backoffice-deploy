import { authClient, API } from '../index'

export const getMetadata = (accessToken) => {
  return authClient(accessToken).get(`${API}/metadata`)
}

