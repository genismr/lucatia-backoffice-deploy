import { authClient, API } from '../index'

export const postGameSession = (gameSessions) => {
  return authClient().post(`${API}/game-session`, gameSessions)
}

export const deleteGameSession = (id) => {
  return authClient().delete(`${API}/game-session/${id}`)
}

