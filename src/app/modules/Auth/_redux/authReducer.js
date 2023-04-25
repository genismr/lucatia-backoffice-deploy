import { userConstants, languageConstants } from './authActions'

const initialState = { loggedIn: false, user: null, languages: null }

export function authentication (state = initialState, action) {
	switch (action.type){
	case userConstants.LOGIN_SUCCESS:
		return {
			...state,
			loggedIn: true,
			user: action.user
		}
	case userConstants.LOGIN_FAILURE:
		return { loggedIn: false }
	case userConstants.LOGOUT:
		return { loggedIn: false }
	case languageConstants.LANGUAGES_SUCCESS:
		return {
			...state,
			languages: action.languages
		}
	default:
		return state
	}
}