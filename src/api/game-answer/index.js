import { authClient, API } from '../index'

export const postGameAnswer = (gameAnswer) => {
  return authClient().post(`${API}/game-answer`, gameAnswer)
}

export const getGameAnswerById = (id) => {
  return authClient().get(`${API}/game-answer/${id}`)
}

export const updateGameAnswer = (id, gameAnswer) => {
  return authClient().put(`${API}/game-answer/${id}`, gameAnswer)
}