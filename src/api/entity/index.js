import { authClient, API } from '../index'

export const postEntity = (entity) => {
  return authClient().post(`${API}/entity`, entity)
}

export const getEntities = (accessToken) => {
  return authClient().get(`${API}/entity?accessToken=${accessToken}`)
}

export const getEntityById = (entityId) => {
  return authClient().get(`${API}/entity/${entityId}`)
}

export const updateEntity = async (id, entity) => {
  console.log(entity)
  return authClient().put(`${API}/entity/${id}`, entity)
}

export const setEntityActive = async (id) => {
	return authClient().put(`${API}/entity/${id}/set-active`, {});
};

export const setEntityInactive = async (id) => {
	return authClient().put(`${API}/entity/${id}/set-inactive`, {});
};

export const deleteEntity = (id) => {
  return authClient().delete(`${API}/entity/${id}`)
}


