import React, { createContext, useContext, useState, useEffect } from 'react'

const MetronicSplashScreenContext = createContext()

export function MetronicSplashScreenProvider({ children }) {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const splashScreen = document.getElementById('splash-screen')

		// Show SplashScreen
		if (splashScreen && visible) {
			splashScreen.classList.remove('hidden')

			return () => {
				splashScreen.classList.add('hidden')
			}
		}

		// Hide SplashScreen
		let timeout
		if (splashScreen && !visible)
			timeout = setTimeout(() => {
				splashScreen.classList.add('hidden')
			}, 3000)


		return () => {
			clearTimeout(timeout)
		}
	}, [visible])

	return (
		<MetronicSplashScreenContext.Provider value={setVisible}>
			{children}
		</MetronicSplashScreenContext.Provider>
	)
}

export function LayoutSplashScreen({ visible = true }) {
	// Everything are ready - remove splashscreen
	const setVisible = useContext(MetronicSplashScreenContext)

	useEffect(() => {
		if (!visible)
			return


		setVisible(prev => {
			return !prev
		})

		return () => {
			setVisible(prev => {
				return !prev
			})
		}
	}, [setVisible, visible])

	return null
}
