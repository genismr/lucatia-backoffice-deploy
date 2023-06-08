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
import {
	getEntities,
	setEntityActive,
	setEntityInactive,
} from "../../../../api/entity";
import {
	Button,
	Tooltip,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@material-ui/core";
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
import PreviewDialog from "../../../components/dialogs/PreviewDialog";

function getData(entities) {
	let data = [];
	for (let i = 0; i < entities.length; ++i) {
		const elem = {};

		elem.icon = entities[i].icono?.url;
		elem.nombre = entities[i].nombre;
		elem.iconParentEntity = entities[i].parentEntity?.icono?.url;
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
				src={cell}
				alt="icon"
				style={{ maxWidth: "50px", cursor: "zoom-in" }}
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
		{ dataField: "icon", text: "", formatter: imageFormatter },
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{
			dataField: "iconParentEntity",
			text: "Parent entity",
			formatter: imageFormatter,
		},
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
					{(loggedUser.role.rango === userRoles.SUPER_ADMIN ||
						loggedUser.role.rango === userRoles.ADMIN_ENTIDAD) && (
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
								setEntityActive(
									entity.id,
									loggedUser.accessToken
								)
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
								setEntityInactive(
									entity.id,
									loggedUser.accessToken
								)
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
			<PreviewDialog
				title={"Preview file"}
				open={openPreviewDialog}
				setOpen={setOpenPreviewDialog}
				src={previewImage}
			/>
		</>
	);
}
