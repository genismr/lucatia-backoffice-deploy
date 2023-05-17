import { authClient, API } from '../index'

export const postEntity = (entity, accessToken) => {
  return authClient(accessToken).post(`${API}/entity`, entity)
}

export const getEntities = (accessToken) => {
  return authClient(accessToken).get(`${API}/entity`)
}

export const getEntityById = (entityId, accessToken) => {
  return authClient(accessToken).get(`${API}/entity/${entityId}`)
}

export const updateEntity = async (id, entity, accessToken) => {
  return authClient(accessToken).put(`${API}/entity/${id}`, entity)
}

export const setEntityActive = async (id, accessToken) => {
	return authClient(accessToken).put(`${API}/entity/${id}/set-active`, {});
};

export const setEntityInactive = async (id, accessToken) => {
	return authClient(accessToken).put(`${API}/entity/${id}/set-inactive`, {});
};

export const deleteEntity = (id, accessToken) => {
  return authClient(accessToken).delete(`${API}/entity/${id}`)
}


