import React, { useEffect } from 'react'

import {logout} from "../../../../api/auth/index"

import {authActions} from '../../Auth/_redux/authActions'
import {useDispatch} from 'react-redux'


// import { LayoutSplashScreen } from '../../../../_metronic/layout'


function Logout() {
	//console.log('%c[Logout] rendered', '🧠;background: lightpink; color: #444; padding: 3px; border-radius: 5px;')
	// Needs to clean cookies so user doesn't "auto-get credentials"
	// Redirect to login page (automatically when dispatching logoutAction --> sets isLogged to false)

	const dispatch = useDispatch()

	useEffect(() => {
		async function clearCookies() {
			await logout()
		}
		clearCookies()
		dispatch(authActions.logoutAction())
	}, [dispatch])

	// return <LayoutSplashScreen />
	return <>Logout page</>
}

export default Logout
