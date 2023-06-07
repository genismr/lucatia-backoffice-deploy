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
import { postGameSession } from "../../../api/game-session";
import ConfirmDialog from "./ConfirmDialog";

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
	const { title, open, setOpen, data, patient, onCreate } = props;
	const [selectedGames, setSelectedGames] = useState([]);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);

	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	function buttonFormatter(cell) {
		const elem = data.find((item) => item.id === cell);
		return <></>;
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

	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
		selectColumnPosition: "right",
		onSelect: (row, isSelect) => {
			if (selectedGames.includes(row.id)) {
				selectedGames.splice(selectedGames.indexOf(row.id), 1);
			} else {
				selectedGames.push(row.id);
			}
		},
		onSelectAll: (isSelect) => {
			if (isSelect) setSelectedGames(data.map((x) => x.id));
			else setSelectedGames([]);
		},
	};

	function assignGames() {
		let saveGameSessions = [];
		selectedGames.forEach((game) => {
			const session = {};
			session.juego_id = game;
			session.asignado_por = loggedUser.userID;
			session.asignado_a = patient;

			saveGameSessions = saveGameSessions.concat(session);
		});
		console.log("sessions", saveGameSessions, selectedGames);
		postGameSession(saveGameSessions)
			.then((res) => {
				if (res.status === 201) {
					onCreate(res.data);
					setSelectedGames([]);
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
						<Table
							data={getData(data)}
							columns={columns}
							selectRow={selectRow}
						/>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setSelectedGames([]);
							setOpen(false);
						}}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Cancel
					</Button>
					<Button
						onClick={() => setOpenConfirmDialog(true)}
						variant="outlined"
						color="primary"
					>
						Assign games
					</Button>
					<br />
				</DialogActions>
			</Dialog>
			<ConfirmDialog
				title={"Are you sure you want to save the assignments?"}
				open={openConfirmDialog}
				setOpen={setOpenConfirmDialog}
				onConfirm={() => {
					assignGames();
				}}
			/>
		</>
	);
};
export default GameTableDialog;
