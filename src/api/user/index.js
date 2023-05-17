import { authClient, API } from '../index'

//Get users according to the token
export const getUsers = (accessToken) => {
  return authClient(accessToken).get(`${API}/user`)
}

// Get user by id
export const getUserById = (id, accessToken) => {
  return authClient(accessToken).get(`${API}/user/${id}`)
}

// Delete user
export const deleteUser = (id) => {
  return authClient().delete(`${API}/user/${id}`)
}

// Create user
export const postUser = async (user, accessToken) => {
  return authClient(accessToken).post(`${API}/user`, user)
}

export const postUserAppMetadata = async (id, metadata, accessToken) => {
  return authClient(accessToken).post(`${API}/user/${id}/app-metadata`, metadata)
}

export const updateUserAppMetadata = async (id, metadata, accessToken) => {
  return authClient(accessToken).put(`${API}/user/${id}/app-metadata`, metadata)
}

// Update user
export const updateUser = async (id, user, accessToken) => {
  return authClient(accessToken).put(`${API}/user/${id}`, user)
}

export const setUserActive = async (id, accessToken) => {
	return authClient(accessToken).put(`${API}/user/${id}/set-active`, {});
};

export const setUserInactive = async (id, accessToken) => {
	return authClient(accessToken).put(`${API}/user/${id}/set-inactive`);
};

export const countAdmins = () => {
  const role = "admin"
	return authClient().get(`${API}/user/count/${role}`)
}

export const assignOwnerEntity = async (userId, ownerEntities, accessToken) => {
  return authClient(accessToken).post(`${API}/user/${userId}/assign-owner-entities`, ownerEntities)
}

export const unassignOwnerEntity = async (userId, entities, accessToken) => {
  return authClient(accessToken).post(`${API}/user/${userId}/unassign-owner-entities`, entities)
}

export const assignManagedEntity = async (userId, managedEntities, accessToken) => {
  return authClient(accessToken).post(`${API}/user/${userId}/assign-managed-entities`, managedEntities)
}

export const unassignManagedEntity = async (userId, entities, accessToken) => {
  return authClient(accessToken).post(`${API}/user/${userId}/unassign-managed-entities`, entities)
}

export const assignUserApp = async (userId, apps, accessToken) => {
  console.log('post user app', apps)
  return authClient(accessToken).post(`${API}/user/${userId}/assign-apps`, apps)
}

export const unassignUserApp = async (userId, apps, accessToken) => {
  return authClient(accessToken).post(`${API}/user/${userId}/unassign-apps`, apps)
}





