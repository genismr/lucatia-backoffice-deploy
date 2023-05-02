import { authClient, API } from '../index'

//Get users according to the token
export const getUsers = (accessToken) => {
  return authClient().get(`${API}/user?accessToken=${accessToken}`)
}

// Get user by id
export const getUserById = (id) => {
  return authClient().get(`${API}/user/${id}`)
}

// Delete user
export const deleteUser = (id) => {
  return authClient().delete(`${API}/user/${id}`)
}

// Create user
export const postUser = async (user) => {
  return authClient().post(`${API}/user`, user)
}

// Update user
export const updateUser = async (id, user) => {
  return authClient().put(`${API}/user/${id}`, user)
}

export const setUserActive = async (id) => {
	return authClient().put(`${API}/user/${id}/set-active`, {});
};

export const setUserInactive = async (id) => {
	return authClient().put(`${API}/user/${id}/set-inactive`, {});
};


// Count all admins
export const countAdmins = () => {
  const role = "admin"
	return authClient().get(`${API}/user/count/${role}`)
}

export const assignOwnerEntity = async (userId, ownerEntities) => {
  return authClient().post(`${API}/user/${userId}/assign-owner-entities`, ownerEntities)
}

export const unassignOwnerEntity = async (userId, entities) => {
  return authClient().post(`${API}/user/${userId}/unassign-owner-entities`, entities)
}

export const assignManagedEntity = async (userId, managedEntities) => {
  return authClient().post(`${API}/user/${userId}/assign-managed-entities`, managedEntities)
}

export const unassignManagedEntity = async (userId, entities) => {
  return authClient().post(`${API}/user/${userId}/unassign-managed-entities`, entities)
}



