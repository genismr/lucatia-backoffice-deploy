import { authClient, API } from '../index'

//Post asset
export const postApp = (app, accessToken) => {
  delete app.id
  return authClient(accessToken).post(`${API}/app`, app)
}

export const assignEntities = (id, body, accessToken) => {
  return authClient(accessToken).post(`${API}/app/${id}/assign-entities`, body)
}

export const unassignEntities = (id, body, accessToken) => {
  return authClient(accessToken).post(`${API}/app/${id}/unassign-entities`, body)
}

export const getApps = (accessToken) => {
  return authClient(accessToken).get(`${API}/app`)
}

export const getMetadata = (accessToken) => {
  return authClient(accessToken).get(`${API}/app/metadata`)
}

export const getAppMetadata = (id, accessToken) => {
  return authClient(accessToken).get(`${API}/app/${id}/metadata`)
}

export const getAppById = (id, accessToken) => {
  return authClient(accessToken).get(`${API}/app/${id}`)
}

export const changeEntityOwnership = (id, body, accessToken) => {
  return authClient(accessToken).put(`${API}/app/${id}/toggle-entity-ownership`, body)
}

export const updateApp = (id, app, accessToken) => {
  return authClient(accessToken).put(`${API}/app/${id}`, app)
}

export const setAppActive = async (id, accessToken) => {
	return authClient(accessToken).put(`${API}/app/${id}/set-active`, {});
};

export const setAppInactive = async (id, accessToken) => {
	return authClient(accessToken).put(`${API}/app/${id}/set-inactive`, {});
};

export const deleteApp = (id, accessToken) => {
  return authClient(accessToken).delete(`${API}/app/${id}`)
}

