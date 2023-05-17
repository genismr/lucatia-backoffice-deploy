import { API, authClient } from '../index'

export const login = (email, password) => {
  var bodyFormData = new FormData();
  bodyFormData.append('email', email);
  bodyFormData.append('password', password);
  bodyFormData.append('app', "-1");
  return authClient().post(`${API}/login`, bodyFormData)
}

export const register = (body) => {
  return authClient().post(`${API}/user/signup`, body)
}

export const logout = () => {
  return authClient().get(`${API}/user/logout`)
}

export const getCredentials = () => {
  return authClient().get(`${API}/user/credentials`)
}

/*
export const refreshTokens = () => {
  return authClient().get(`${API}/user/refresh`)
}*/

export const refreshTokens = (accessToken) => {
  return authClient().get(`${API}/login/refresh-tokens/${accessToken}`)
}

export const forgotPassword = (credentials) => {
  return authClient().post(`${API}/user/forgot-password-admin`, credentials)
}

export const resetPassword = ({ password, id }) => {
	const body = { password }
  return authClient().put(`${API}/user/forgot-password/${id}`, body)
}