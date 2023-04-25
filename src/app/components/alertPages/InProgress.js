import React from 'react'
import { Alert } from 'react-bootstrap'
import { Card, CardBody } from '../../../_metronic/_partials/controls'
import { Warning } from '@material-ui/icons'

function InProgress() {
	return (
		<Card>
			<CardBody>
				<Alert variant='warning' style={{ backgroundColor: '#ffa80029', borderStyle: 'dashed', padding: '60px 0', color: 'black', textAlign: 'center', textTransform: 'capitalize', fontWeight: 'bolder', fontSize: 'larger'  }}>
					<Warning /> This page is under construction !!!
				</Alert>
			</CardBody>
		</Card>
	)
}

export default InProgress
