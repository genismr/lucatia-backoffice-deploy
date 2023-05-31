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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
	getContentAnchorEl: () => null,
};

function getData(apps) {
	let data = [];
	for (let i = 0; i < apps.length; ++i) {
		const elem = {};

		elem.faviconApp = apps[i].icono_id;
		elem.nombre = apps[i].nombre;
		elem.tecnologia = apps[i].tecnologia ? apps[i].tecnologia : "---";
		elem.faviconOwnerEntity = apps[i].ownedEntities?.map((e) => e.icono_id);
		elem.faviconsDelegatedEntities = apps[i].delegatedEntities?.map(
			(e) => e.icono_id
		);
		elem.activo = apps[i].activo;
		elem.id = apps[i].id;
		data = data.concat(elem);
	}
	console.log(data);
	return data;
}

export default function AppsPage() {
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
				<Tooltip title="View">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/view-app/" + cell)}
					>
						<ViewIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/edit-app/" + cell)}
					>
						<EditIcon />
					</Button>
				</Tooltip>
				<Tooltip title={elem?.activo ? "Disable" : "Enable"}>
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							setSelectedApp(elem);
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
		{
			dataField: "faviconApp",
			text: "App Icon",
			formatter: imageFormatter,
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{
			dataField: "tecnologia",
			text: "Tecnología",
		},
		{
			dataField: "faviconOwnerEntity",
			text: "Owner Entity",
			formatter: imageFormatter,
		},
		{
			dataField: "faviconsDelegatedEntities",
			text: "Delegated Entity",
			formatter: imageFormatter,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	useEffect(() => {
		getApps(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setData(getData(res.data));
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get apps.",
				});
			});
	}, [refresh]);

	return (
		<>
			<Card>
				<CardHeader title="Apps list">
					{loggedUser.role.rango === userRoles.SUPER_ADMIN && (
						<CardHeaderToolbar>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => history.push("/edit-app")}
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
							app?.activo ? "disable" : "enable"
						} this app?`}
						open={openConfirmDialog === 1}
						setOpen={setOpenConfirmDialog}
						onConfirm={() => {
							if (!app?.activo) {
								setAppActive(app.id, loggedUser.accessToken)
									.then((res) => {
										if (
											res.status === 200 ||
											res.status === 204
										) {
											alertSuccess({
												title: `${
													app?.activo
														? "Disabled!"
														: "Enabled!"
												}`,
												customMessage: `App ${
													app?.activo
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
												app?.activo
													? "disable"
													: "enable"
											} app.`,
										});
									});
							} else {
								setAppInactive(app.id, loggedUser.accessToken)
									.then((res) => {
										if (
											res.status === 200 ||
											res.status === 204
										) {
											alertSuccess({
												title: `${
													app?.activo
														? "Disabled!"
														: "Enabled!"
												}`,
												customMessage: `App ${
													app?.activo
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
												app?.activo
													? "disable"
													: "enable"
											} app.`,
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
