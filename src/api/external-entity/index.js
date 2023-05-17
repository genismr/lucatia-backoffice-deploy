import { authClient, API } from '../index'

export const postExternalEntity = (externalEntity, accessToken) => {
  return authClient(accessToken).post(`${API}/external-entity`, externalEntity)
}

export const getExternalEntities = (accessToken) => {
  return authClient(accessToken).get(`${API}/external-entity`)
}

export const getExternalEntityById = (id, accessToken) => {
  return authClient(accessToken).get(`${API}/external-entity/${id}`)
}

export const updateExternalEntity = async (id, externalEntity, accessToken) => {
  return authClient(accessToken).put(`${API}/external-entity/${id}`, externalEntity)
}


