import { authClient, API } from '../index'

//Post asset
export const postApp = (app) => {
  delete app.id
  return authClient().post(`${API}/app`, app)
}

export const assignEntities = (id, body) => {
  console.log('assign')
  console.log(body)
  return authClient().post(`${API}/app/${id}/assignEntities`, body)
}

export const unassignEntities = (id, body) => {
  console.log('unassign')
  console.log(body)
  return authClient().post(`${API}/app/${id}/unassignEntities`, body)
}

export const getApps = (accessToken) => {
  return authClient().get(`${API}/app?accessToken=${accessToken}`)
}

export const getAppById = (id) => {
  return authClient().get(`${API}/app/${id}`)
}

export const changeEntityOwnership = (id, body) => {
  console.log('change')
  console.log(body)
  return authClient().put(`${API}/app/${id}/changeEntityOwnership`, body)
}

export const updateApp = (id, app) => {
  return authClient().put(`${API}/app/${id}`, app)
}

// Delete user
export const deleteApp = (id) => {
  return authClient().delete(`${API}/app/${id}`)
}

