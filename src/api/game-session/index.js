import { authClient, API } from '../index'

export const postGameSession = (gameSessions) => {
  return authClient().post(`${API}/game-session`, gameSessions)
}

