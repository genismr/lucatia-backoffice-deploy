import { authClient, API } from "../index";

export const postGameActivity = (gameActivity) => {
	return authClient().post(`${API}/game-activity`, gameActivity);
};

export const getGameActivityById = (id) => {
	return authClient().get(`${API}/game-activity/${id}`);
};

export const getGameActivityQuestions = (id) => {
	return authClient().get(`${API}/game-activity/${id}/questions`);
};

export const updateGameActivity = (id, gameActivity) => {
	return authClient().put(`${API}/game-activity/${id}`, gameActivity);
};

export const deleteGameActivity = (id) => {
	return authClient().delete(`${API}/game-activity/${id}`);
};
