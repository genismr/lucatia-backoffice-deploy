import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'

const ConfirmDialog = (props) => {
	const { title, children, open, setOpen, onConfirm } = props
	return (
		<Dialog
			open={open}
			onClose={() => setOpen(false)}
			aria-labelledby="confirm-dialog">
			<DialogTitle id="confirm-dialog">{title}</DialogTitle>
			<DialogContent>{children}</DialogContent>
			<DialogActions>
				<Button
					variant="outlined"
					color="primary"
					onClick={() => {
						setOpen(false)
						onConfirm()
					}}
				>
					Yes
				</Button>
				<Button
					variant="outlined"
					color="secondary"
					onClick={() => {
						setOpen(false)
					}}
				>
					No
				</Button>
			</DialogActions>
		</Dialog>
	)
}
export default ConfirmDialog
