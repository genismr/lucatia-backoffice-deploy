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
	FormControlLabel,
} from "@material-ui/core";
import Table, {
	booleanFormatter,
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
import RoleIcon from "@material-ui/icons/AccountCircle";
import { checkIsEmpty } from "../../../utils/helpers";
import { postUser } from "../../../api/user";
import { Autocomplete } from "@material-ui/lab";

function getEmptyUser() {
	return {
		nombre: "",
		apellidos: null,
		email: "",
		password: "",
		user_rol_id: "",
		fecha_nacimiento: null,
		telefono: null,
		direccion: null,
		cp: null,
		poblacion: null,
		provincia_id: null,
		pais: null,
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
	const {
		open,
		setOpen,
		data,
		roles,
		provincias,
		onSelectRow,
		onUserCreated,
	} = props;
	const [refresh, setRefresh] = useState(false);

	const [renderInputFields, setRenderInputFields] = useState(null);

	const [user, setUser] = useState(getEmptyUser());

	const [newPassword, setNewPassword] = useState(getEmptyPassword());

	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	function roleFormatter(cell) {
		const elem = data.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title={elem.role.descripcion}>
					<img
						src={elem.role.icono?.url}
						style={{ maxWidth: "30px", cursor: "zoom-in" }}
					/>
				</Tooltip>
			</>
		);
	}

	function buttonFormatter(cell) {
		const elem = data.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title={"Select"}>
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							onSelectRow(elem);
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
					setRenderInputFields(null);
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
				<form autoComplete="off">
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
								id={`telefono`}
								label="Teléfono"
								value={user?.telefono || ""}
								onChange={handleChange("telefono")}
								InputLabelProps={{
									shrink: true,
								}}
								margin="normal"
								variant="outlined"
							/>
						</div>
						<div className="col-4">
							<TextField
								id={`fecha`}
								label="Fecha de nacimiento"
								value={user?.fecha_nacimiento}
								onChange={handleChange("fecha_nacimiento")}
								InputLabelProps={{
									shrink: true,
								}}
								type="date"
								margin="normal"
								variant="outlined"
							/>
						</div>
						<div className="col-4">
							<Autocomplete
								id="autocomplete-role"
								disablePortal
								filterSelectedOptions
								required
								options={roles}
								getOptionLabel={(option) => option.descripcion}
								value={
									roles.find(
										(x) => x.id === user?.user_rol_id
									) || ""
								}
								onChange={(event, selected) => {
									setUser({
										...user,
										user_rol_id: selected
											? selected.id
											: "",
									});
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Role"
										margin="normal"
										variant="outlined"
										InputLabelProps={{
											shrink: true,
										}}
										required
									/>
								)}
							/>
						</div>
					</div>
				</form>
				<form autoComplete="off">
					<div className="row">
						<div className="col-6">
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
						<div className="col-6">
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
					</div>
				</form>
				<div className="row">
					<div className="col-6">
						<TextField
							id={`direccion`}
							label="Dirección"
							value={user.direccion}
							onChange={handleChange("direccion")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
					</div>
					<div className="col-6">
						<TextField
							id={`poblacion`}
							label="Población"
							value={user.poblacion}
							onChange={handleChange("poblacion")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
					</div>
				</div>
				<div className="row">
					<div className="col-4 gx-3">
						<TextField
							id={`cp`}
							label="Código postal"
							value={user.cp}
							onChange={handleChange("cp")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
					</div>
					<div className="col-4 gx-3">
						<Autocomplete
							id="autocomplete-provincia"
							disablePortal
							filterSelectedOptions
							options={provincias}
							getOptionLabel={(option) => option.nombre}
							value={provincias.find(
								(x) => x.id === user?.provincia_id
							)}
							onChange={(event, selected) => {
								setUser({
									...user,
									provincia_id: selected?.id,
								});
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Província"
									margin="normal"
									variant="outlined"
									InputLabelProps={{
										shrink: true,
									}}
								/>
							)}
						/>
					</div>
					<div className="col-4 gx-3">
						<TextField
							id={`pais`}
							label="País"
							value={user.pais}
							onChange={handleChange("pais")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
					</div>
				</div>
				<br />
				<div className="d-flex justify-content-end">
					<Button
						onClick={() => {
							setRenderInputFields(null);
							setNewPassword(getEmptyPassword());
							setUser(getEmptyUser());
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
					<CardHeader title={"Users list"}>
						<CardHeaderToolbar>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => setRenderInputFields(true)}
							>
								Add new
							</button>
						</CardHeaderToolbar>
					</CardHeader>
					<CardBody>
						{renderInputFields && renderUserFields()}
						{!data || !data.length ? (
							<p>{"No users found."}</p>
						) : (
							<Table data={data} columns={columns} />
						)}
					</CardBody>
				</Card>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => {
						setNewPassword(getEmptyPassword());
						setUser(getEmptyUser());
						setRenderInputFields(null);
						setOpen(false);
					}}
					variant="outlined"
					color="secondary"
				>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};
export default EntityContactsTableDialog;
