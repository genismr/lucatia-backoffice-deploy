import React from 'react'
import { CircularProgress } from '@material-ui/core'
import { toAbsoluteUrl } from '../../_helpers'

/* TO DO --> Cambiar logo */

export function SplashScreen() {
	return (
		<>
			<div className="splash-screen">
				<img
					src={toAbsoluteUrl('/media/logo/logo.png')}
					alt="logo"
				/>
				<CircularProgress className="splash-screen-spinner" />
			</div>
		</>
	)
}
