
export const authActions = {
	loginActionSuccess,
	loginActionFailure,
	logoutAction,
	getLanguagesSuccess
}

// LOGIN

export const userConstants = {
	LOGIN_FAILURE: 'login-failure',
	LOGIN_SUCCESS: 'login-success',
	LOGOUT: 'logout'
}

export const languageConstants = {
	LANGUAGES_SUCCESS: 'languages-success'
}

function loginActionFailure ()  {
	return {
		type: userConstants.LOGIN_FAILURE
	}
}
function loginActionSuccess (user)  {
	console.log('login action success: ', userConstants.LOGIN_SUCCESS)
	return {
		type: userConstants.LOGIN_SUCCESS,
		user
	}
}

// LOGOUT

function logoutAction ()  {
	console.log('logout action: ', userConstants.LOGOUT)
	return {
		type: userConstants.LOGOUT
	}
}

function getLanguagesSuccess (languages) {
	return {
		type: languageConstants.LANGUAGES_SUCCESS,
		languages
	}
}