import React, { useEffect, useState } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import Table, {
	dateFormatter,
	buttonsStyle,
} from "../../../components/tables/table";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { getApps, setAppActive, setAppInactive } from "../../../../api/app";
import {
	Button,
	Tooltip,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@material-ui/core";
import FiltersCard from "../../../components/filters/Filter";
import EditIcon from "@material-ui/icons/Edit";
import ViewIcon from "@material-ui/icons/Visibility";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { useHistory, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { CheckBox } from "@material-ui/icons";
import { useSkeleton } from "../../../hooks/useSkeleton";
import ToggleOffIcon from "@material-ui/icons/ToggleOff";
import ToggleOnIcon from "@material-ui/icons/ToggleOn";
import { userRoles } from "../../../../utils/helpers";
import { getGames } from "../../../../api/game";

function getData(games) {
	let data = [];
	for (let i = 0; i < games.length; ++i) {
		const elem = {};

		elem.nombre = games[i].nombre;
		elem.descripcion = games[i].descripcion;
		elem.icono = games[i].icono_id;
		elem.imagen = games[i].imagen_id;
		elem.id = games[i].id;

		data = data.concat(elem);
	}

	return data;
}

export default function GamesPage() {
	const [data, setData] = useState([]);
	const [app, setSelectedApp] = useState(null);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);
	const [refresh, setRefresh] = useState(false);
	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);

	const history = useHistory();
	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	function imageFormatter(cell) {
		return cell && cell !== "" ? (
			<img
				//src={SERVER_URL + '/' + cell}
				alt="icon"
				style={{ width: "50px", height: "50px" }}
				onClick={() => {
					setPreviewImage(cell);
					setOpenPreviewDialog(true);
				}}
			/>
		) : (
			<div />
		);
	}

	function buttonFormatter(cell) {
		const elem = data.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							window.sessionStorage.setItem(
								"game",
								JSON.stringify({
									id: cell,
									name: elem.nombre,
								})
							);
							history.push("/edit-game/" + cell);
						}}
					>
						<EditIcon />
					</Button>
				</Tooltip>
			</>
		);
	}

	const columns = [
		{
			dataField: "nombre",
			text: "Nombre",
		},
		{
			dataField: "descripcion",
			text: "Descripcion",
			sort: true,
		},
		{
			dataField: "icono",
			text: "Icono",
			formatter: imageFormatter,
		},
		{
			dataField: "imagen",
			text: "Imagen",
			formatter: imageFormatter,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	useEffect(() => {
		getGames()
			.then((res) => {
				if (res.status === 200) {
					setData(getData(res.data));
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get games.",
				});
			});
	}, [refresh]);

	return (
		<>
			<Card>
				<CardHeader title="Games list">
					<CardHeaderToolbar>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => history.push("/edit-game")}
						>
							Add new
						</button>
					</CardHeaderToolbar>
				</CardHeader>
				<CardBody>
					<Table data={data} columns={columns} />
				</CardBody>
			</Card>
		</>
	);
}