import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import {
	Button,
	TextField,
	MuiThemeProvider,
	createMuiTheme,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	FormHelperText,
} from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import {
	assignOwnerEntity,
	unassignOwnerEntity,
	deleteUser,
	getUserById,
	postUser,
	updateUser,
} from "../../../../api/user";
import { getEntities } from "../../../../api/entity";
import { getRoles } from "../../../../api/role";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { checkIsEmpty } from "../../../../utils/helpers";

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
		telefono: null,
		direccion: null,
		cp: null,
		poblacion: null,
		provincia: null,
		pais: null,
		fecha_nacimiento: null,
		fecha_alta: "",
		user_alta_id: "",
		user_rol_id: "",
		entities: [],
	};
}

export default function EditUsersPage() {
	const [user, setUser] = useState(getEmptyUser());
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
	const [newPassword, setNewPassword] = useState({
		password: null,
		repeatPassword: null,
	});

	const [roles, setRoles] = useState(null);
	const [entities, setEntities] = useState(null);

	const [initialAssignedEntities, setInitialAssignedEntities] = useState(
		null
	);

	const userId = useParams().id;
	const history = useHistory();

	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	const {
		isLoading: isLoadingData,
		disableLoading: disableLoadingData,
		ContentSkeleton,
	} = useSkeleton();

	function getPermittedRoles(roles) {
		let data = [];
		for (let i = 0; i < roles.length; ++i) {
			if (
				loggedUser.role.rango == 0 ||
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

	function assignEntitiesToUser(assignedUserId) {
		let newAssignedEntities = user.entities;
		if (initialAssignedEntities != null) {
			newAssignedEntities = user.entities.filter(
				(e) => !initialAssignedEntities.includes(e)
			);
		}

		if (!userId || newAssignedEntities.length) {
			console.log("new");
			console.log(newAssignedEntities);

			let assignBody = [];

			for (let i = 0; i < newAssignedEntities.length; ++i) {
				let bodyElem = {
					entidad_id: newAssignedEntities[i],
					fecha_alta: new Date(),
					user_alta_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
				};
				assignBody = assignBody.concat(bodyElem);
			}

			console.log("body");
			console.log(assignBody);

			assignOwnerEntity(assignedUserId, assignBody)
				.then((res) => {
					if (res.status === 200) {
						alertSuccess({
							title: "Saved!",
							customMessage: "User successfully saved.",
						});
						history.push("/users");
					}
				})
				.catch((error) => {
					deleteUser(assignedUserId);
					alertError({
						error: error,
						customMessage: "Could not save user.",
					});
				});
		}

		let unassignedEntities = null;
		if (initialAssignedEntities != null)
			unassignedEntities = initialAssignedEntities.filter(
				(e) => !user.entities.includes(e)
			);

		if (unassignedEntities != null) {
			console.log("deleted");
			console.log(unassignedEntities);

			unassignOwnerEntity(assignedUserId, unassignedEntities).then(
				(res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage: "User successfully saved.",
						});
						history.push("/users");
					}
				}
			);
		}
	}

	function saveUser() {
		if (
			checkIsEmpty(user.nombre) ||
			checkIsEmpty(user.email)
		) {
			alertError({
				error: null,
				customMessage: "Some required fields are missing",
			});
			return;
		}
		if (user.fecha_nacimiento != null && isNaN(Date.parse(user.fecha_nacimiento))) {
			alertError({
				error: null,
				customMessage: "Invalid date format",
			});
			return;
		}

		let saveUser = user;
		if (!userId) {
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
		}

		if (!userId) {
			saveUser.fecha_alta = new Date();
			saveUser.user_alta_id = loggedUser.userID;
			postUser(saveUser)
				.then((res) => {
					if (res.status === 201) {
						if (user.entities.length) {
							assignEntitiesToUser(res.data.id);
						} else {
							alertSuccess({
								title: "Saved!",
								customMessage: "User successfully created.",
							});
						}
						history.push("/users");
					}
				})
				.catch((error) => {
					let message = error;
					if (message.toString().includes("409")) {
						message =
							"There is already a user with the same email.";
					}
					alertError({
						error: message,
						customMessage: "Could not save user.",
					});
				});
		} else {
			updateUser(userId, saveUser)
				.then((res) => {
					if (res.status === 204) {
						assignEntitiesToUser(userId);
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save changes.",
					});
				});
		}
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
				history.push("/users");
			});
		getEntities(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					console.log(res.data);
					setEntities(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get entities.",
				});
			});
		if (!userId) {
			disableLoadingData();
			return;
		}
		getUserById(userId)
			.then((res) => {
				if (res.status === 200) {
					let roleId = res.data.role.id;
					let user = res.data;

					user.fecha_nacimiento = user.fecha_nacimiento.substring(
						0,
						user.fecha_nacimiento.lastIndexOf("T")
					);

					if (user.fecha_nacimiento === "0001-01-01") user.fecha_nacimiento = null;

					delete user.role;
					user.user_rol_id = roleId;
					user.entities = user.entities.map((e) => e.id);
					setInitialAssignedEntities(user.entities);

					setUser(user);

					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get user.",
				});
				history.push("/users");
			});
	}, [userId, disableLoadingData, history]);

	const handleChange = (element) => (event) => {
		let text = event.target.value;
		if (element !== "entities" && event.target.value.trim() == "")
			text = null;
		setUser({ ...user, [element]: text });
	};

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit user"></CardHeader>
					<CardBody>
						<TextField
							id={`nombre`}
							label="Nombre"
							value={user.nombre}
							onChange={handleChange("nombre")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
							required
						/>
						<TextField
							id={`apellidos`}
							label="Apellidos"
							value={user.apellidos}
							onChange={handleChange("apellidos")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`email`}
							label="Email"
							value={user.email}
							onChange={handleChange("email")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
							required
							disabled={userId}
						/>
						{!userId && (
							<>
								<br />
								<br />
								<TextField
									id={`password`}
									label="Password"
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
								<TextField
									id={`repeatPassword`}
									label="Repeat password"
									value={newPassword.repeatPassword}
									onChange={(event) => {
										if (event.target.value !== " ")
											setNewPassword({
												...newPassword,
												repeatPassword:
													event.target.value,
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
								<br />
							</>
						)}
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
						<br />
						<br />
						<TextField
							id={`telefono`}
							label="Teléfono"
							value={user.telefono}
							onChange={handleChange("telefono")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
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
						<TextField
							id={`provincia`}
							label="Província"
							value={user.provincia}
							onChange={handleChange("provincia")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
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
						<TextField
							id={`fecha_nacimiento`}
							label="Fecha de nacimiento"
							value={user.fecha_nacimiento}
							onChange={handleChange("fecha_nacimiento")}
							InputLabelProps={{
								shrink: true,
							}}
							placeholder="yyyy-mm-dd"
							margin="normal"
							variant="outlined"
						/>
						<br />
						<FormControl style={{ width: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Assigned entities
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={user.entities || ""}
								multiple
								onChange={handleChange("entities")}
								MenuProps={MenuProps}
							>
								{entities?.map((option) => (
									<MenuItem key={option.id} value={option.id}>
										{option.nombre}
									</MenuItem>
								))}
							</Select>
							<FormHelperText>Select entities</FormHelperText>
						</FormControl>
					</CardBody>
				</Card>
				<Button
					onClick={() => history.push("/users")}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				<Button
					onClick={() => saveUser()}
					variant="outlined"
					color="primary"
					style={{ marginRight: "20px" }}
				>
					Save user
				</Button>
				{userId && (
					<>
						<MuiThemeProvider theme={theme}>
							<Button
								onClick={() => setOpenConfirmDialog(true)}
								variant="outlined"
								color="secondary"
							>
								Delete user
							</Button>
						</MuiThemeProvider>

						<ConfirmDialog
							title={"Are you sure you want to delete this user?"}
							open={openConfirmDialog}
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
													"User deleted successfully",
											});
											history.push("/users");
										}
									})
									.catch((error) => {
										alertError({
											error: error,
											customMessage:
												"Could not delete user.",
										});
									});
							}}
						/>
					</>
				)}
			</>
		);
}
