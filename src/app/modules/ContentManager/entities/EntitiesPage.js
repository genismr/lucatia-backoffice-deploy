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
import { getEntities, setEntityActive, setEntityInactive } from "../../../../api/entity";
import {
	Button,
	Tooltip,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ViewIcon from "@material-ui/icons/Visibility";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { useHistory, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { CheckBox } from "@material-ui/icons";
import { useSkeleton } from "../../../hooks/useSkeleton";
import ToggleOffIcon from "@material-ui/icons/ToggleOff";
import ToggleOnIcon from "@material-ui/icons/ToggleOn";

function getData(entities) {
	let data = [];
	for (let i = 0; i < entities.length; ++i) {
		const elem = {};

		elem.favicon = entities[i].icono_id;
		elem.nombre = entities[i].nombre;
		elem.faviconParentEntity = entities[i].parentEntity?.icono_id;
		elem.ownerName = "??";
		elem.activo = entities[i].activo;
		elem.id = entities[i].id;

		data = data.concat(elem);
	}

	return data;
}

export default function EntitiesPage() {
	const [data, setData] = useState([]);
	const [entity, setSelectedEntity] = useState(null);
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
				<Tooltip title="View">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/view-entity/" + cell)}
					>
						<ViewIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/edit-entity/" + cell)}
					>
						<EditIcon />
					</Button>
				</Tooltip>
				<Tooltip title={elem?.activo ? "Disable" : "Enable"}>
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							setSelectedEntity(elem);
							setOpenConfirmDialog(1);
						}}
					>
						{elem?.activo ? (
							<ToggleOffIcon />
						) : (
							<ToggleOnIcon style={{ color: "red" }} />
						)}
					</Button>
				</Tooltip>
			</>
		);
	}

	const columns = [
		{ dataField: "favicon", text: "Icon", formatter: imageFormatter },
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{
			dataField: "faviconParentEntity",
			text: "Parent entity",
			formatter: imageFormatter,
		},
		{ dataField: "ownerName", text: "Owner name" },
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	useEffect(() => {
		getEntities(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setData(getData(res.data));
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get entities.",
				});
			});
	}, [refresh]);

	return (
		<>
			<Card>
				<CardHeader title="Entities list">
					{(loggedUser.role.rango === 0 || loggedUser.role.rango === 10) && (
						<CardHeaderToolbar>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => history.push("/edit-entity")}
							>
								Add new
							</button>
						</CardHeaderToolbar>
					)}
				</CardHeader>
				<CardBody>
					<Table data={data} columns={columns} />
					<ConfirmDialog
						title={`Are you sure you want to ${
							entity?.activo ? "disable" : "enable"
						} this entity?`}
						open={openConfirmDialog === 1}
						setOpen={setOpenConfirmDialog}
						onConfirm={() => {
							if (!entity?.activo) {
								setEntityActive(entity.id, loggedUser.accessToken)
									.then((res) => {
										if (
											res.status === 200 ||
											res.status === 204
										) {
											alertSuccess({
												title: `${
													entity?.activo
														? "Disabled!"
														: "Enabled!"
												}`,
												customMessage: `Entity ${
													entity?.activo
														? "disabled"
														: "enabled"
												} successfully`,
											});
											setRefresh(true);
										}
									})
									.catch((error) => {
										alertError({
											error: error,
											customMessage: `Could not ${
												entity?.activo
													? "disable"
													: "enable"
											} entity.`,
										});
									});
							} else {
								setEntityInactive(entity.id, loggedUser.accessToken)
									.then((res) => {
										if (
											res.status === 200 ||
											res.status === 204
										) {
											alertSuccess({
												title: `${
													entity?.activo
														? "Disabled!"
														: "Enabled!"
												}`,
												customMessage: `Entity ${
													entity?.activo
														? "disabled"
														: "enabled"
												} successfully`,
											});
											setRefresh(true);
										}
									})
									.catch((error) => {
										alertError({
											error: error,
											customMessage: `Could not ${
												entity?.activo
													? "disable"
													: "enable"
											} entity.`,
										});
									});
							}
						}}
					/>
				</CardBody>
			</Card>
		</>
	);
}
