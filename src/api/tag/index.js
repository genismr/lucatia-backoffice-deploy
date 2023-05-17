import { authClient, API } from '../index'

export const postTag = (tag) => {
  return authClient().post(`${API}/tag`, tag)
}

