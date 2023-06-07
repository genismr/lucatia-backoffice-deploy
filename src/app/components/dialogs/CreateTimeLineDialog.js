import React, { useState, useEffect } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@material-ui/core";
import { postTimeLine } from "../../../api/time-line";
import { alertError, alertSuccess } from "../../../utils/logger";

function getEmptyTimeLine() {
	return {
		indice: "0",
		tiempo: "0",
	};
}

const CreateTimeLineDialog = (props) => {
	const {
		title,
		open,
		setOpen,
		onCreate,
	} = props;

	const [timeLine, setTimeLine] = useState(getEmptyTimeLine());

	const handleChange = (element) => (event) => {
		let text = event.target.value;
		setTimeLine({ ...timeLine, [element]: text });
	};

	function saveTimeLine() {
		postTimeLine(timeLine)
			.then((res) => {
				if (res.status === 201) {
					let newTimeLine = res.data;
					onCreate(newTimeLine);
					alertSuccess({
						title: "Saved!",
						customMessage: "Time line successfully created.",
					});
					setTimeLine(getEmptyTimeLine());
					setOpen(false);
				}
			})
			.catch((error) => {
				alertError({
					error: null,
					customMessage: "Could not save time line.",
				});
			});
	}

	function renderTimeLineFields() {
		return (
			<div className="row">
				<div className="col-6 gx-3">
					<TextField
						id={`index`}
						label="Índice"
						value={timeLine.indice}
						onChange={handleChange("indice")}
						InputLabelProps={{
							shrink: true,
						}}
						InputProps={{
							inputProps: {
								min: 0,
							},
						}}
						margin="normal"
						variant="outlined"
						type="number"
						required
					/>
				</div>
				<div className="col-6 gx-3">
					<TextField
						id={`time`}
						label="Tiempo (s)"
						value={timeLine.tiempo}
						onChange={handleChange("tiempo")}
						InputLabelProps={{
							shrink: true,
						}}
						InputProps={{
							inputProps: {
								min: 0,
							},
						}}
						margin="normal"
						variant="outlined"
						type="number"
						required
					/>
				</div>
			</div>
		);
	}

	return (
		<Dialog open={open} onClose={() => {}} aria-labelledby="confirm-dialog">
			<DialogTitle id="confirm-dialog">{title}</DialogTitle>
			<DialogContent>
				{renderTimeLineFields()}
				<br />
				<br />
				<div className="d-flex justify-content-end">
					<Button
						onClick={() => {
							setTimeLine(getEmptyTimeLine());
							setOpen(false);
						}}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Cancel
					</Button>
					<Button
						onClick={() => {
							saveTimeLine();
						}}
						variant="outlined"
						color="primary"
					>
						Save
					</Button>
				</div>
			</DialogContent>
			<DialogActions></DialogActions>
		</Dialog>
	);
};
export default CreateTimeLineDialog;
