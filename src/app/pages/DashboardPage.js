import React, { useEffect, useState } from 'react';
import { alertError } from '../../utils/logger';
import { useHistory } from 'react-router-dom';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import { countAdmins } from '../../api/user'

export function DashboardPage() {
	const [data, setData] = useState([]);
    const history = useHistory()

	useEffect(() => {
		/*async function fetchData() {
			try {
				const admins = await countAdmins()

				setData({
					numAdmins: admins.data
				})
			} catch (err) {
				alertError({ error: err, customMessage: 'Could not get statistics.'})
			}
		}
		fetchData()*/
	}, []);

	return (
		<>
			<div className='row justify-content-center'>
				<div className='col-12 col-md-4 text-center my-2' role='button' onClick={() => history.push('/admins')}>
					<div className='card'>
						<div className='card-body'>
							<h5 className='card-title'><AssignmentIndIcon/>  Administrators</h5>
							<div className='contentDash'>{data.numAdmins}</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
