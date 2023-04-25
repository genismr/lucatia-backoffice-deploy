import { authClient, API } from '../index'

//Get roles
export const getRoles = () => {
  return authClient().get(`${API}/role`)
}


