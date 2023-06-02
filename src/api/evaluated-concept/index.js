import { authClient, API } from '../index'

export const getEvaluatedConcepts = () => {
  return authClient().get(`${API}/evaluated-concept`)
}