import React from 'react'
import ReactPlaceholder from 'react-placeholder'
import { TextBlock, TextRow, RectShape } from 'react-placeholder/lib/placeholders'
import 'react-placeholder/lib/reactPlaceholder.css'
import { Card, CardBody } from '../../../_metronic/_partials/controls'

const placeholder = (
	<Card>
		<CardBody>
			<div id='tabs' className='m-7'>
				<TextRow showLoadingAnimation color='#CDCDCD' style={{ width: '100%', height: 50 }}/>
			</div>
			<div id='body' className='mx-7'>
				<RectShape showLoadingAnimation color='#CDCDCD' style={{ width: '100%', height:350 }}/>
			</div>
			<div id="bottom" className='m-7'>
				<TextBlock showLoadingAnimation color='#CDCDCD' rows={2} style={{ height: 50, width: 300 }}/>
			</div>
		</CardBody>
	</Card>
)

const ContentSkeleton = () => {
	return (
		<ReactPlaceholder showLoadingAnimation customPlaceholder={placeholder} />
	)
}

export default ContentSkeleton