import { authClient, API } from '../index'

export const updateSession = (sessionId, gameSession) => {
  return authClient().put(`${API}/game-session/${sessionId}`, gameSession)
}

