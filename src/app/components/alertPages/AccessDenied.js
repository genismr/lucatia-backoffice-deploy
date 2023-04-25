import React from 'react'
import { Card, CardBody } from '../../../_metronic/_partials/controls'
import { Warning } from '@material-ui/icons'

function AccessDenied() {
	return (
		<Card>
			<CardBody>
				<div class="alert alert-danger" role="alert" style={{ borderStyle: 'dashed', padding: '60px 0', textAlign: 'center', textTransform: 'capitalize', fontWeight: 'bolder', fontSize: 'larger' }}>
					<h3><Warning /> Unauthorized Access</h3>
					 Higher permission required to access this page !!!
				</div>
			</CardBody>
		</Card>
	)
}

export default AccessDenied
