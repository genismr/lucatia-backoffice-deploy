import { authClient, API } from '../index'

// Count all texts
export const countTexts = () => {
  return authClient().get(`${API}/text/count`)
}

// Get all texts
export const getTexts = () => {
  return authClient().get(`${API}/text`)
}

// Get text by id
export const getTextById = (id) => {
  return authClient().get(`${API}/text/${id}`)
}

// Update text
export const updateText = (id, text) => {
  return authClient().put(`${API}/text/${id}`, text)
}

// Create text
export const postText = (text) => {
  return authClient().post(`${API}/text`, text)
}

// Delete text
export const deleteText = (id) => {
  return authClient().delete(`${API}/text/${id}`)
}