import React, { useState, useEffect } from "react";
import {
	Button,
	Dialog,
	TextField,
	DialogActions,
	DialogContent,
	DialogTitle,
	Tooltip,
	MuiThemeProvider,
	createMuiTheme,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	FormHelperText,
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
import { useHistory } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { alertError, alertSuccess } from "../../../utils/logger";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import PeopleIcon from "@material-ui/icons/People";
import SettingsIcon from "@material-ui/icons/Settings";
import RoleIcon from "@material-ui/icons/AccountCircle";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import { getRoles } from "../../../api/role";
import { checkIsEmpty } from "../../../utils/helpers";
import { postUser } from "../../../api/user";

// Create theme for delete button (red)
const theme = createMuiTheme({
	palette: {
		secondary: {
			main: "#F64E60",
		},
	},
});

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

function getEmptyUser() {
	return {
		nombre: "",
		apellidos: null,
		email: "",
		password: "",
		user_rol_id: "",
		activo: true,
	};
}

function getEmptyPassword() {
	return {
		password: null,
		repeatPassword: null,
	};
}

const EntityContactsTableDialog = (props) => {
	const { title, open, setOpen, data, onSelectRow, onUserCreated } = props;

	const [renderUserInputFields, setRenderUserInputFields] = useState(null);
	const [roles, setRoles] = useState(null);

	const [user, setUser] = useState(getEmptyUser());

	const [newPassword, setNewPassword] = useState(getEmptyPassword());

	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	function getPermittedRoles(roles) {
		let data = [];
		for (let i = 0; i < roles.length; ++i) {
			if (
				loggedUser.role.rango === 0 ||
				roles[i].rango > loggedUser.role.rango
			) {
				let elem = {};
				elem.id = roles[i].id;
				elem.descripcion = roles[i].descripcion;

				data = data.concat(elem);
			}
		}

		return data;
	}

	useEffect(() => {
		getRoles()
			.then((res) => {
				if (res.status === 200) {
					setRoles(getPermittedRoles(res.data));
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get roles.",
				});
				setOpen(false);
			});
	});

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
		return (
			<>
				<Tooltip title={"Select"}>
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							let _cell;
							_cell = data.find((item) => item.id === cell);
							onSelectRow(_cell);
						}}
					>
						<PersonAddIcon />
					</Button>
				</Tooltip>
			</>
		);
	}

	const columns = [
		{ dataField: "nombre", text: "Nombre", sort: true },
		{ dataField: "apellidos", text: "Apellidos", sort: true },
		{ dataField: "email", text: "Email", sort: true },
		{ dataField: "telefono", text: "Teléfono", sort: true },
		{
			dataField: "id",
			text: "Role",
			align: "center",
			headerAlign: "center",
			sort: true,
			formatter: roleFormatter,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	const handleChange = (element) => (event) => {
		let text = event.target.value;
		if (event.target.value.trim() == "") text = null;
		setUser({ ...user, [element]: text });
	};

	function saveUser() {
		if (
			checkIsEmpty(user.nombre) ||
			checkIsEmpty(user.email) ||
			checkIsEmpty(user.user_rol_id)
		) {
			alertError({
				error: null,
				customMessage: "Some required fields are missing",
			});
			return;
		}

		let saveUser = user;
		if (!newPassword.password || !newPassword.repeatPassword) {
			alertError({
				error: null,
				customMessage: "Please enter the password.",
			});
			return;
		}
		if (newPassword.password !== newPassword.repeatPassword) {
			alertError({
				error: null,
				customMessage: "Passwords do not match.",
			});
			return;
		}
		saveUser = { ...saveUser, password: newPassword.password };
		postUser(saveUser, loggedUser.accessToken)
			.then((res) => {
				if (res.status === 201) {
					let newUser = res.data;
					let roleDescripcion = roles.find(
						(x) => x.id == newUser.user_rol_id
					).descripcion;
					newUser = {
						...newUser,
						role: { descripcion: roleDescripcion },
					};
					onUserCreated(newUser);
					alertSuccess({
						title: "Saved!",
						customMessage: "User successfully created.",
					});
					setNewPassword(getEmptyPassword());
					setUser(getEmptyUser());
					setRenderUserInputFields(null);
					setOpen(false);
				}
			})
			.catch((error) => {
				let message = error;
				if (message.toString().includes("409")) {
					message = "There is already a user with the same email.";
				}
				alertError({
					error: message,
					customMessage: "Could not save user.",
				});
			});
	}

	function renderUserFields() {
		return (
			<>
				<div className="row">
					<div className="col-4">
						<TextField
							id={"nombre"}
							label={"Nombre"}
							value={user.nombre}
							onChange={handleChange("nombre")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
							required
						/>
					</div>
					<div className="col-4">
						<TextField
							id={"apellidos"}
							label={"Apellidos"}
							value={user.apellidos}
							onChange={handleChange("apellidos")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
					</div>
					<div className="col-4">
						<TextField
							id={"email"}
							label={"Email"}
							value={user.email}
							onChange={handleChange("email")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
							required
						/>
					</div>
				</div>
				<div className="row">
					<div className="col-4">
						<TextField
							id={"password"}
							label={"Password"}
							value={newPassword.password}
							onChange={(event) => {
								if (event.target.value !== " ")
									setNewPassword({
										...newPassword,
										password: event.target.value,
									});
							}}
							InputLabelProps={{
								shrink: true,
							}}
							type="password"
							margin="normal"
							variant="outlined"
							required
						/>
					</div>
					<div className="col-4">
						<TextField
							id={"repeatPassword"}
							label={"Repeat Password"}
							value={newPassword.repeatPassword}
							onChange={(event) => {
								if (event.target.value !== " ")
									setNewPassword({
										...newPassword,
										repeatPassword: event.target.value,
									});
							}}
							InputLabelProps={{
								shrink: true,
							}}
							type="password"
							margin="normal"
							variant="outlined"
							required
						/>
					</div>
					<div className="col-4">
						<FormControl style={{ width: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Role *
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={user.user_rol_id || ""}
								onChange={handleChange("user_rol_id")}
								MenuProps={MenuProps}
							>
								{roles?.map((option) => (
									<MenuItem key={option.id} value={option.id}>
										{option.descripcion}
									</MenuItem>
								))}
							</Select>
							<FormHelperText>Select a role</FormHelperText>
						</FormControl>
					</div>
				</div>
				<br />
				<div className="d-flex justify-content-end">
					<Button
						onClick={() => {
							setRenderUserInputFields(null);
							setNewPassword(getEmptyPassword());
							setUser(getEmptyUser());
							setRenderUserInputFields(null);
						}}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Cancel
					</Button>
					<Button
						onClick={() => saveUser()}
						variant="outlined"
						color="primary"
					>
						Save user
					</Button>
					<br />
					<br />
				</div>
			</>
		);
	}

	return (
		<Dialog
			fullWidth={true}
			maxWidth="xl"
			open={open}
			onClose={() => setOpen(false)}
			aria-labelledby="table-dialog"
		>
			<DialogContent>
				<Card>
					<CardHeader title="Users list">
						<CardHeaderToolbar>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => setRenderUserInputFields(true)}
							>
								Add new
							</button>
						</CardHeaderToolbar>
					</CardHeader>
					<CardBody>
						{renderUserInputFields && renderUserFields()}
						{!data || !data.length ? (
							<p>{"No users found."}</p>
						) : (
							<Table data={data} columns={columns} size={7} />
						)}
					</CardBody>
				</Card>
			</DialogContent>
			<DialogActions>
				<MuiThemeProvider theme={theme}>
					<Button
						onClick={() => {
							setNewPassword(getEmptyPassword());
							setUser(getEmptyUser());
							setRenderUserInputFields(null);
							setOpen(false);
						}}
						variant="outlined"
						color="secondary"
					>
						Cancel
					</Button>
				</MuiThemeProvider>
			</DialogActions>
		</Dialog>
	);
};
export default EntityContactsTableDialog;
