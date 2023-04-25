import React from 'react'
import { useSubheader } from '../../_metronic/layout'

export const Content = () => {
	const suhbeader = useSubheader()
	suhbeader.setTitle('My Custom Content page')

	return (<>My Content Page</>)
}

