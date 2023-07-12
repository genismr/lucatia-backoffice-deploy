import { authClient, API } from "../index";

export const postGameEnvironment = (gameEnvironment) => {
	console.log("gameenv", gameEnvironment);
	return authClient().post(`${API}/game-environment`, gameEnvironment);
};

export const getGameEnvironmentById = (id) => {
	return authClient().get(`${API}/game-environment/${id}`);
};

export const getGameEnvironmentActivities = (id) => {
	return authClient().get(`${API}/game-environment/${id}/activities`);
};

export const updateGameEnvironment = (id, gameEnvironment) => {
	console.log("save", gameEnvironment);
	return authClient().put(`${API}/game-environment/${id}`, gameEnvironment);
};

export const deleteGameEnvironment = (id) => {
	return authClient().delete(`${API}/game-environment/${id}`);
};
