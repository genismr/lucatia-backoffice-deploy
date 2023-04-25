import { combineReducers } from 'redux'
import { userConstants } from '../app/modules/Auth/_redux/authActions'

import { authentication } from '../app/modules/Auth/_redux/authReducer'

const appReducer = combineReducers({
	authentication
})

export const rootReducer = (state, action) => {
	// If logout action is dispatched, we dispatch undefined state so it takes initialStateValue (reset storage)
	if (action.type === userConstants.LOGOUT)
	// storage.removeItem('persist:root')
		return appReducer (undefined, action)

	return appReducer(state, action)
}

export function* rootSaga() {
	// yield all([auth.saga()]);
}
