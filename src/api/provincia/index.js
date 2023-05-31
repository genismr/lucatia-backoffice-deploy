import { authClient, API } from '../index'

export const getProvincias = () => {
  return authClient().get(`${API}/provincia`)
}

