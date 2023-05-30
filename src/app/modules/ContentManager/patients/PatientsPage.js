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
	getUsers,
	getUsersByRank,
	setUserActive,
	setUserInactive,
} from "../../../../api/user";
import { getRoles } from "../../../../api/role";
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
import RoleIcon from "@material-ui/icons/AccountCircle";
import EntitiesIcon from "@material-ui/icons/Group";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { useHistory } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { CheckBox } from "@material-ui/icons";
import { useSkeleton } from "../../../hooks/useSkeleton";
import ToggleOffIcon from "@material-ui/icons/ToggleOff";
import ToggleOnIcon from "@material-ui/icons/ToggleOn";
import { userRoles } from "../../../../utils/helpers";

function getData(users, loggedUser) {
	let data = [];
	for (let i = 0; i < users.length; ++i) {
		if (users[i].role.rango === userRoles.USER && users[i].id !== loggedUser.userID) {
			const elem = {};

			let apellidos = users[i].apellidos;
			apellidos == null
				? (apellidos = "")
				: (apellidos = " " + apellidos);

			elem.nombreApellidos = users[i].nombre + apellidos;
			elem.email = users[i].email;
			elem.faviconRol = "WIP";
			elem.rol = users[i].role.descripcion;
			elem.faviconEntityOwner = "WIP";
			elem.faviconEntityManager = "WIP";
			elem.lastLogin = users[i].last_login;
			elem.activo = users[i].activo;
			elem.id = users[i].id;
			data = data.concat(elem);
		}
	}
	return data;
}

export default function PatientsPage() {
	const [data, setData] = useState([]);
	const [user, setSelectedUser] = useState(null);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);
	const [refresh, setRefresh] = useState(false);
	const [roles, setRoles] = useState(null);

	const history = useHistory();
	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	function roleFormatter(cell) {
		const elem = data.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title={elem.role.descripcion}>
					<Button style={buttonsStyle} size="small">
						<RoleIcon />
					</Button>
				</Tooltip>
			</>
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
						onClick={() => history.push("/view-patient/" + cell)}
					>
						<ViewIcon />
					</Button>
				</Tooltip>
				{(loggedUser.role.rango === userRoles.SUPER_ADMIN ||
					elem.role.rango !== loggedUser.role.rango) && (
					<>
						<Tooltip title="Edit">
							<Button
								style={buttonsStyle}
								size="small"
								onClick={() =>
									history.push("/edit-patient/" + cell)
								}
							>
								<EditIcon />
							</Button>
						</Tooltip>
						<Tooltip title={elem?.activo ? "Disable" : "Enable"}>
							<Button
								style={buttonsStyle}
								size="small"
								onClick={() => {
									setSelectedUser(elem);
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
				)}
			</>
		);
	}

	const columns = [
		{
			dataField: "nombreApellidos",
			text: "Nombre y Apellidos",
			sort: true,
		},
		{ dataField: "email", text: "Mail", sort: true },
		{ dataField: "id", text: "Rol", formatter: roleFormatter },
		{ dataField: "faviconEntityOwner", text: "Owner" },
		{ dataField: "faviconEntityManager", text: "Manager" },
		{
			dataField: "lastLogin",
			text: "Last Login",
			formatter: dateFormatter,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	useEffect(() => {
		getUsersByRank(loggedUser.accessToken, userRoles.USER)
			.then((res) => {
				if (res.status === 200) {
					setData(res.data);
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get users.",
				});
			});
	}, [refresh]);

	return (
		<>
			<Card>
				<CardHeader title="Patients list">
					<CardHeaderToolbar>
						{loggedUser.role.rango < userRoles.USER && (
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => history.push("/edit-patient")}
							>
								Add new
							</button>
						)}
					</CardHeaderToolbar>
				</CardHeader>
				<CardBody>
					<Table data={getData(data, loggedUser)} columns={columns} />
					<ConfirmDialog
						title={`Are you sure you want to ${
							user?.activo ? "disable" : "enable"
						} this patient?`}
						open={openConfirmDialog === 1}
						setOpen={setOpenConfirmDialog}
						onConfirm={() => {
							if (!user?.activo) {
								setUserActive(user.id, loggedUser.accessToken)
									.then((res) => {
										if (
											res.status === 200 ||
											res.status === 204
										) {
											alertSuccess({
												title: `${
													user?.activo
														? "Disabled!"
														: "Enabled!"
												}`,
												customMessage: `User ${
													user?.activo
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
												user?.activo
													? "disable"
													: "enable"
											} patient.`,
										});
									});
							} else {
								setUserInactive(user.id, loggedUser.accessToken)
									.then((res) => {
										if (
											res.status === 200 ||
											res.status === 204
										) {
											alertSuccess({
												title: `${
													user?.activo
														? "Disabled!"
														: "Enabled!"
												}`,
												customMessage: `User ${
													user?.activo
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
												user?.activo
													? "disable"
													: "enable"
											} patient.`,
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
