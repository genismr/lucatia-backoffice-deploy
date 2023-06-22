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
import { setSessionAssignedByExternalEntity, updateSession } from "../../../api/game-session";

function getData(externalEntities) {
	let data = [];
	for (let i = 0; i < externalEntities.length; ++i) {
		const elem = {};

		elem.nombre = externalEntities[i].nombre;
		elem.razonSocial = externalEntities[i]?.razonSocial || "---";
		elem.nif = externalEntities[i]?.nif || "---";

		elem.id = externalEntities[i].id;

		data = data.concat(elem);
	}

	return data;
}
const ExternalEntityTableDialog = (props) => {
	const { title, open, setOpen, data, session, onCreate } = props;
	const [selectedEntity, setSelectedEntity] = useState(null);
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
							setSelectedEntity(elem);
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
			dataField: "razonSocial",
			text: "Razón Social",
			sort: true,
		},
		{
			dataField: "nif",
			text: "NIF",
			sort: true,
		},
		{
			dataField: "id",
			text: "",
			formatter: buttonFormatter,
		},
	];

	function assignExternalEntity() {
		let saveGameSession = {
			juego_id: session.juego.id,
			fecha_inicio: session.fecha_inicio,
			fecha_fin: session.fecha_inicio,
			enviado_por_entidad_ext: selectedEntity.id,
		};
		updateSession(session.sessionId, saveGameSession)
			.then((res) => {
				if (res.status === 201) {
					setSelectedEntity(null);
					onCreate(res.data)
					alertSuccess({
						title: "Saved!",
						customMessage: "Entity assigned successfully.",
					});
					setOpen(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not assign entity.",
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
						<p>{"No external entities found."}</p>
					) : (
						<Table data={getData(data)} columns={columns} />
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setSelectedEntity(null);
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
				title={"Are you sure you want to assign this entity?"}
				open={openConfirmDialog}
				setOpen={setOpenConfirmDialog}
				onConfirm={() => {
					assignExternalEntity();
				}}
			/>
		</>
	);
};
export default ExternalEntityTableDialog;
