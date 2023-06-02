import { authClient, API } from '../index'

export const postGame = (game) => {
  return authClient().post(`${API}/game`, game)
}

export const getGames = () => {
  return authClient().get(`${API}/game`)
}

export const getGameById = (id) => {
  return authClient().get(`${API}/game/${id}`)
}

export const getGameEnvironments = (id) => {
  return authClient().get(`${API}/game/${id}/environments`)
}

export const updateGame = (id, game) => {
  return authClient().put(`${API}/game/${id}`, game)
}



