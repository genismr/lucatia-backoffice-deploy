import React, { useEffect, useState } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Tooltip,
	MuiThemeProvider,
	createMuiTheme,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	TextField,
	Chip,
} from "@material-ui/core";
import Table, {
	buttonsStyle,
	dateFormatter,
	substringFormatter,
} from "../tables/table";
import {
	Card,
	CardBody,
	CardHeader,
	CardHeaderToolbar,
} from "../../../_metronic/_partials/controls";
import { alertError, alertSuccess } from "../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "./ConfirmDialog";
import { AddBox } from "@material-ui/icons";
import { assignGameToUser } from "../../../api/user";

function getData(games) {
	let data = [];
	for (let i = 0; i < games.length; ++i) {
		const elem = {};

		elem.nombre = games[i].nombre;
		elem.descripcion = games[i].descripcion ? games[i].descripcion : "---";
		elem.id = games[i].id;

		data = data.concat(elem);
	}

	return data;
}
const GameTableDialog = (props) => {
	const { title, open, setOpen, data, patientId, onCreate } = props;
	const [selectedGame, setSelectedGame] = useState(null);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);

	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	function buttonFormatter(cell) {
		const elem = data.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title="Assign">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							setOpenConfirmDialog(true);
							setSelectedGame(elem);
						}}
					>
						<AddBox />
					</Button>
				</Tooltip>
			</>
		);
	}

	const columns = [
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{
			dataField: "descripcion",
			text: "Descripcion",
			sort: true,
		},
		{
			dataField: "id",
			text: "",
			formatter: buttonFormatter,
		},
	];

	function assignGame() {
		const saveGameSession = {};
		saveGameSession.juego_id = selectedGame.id;

		assignGameToUser(patientId, saveGameSession, loggedUser.accessToken)
			.then((res) => {
				if (res.status === 201) {
					onCreate(res.data);
					setSelectedGame(null);
					alertSuccess({
						title: "Saved!",
						customMessage: "Session successfully created.",
					});
					setOpen(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not save sessions.",
				});
			});
	}

	return (
		<>
			<Dialog
				fullWidth={true}
				maxWidth="xl"
				open={open}
				onClose={() => setOpen(false)}
				aria-labelledby="table-dialog"
			>
				<DialogTitle id="table-dialog">{title}</DialogTitle>
				<DialogContent>
					{!data || !data.length ? (
						<p>{"No games found."}</p>
					) : (
						<Table data={getData(data)} columns={columns} />
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setSelectedGame(null);
							setOpen(false);
						}}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Cancel
					</Button>
					<br />
				</DialogActions>
			</Dialog>
			<ConfirmDialog
				title={"Are you sure you want to assign this game?"}
				open={openConfirmDialog}
				setOpen={setOpenConfirmDialog}
				onConfirm={() => {
					assignGame();
				}}
			/>
		</>
	);
};
export default GameTableDialog;
