import { authClient, API } from '../index'

// Get all languages
export const getLanguages = () => {
  return authClient().get(`${API}/language`)
}

// Get language by id
export const getLanguageById = (id) => {
  return authClient().get(`${API}/language/${id}`)
}

// Delete language
export const deleteLanguage = (id) => {
  return authClient().delete(`${API}/language/${id}`)
}

// Create language
export const postLanguage = (language) => {
  return authClient().post(`${API}/language`, language)
}

// Update language
export const updateLanguage = (id, language) => {
  return authClient().put(`${API}/language/${id}`, language)
}
