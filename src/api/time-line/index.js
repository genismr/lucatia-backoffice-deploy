import { authClient, API } from '../index'

export const getTimeLines = () => {
  return authClient().get(`${API}/time-line`)
}

export const postTimeLine = (timeLine) => {
  return authClient().post(`${API}/time-line`, timeLine)
}

