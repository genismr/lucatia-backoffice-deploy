import React from 'react'
import { Card, CardBody } from '../../_metronic/_partials/controls'

function Unauthorized() {
	//console.log('%c[Unauthorized] rendered', '🧠;background: lightpink; color: #444; padding: 3px; border-radius: 5px;')

	return (
		<Card>
			<CardBody>
				<div class="container py-5">
					<div class="row">
						<div class="col-md-2 text-center">
							<p><i class="fa fa-exclamation-triangle fa-5x"></i><br/>Status Code: 403</p>
						</div>
						<div class="col-md-10">
							<h3>OPPSSS!!!! Sorry...</h3>
							<p>Sorry, your access is refused due to security reasons of our server and also our sensitive data.<br/>Please go back to the previous page to continue browsing.</p>
							<button class="btn btn-danger" onClick={() => window.history.back()}>Go Back</button>
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	)
}

export default Unauthorized
