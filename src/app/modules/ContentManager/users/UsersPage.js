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
import { getUsers, deleteUser, changeStatusUser } from "../../../../api/user";
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
import FiltersCard from "../../../components/filters/Filter";
import { CheckBox } from "@material-ui/icons";
import { useSkeleton } from "../../../hooks/useSkeleton";

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


function getData(users, loggedUser) {
	let data = [];
	for (let i = 0; i < users.length; ++i) {
		if (users[i].id !== loggedUser.userID) {
			const elem = {};

			let apellidos = users[i].apellidos;
			apellidos == null
				? (apellidos = "")
				: (apellidos = " " + apellidos);

			elem.nombreApellidos = users[i].nombre + apellidos;
			elem.email = users[i].email;
			elem.faviconRol = "TO DO";
			elem.rol = users[i].role.descripcion;
			elem.faviconEntityOwner = "TO DO";
			elem.faviconEntityManager = "TO DO";
			elem.lastLogin = "Missing in db";
			elem.id = users[i].id;
			data = data.concat(elem);
		}
	}
	return data;
}

function getPermittedRoles(roles, loggedUser) {
	let data = [];
	for (let i = 0; i < roles.length; ++i) {
		if (loggedUser.role.rango === 0 || roles[i].rango > loggedUser.role.rango) {
			let elem = {};
			elem.id = roles[i].id;
			elem.descripcion = roles[i].descripcion;

			data = data.concat(elem);
		}
	}

	return data;
}

const initialFilters = {
	roles: [],
};

export default function UsersPage() {
	const [data, setData] = useState([]);
	const [userId, setUserId] = useState(null);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);
	const [refresh, setRefresh] = useState(false);
	const [roles, setRoles] = useState(null);

	const [filteredData, setFilteredData] = useState([]);
	const [collapsed, setCollapsed] = useState(true);
	const [filterOptions, setFilterOptions] = useState(initialFilters);

	const history = useHistory();
	const user = useSelector(
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
				<Tooltip title="Owner entities">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/owner-entities/" + cell)}
					>
						<EntitiesIcon />
					</Button>
				</Tooltip>
				<Tooltip title="View">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() =>
							history.push("/view-user/" + cell)
						}
					>
						<ViewIcon />
					</Button>
				</Tooltip>
				{(user.role.rango === 0 ||
					elem.role.rango !== user.role.rango) && (
					<>
						<Tooltip title="Edit">
							<Button
								style={buttonsStyle}
								size="small"
								onClick={() =>
									history.push("/edit-user/" + cell)
								}
							>
								<EditIcon />
							</Button>
						</Tooltip>
						<Tooltip title="Delete">
							<Button
								style={buttonsStyle}
								size="small"
								onClick={() => {
									setUserId(cell);
									setOpenConfirmDialog(2);
								}}
							>
								<DeleteIcon />
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
		{ dataField: "faviconEntityOwner", text: "Owner entities" },
		{ dataField: "faviconEntityManager", text: "Managed entities" },
		{
			dataField: "lastLogin",
			text: "Last Login" /*formatter: dateFormatter*/,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	useEffect(() => {
		getRoles()
			.then((res) => {
				if (res.status === 200) {
					setRoles(getPermittedRoles(res.data, user));
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get roles.",
				});
			});
		getUsers(user.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setData(res.data);
					setFilteredData(res.data);
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

	const handleSearch = async () => {
		if (!data.length) return;
		setFilteredData(
			data.filter((item) => {
				let filter = true;
				if (filterOptions.roles && filterOptions.roles.length)
					filter =
						filter &&
						filterOptions.roles.includes(item.role.id);
				if (filter) return item;
				return false;
			})
		);
	};

	const handleClearFilters = () => {
		setFilterOptions(initialFilters);
		setRefresh(true);
	};

	const handleChange = (element) => (event) => {
		setFilterOptions({ ...filterOptions, [element]: event.target.value });
		console.log(filterOptions)
	};

	const renderFiltersContent = () => {
		return (
			<>
				<FormControl style={{ width: "100%" }}>
					<InputLabel id="demo-simple-select-standard-label">
						Role
					</InputLabel>
					<Select
						labelId="demo-simple-select-standard-label"
						id="demo-simple-select-standard"
						value={filterOptions.roles || []}
						multiple
						onChange={handleChange("roles")}
						MenuProps={MenuProps}
					>
						{roles?.map((role) => (
							<MenuItem key={role.id} value={role.id}>
								{role.descripcion}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<br />
				<br />
			</>
		);
	};

	return (
		<>
			<Card>
				<CardHeader title="Users list">
					<CardHeaderToolbar>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => history.push("/edit-user")}
						>
							Add new
						</button>
					</CardHeaderToolbar>
				</CardHeader>
				<CardBody>
					<FiltersCard
						filtersContent={renderFiltersContent}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
						handleClearFilters={handleClearFilters}
						handleSearch={handleSearch}
					/>

					<Table
						data={getData(filteredData, user)}
						columns={columns}
					/>
					<ConfirmDialog
						title={"Are you sure you want to remove this user?"}
						open={openConfirmDialog === 2}
						setOpen={setOpenConfirmDialog}
						onConfirm={() => {
							deleteUser(userId)
								.then((res) => {
									if (
										res.status === 204 ||
										res.status === 200
									) {
										alertSuccess({
											title: "Deleted!",
											customMessage:
												"User removed successfully.",
										});
										setRefresh(true);
									}
								})
								.catch((error) => {
									alertError({
										error: error,
										customMessage: "Could not remove user.",
									});
								});
						}}
					/>
				</CardBody>
			</Card>
		</>
	);
}
