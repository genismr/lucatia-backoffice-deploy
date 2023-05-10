import { authClient, API } from '../index'

//Post asset
export const postApp = (app) => {
  delete app.id
  return authClient().post(`${API}/app`, app)
}

export const assignEntities = (id, body) => {
  return authClient().post(`${API}/app/${id}/assign-entities`, body)
}

export const unassignEntities = (id, body) => {
  return authClient().post(`${API}/app/${id}/unassign-entities`, body)
}

export const getApps = (accessToken) => {
  return authClient().get(`${API}/app?accessToken=${accessToken}`)
}

export const getAppMetadata = (id) => {
  return authClient().get(`${API}/app/${id}/metadata`)
}

export const getAppById = (id) => {
  return authClient().get(`${API}/app/${id}`)
}

export const changeEntityOwnership = (id, body) => {
  return authClient().put(`${API}/app/${id}/toggle-entity-ownership`, body)
}

export const updateApp = (id, app) => {
  return authClient().put(`${API}/app/${id}`, app)
}

export const setAppActive = async (id) => {
	return authClient().put(`${API}/app/${id}/set-active`, {});
};

export const setAppInactive = async (id) => {
	return authClient().put(`${API}/app/${id}/set-inactive`, {});
};

export const deleteApp = (id) => {
  return authClient().delete(`${API}/app/${id}`)
}

