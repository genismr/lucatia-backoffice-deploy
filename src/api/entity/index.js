import { authClient, API } from '../index'

export const postEntity = (entity) => {
  delete entity.id
  return authClient().post(`${API}/entity`, entity)
}

//Get entities
export const getEntities = (accessToken) => {
  console.log(accessToken)
  return authClient().get(`${API}/entity?accessToken=${accessToken}`)
}

//Get entity
export const getEntityById = (entityId) => {
  return authClient().get(`${API}/entity/${entityId}`)
}

export const updateEntity = async (id, entity) => {
  return authClient().put(`${API}/entity/${id}`, entity)
}

export const deleteEntity = (id) => {
  return authClient().delete(`${API}/entity/${id}`)
}


