import { authClient, API } from '../index'

export const postGameQuestion = (gameQuestion) => {
  return authClient().post(`${API}/game-question`, gameQuestion)
}

export const getGameQuestionById = (id) => {
  return authClient().get(`${API}/game-question/${id}`)
}

export const getGameQuestionAnswers = (id) => {
  return authClient().get(`${API}/game-question/${id}/answers`)
}

export const updateGameQuestion = (id, gameQuestion) => {
  return authClient().put(`${API}/game-question/${id}`, gameQuestion)
}