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
  delete user.entitiesManaged;
  return authClient().post(`${API}/user`, user)
}

// Update user
export const updateUser = async (id, user) => {
  return authClient().put(`${API}/user/${id}`, user)
}

// Count all admins
export const countAdmins = () => {
  const role = "admin"
	return authClient().get(`${API}/user/count/${role}`)
}

// Get owner entity by userId and entityId
export const getOwnerEntity = (userId, entityId) => {
  return authClient().get(`${API}/userOwnerEntity/user/${userId}/entity/${entityId}`)
}

export const assignOwnerEntity = async (userId, ownerEntities) => {
  return authClient().post(`${API}/user/${userId}/assignOwnerEntities`, ownerEntities)
}

export const unassignOwnerEntity = async (userId, entities) => {
  return authClient().post(`${API}/user/${userId}/unassignOwnerEntities`, entities)
}



