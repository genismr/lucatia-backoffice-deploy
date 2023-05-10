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
	assignManagedEntity,
	unassignManagedEntity,
	deleteUser,
	getUserById,
	postUser,
	updateUser,
	postUserAppMetadata,
	updateUserAppMetadata,
	assignUserApp,
	unassignUserApp,
} from "../../../../api/user";
import { getEntities } from "../../../../api/entity";
import { getRoles } from "../../../../api/role";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { checkIsEmpty } from "../../../../utils/helpers";
import { getAppMetadata } from "../../../../api/app";

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
		codigo_hexa: null,
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
		last_login: null,
		activo: true,
		owned_entities: [],
		managed_entities: [],
		app_metadata: [],
		apps: [],
	};
}

function getAppsRelatedToEntities(entities) {
	let data = [];

	for (let i = 0; i < entities.length; ++i) {
		let ownedApps = entities[i].ownedApps;
		let delegatedApps = entities[i].delegatedApps;
		let apps = [...ownedApps, ...delegatedApps];
		apps = apps.map((x) => ({ ...x, entity_id: entities[i].id }));

		data = data.concat(apps);
	}

	let appsId = [...new Set(data.map((a) => a.id))];

	data = appsId.map((x) => {
		return data.filter((value) => value.id == x)[0];
	});

	return data;
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
	const [apps, setApps] = useState(null);

	const [appMetadata, setAppMetadata] = useState(null);

	const [initialAppMetadata, setInitialAppMetadata] = useState(null);

	const [initialAssignedEntities, setInitialAssignedEntities] = useState(
		null
	);
	const [initialManagedEntities, setInitialManagedEntities] = useState(null);
	const [initialAssignedApps, setInitialAssignedApps] = useState(null);

	const [success, setSuccess] = useState(false);
	const myProfile = window.location.href.toString().includes("my-area");

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

	function handleOwnedEntitiesAssignment(assignedUserId) {
		let newAssignedEntities = user.owned_entities;
		if (initialAssignedEntities != null) {
			newAssignedEntities = user.owned_entities.filter(
				(e) => !initialAssignedEntities.includes(e)
			);
		}

		if (!userId || newAssignedEntities.length) {
			assignOwnerEntity(
				assignedUserId,
				newAssignedEntities,
				loggedUser.accessToken
			)
				.then((res) => {
					if (res.status === 200) {
						setSuccess(true);
					}
				})
				.catch((error) => {
					setSuccess(false);
					if (!userId) deleteUser(assignedUserId);
					alertError({
						error: error,
						customMessage: "Could not save user.",
					});
				});
		}

		let unassignedEntities = null;
		if (initialAssignedEntities != null)
			unassignedEntities = initialAssignedEntities.filter(
				(e) => !user.owned_entities.includes(e)
			);

		if (unassignedEntities != null) {
			unassignOwnerEntity(
				assignedUserId,
				unassignedEntities,
				loggedUser.accessToken
			).then((res) => {
				if (res.status === 204) {
					setSuccess(true);
				}
			});
		}
	}

	function handleManagedEntitiesAssignment(assignedUserId) {
		let newAssignedEntities = user.managed_entities;
		if (initialManagedEntities != null) {
			newAssignedEntities = user.managed_entities.filter(
				(e) => !initialManagedEntities.includes(e)
			);
		}

		if (!userId || newAssignedEntities.length) {
			assignManagedEntity(
				assignedUserId,
				newAssignedEntities,
				loggedUser.accessToken
			)
				.then((res) => {
					if (res.status === 200) {
						setSuccess(true);
					}
				})
				.catch((error) => {
					setSuccess(false);
					if (!userId) deleteUser(assignedUserId);
					alertError({
						error: error,
						customMessage: "Could not save user.",
					});
				});
		}

		let unassignedEntities = null;
		if (initialManagedEntities != null)
			unassignedEntities = initialManagedEntities.filter(
				(e) => !user.managed_entities.includes(e)
			);

		if (unassignedEntities != null) {
			unassignManagedEntity(
				assignedUserId,
				unassignedEntities,
				loggedUser.accessToken
			).then((res) => {
				if (res.status === 204) {
					setSuccess(true);
				}
			});
		}
	}

	function handleAppAssignment(assignedUserId) {
		let permittedApps = getPermittedApps();

		for (let i = 0; user.apps != undefined && i < user.apps.length; ++i) {
			if (!permittedApps.find((x) => x.id == user.apps[i]))
				user.apps.splice(i, 1);
		}

		let newAssignedApps = user.apps;
		if (initialAssignedApps != null) {
			newAssignedApps = user.apps.filter(
				(e) => !initialAssignedApps.includes(e)
			);
		}

		if (!userId || newAssignedApps.length) {
			assignUserApp(
				assignedUserId,
				newAssignedApps,
				loggedUser.accessToken
			)
				.then((res) => {
					if (res.status === 200) {
						setSuccess(true);
					}
				})
				.catch((error) => {
					setSuccess(false);
					if (!userId) deleteUser(assignedUserId);
					alertError({
						error: error,
						customMessage: "Could not save user.",
					});
				});
		}

		let unassignedApps = null;
		if (initialAssignedApps != null)
			unassignedApps = initialAssignedApps.filter(
				(e) => !user.apps.includes(e)
			);

		if (unassignedApps != null) {
			unassignUserApp(
				assignedUserId,
				unassignedApps,
				loggedUser.accessToken
			).then((res) => {
				if (res.status === 204) {
					setSuccess(true);
				}
			});
		}
	}

	function saveUserMetadata(metadataUserId) {
		let saveNewMetadata = user.app_metadata;
		if (initialAppMetadata != null) {
			saveNewMetadata = user.app_metadata.filter(
				(e) =>
					!initialAppMetadata.find(
						(y) => y.app_metadata_id == e.app_metadata_id
					)
			);
		}

		if (saveNewMetadata.length) {
			postUserAppMetadata(
				metadataUserId,
				saveNewMetadata,
				loggedUser.accessToken
			)
				.then((res) => {
					if (res.status === 201) {
						setSuccess(true);
					}
				})
				.catch((error) => {
					setSuccess(false);
					alertError({
						error: error,
						customMessage: "Could not save user metadata.",
					});
				});
		}

		let saveMetadata = user.app_metadata.filter(
			(e) =>
				!saveNewMetadata.find(
					(y) => y.app_metadata_id == e.app_metadata_id
				)
		);

		updateUserAppMetadata(
			metadataUserId,
			saveMetadata,
			loggedUser.accessToken
		)
			.then((res) => {
				if (res.status === 204) {
					setSuccess(true);
				}
			})
			.catch((error) => {
				setSuccess(false);
				alertError({
					error: error,
					customMessage: "Could not save user metadata.",
				});
			});
	}

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
		if (
			user.fecha_nacimiento != null &&
			isNaN(Date.parse(user.fecha_nacimiento))
		) {
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
			postUser(saveUser, loggedUser.accessToken)
				.then((res) => {
					if (res.status === 201) {
						if (user.app_metadata.length) {
							saveUserMetadata(res.data.id);
						}
						if (
							user.owned_entities.length ||
							user.managed_entities.length
						) {
							handleOwnedEntitiesAssignment(res.data.id);
							handleManagedEntitiesAssignment(res.data.id);
							handleAppAssignment(res.data.id);
						}
						if ({ ...success }) {
							alertSuccess({
								title: "Saved!",
								customMessage: "User successfully created.",
							});
							history.push("/users");
						}
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
			updateUser(userId, saveUser, loggedUser.accessToken)
				.then((res) => {
					if (res.status === 204) {
						if (user.app_metadata.length) {
							saveUserMetadata(userId);
						}
						handleOwnedEntitiesAssignment(userId);
						handleManagedEntitiesAssignment(userId);
						handleAppAssignment(userId);
						if ({ ...success }) {
							alertSuccess({
								title: "Saved!",
								customMessage: "User successfully saved.",
							});
							history.push("/users");
						}
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
					setEntities(res.data);
					setApps(getAppsRelatedToEntities(res.data));
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get entities.",
				});
			});
		getAppMetadata("404eb47a-4b1c-408a-fcb7-08db4575ec5a")
			.then((res) => {
				if (res.status === 200) {
					setAppMetadata(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get app metadata.",
				});
			});
		if (!userId) {
			disableLoadingData();
			return;
		}
		getUserById(userId, loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					let roleId = res.data.role.id;
					let user = res.data;

					user.fecha_nacimiento = user.fecha_nacimiento.substring(
						0,
						user.fecha_nacimiento.lastIndexOf("T")
					);

					if (user.fecha_nacimiento === "0001-01-01")
						user.fecha_nacimiento = null;
					if (user.last_login === "0001-01-01T00:00:00")
						user.last_login = null;

					delete user.role;
					user.user_rol_id = roleId;
					user.owned_entities = user.owned_entities.map((e) => e.id);
					user.managed_entities = user.managed_entities.map(
						(e) => e.id
					);
					user.apps = user.apps.map((e) => e.id);

					setInitialAssignedEntities(user.owned_entities);
					setInitialManagedEntities(user.managed_entities);
					setInitialAssignedApps([...user.apps]);
					setUser(user);
					setInitialAppMetadata(user.app_metadata);

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

	function getPermittedApps() {
		if (apps != null) {
			let userEntities = [
				...user.owned_entities,
				...user.managed_entities,
			];
			let result = apps.filter((x) => userEntities.includes(x.entity_id));

			return result;
		}
		return null;
	}

	const handleChange = (element) => (event) => {
		let text = event.target.value;
		if (
			!element.includes("entities") &&
			!element.includes("apps") &&
			event.target.value.trim() == ""
		)
			text = null;
		setUser({ ...user, [element]: text });
	};

	const handleChangeMetadata = (element, app_metadata_id) => (event) => {
		let metadataUser = [...user.app_metadata];
		if (
			metadataUser.filter((u) => u.app_metadata_id === app_metadata_id)
				.length === 0
		) {
			let whichMetadata = appMetadata.find(
				(a) => a.app_metadata_id == app_metadata_id
			);
			metadataUser.push({
				app_metadata_id: app_metadata_id,
				app_id: whichMetadata.app_id,
				metadata_tipo_id: whichMetadata.metadata_tipo_id,
				metadata_es_respuesta_abierta:
					whichMetadata.metadata_es_respuesta_abierta,
				metadata_valor_abierto: "",
				metadata_valor_select: "",
				metadata_valor_select_id: null,
			});
		}

		if (element === "metadata_valor_select") {
			metadataUser.find(
				(u) => u.app_metadata_id == app_metadata_id
			).metadata_valor_select_id = event.target.value;
			let value = appMetadata
				.find((a) => a.app_metadata_id == app_metadata_id)
				.metadata_select_values.find((u) => u.id == event.target.value)
				.meta_valor_select;
			metadataUser.find((u) => u.app_metadata_id == app_metadata_id)[
				element
			] = value;
		} else {
			metadataUser.find((u) => u.app_metadata_id == app_metadata_id)[
				element
			] = event.target.value;
		}
		setUser({ ...user, ["app_metadata"]: metadataUser });
	};

	function getMetadataValue(attribute, app_metadata_id) {
		let value = "";
		if (user.app_metadata.length) {
			let found = user.app_metadata.find(
				(u) => u.app_metadata_id == app_metadata_id
			);
			if (attribute === "metadata_valor_select_id") {
				if (found != undefined) value = found.metadata_valor_select_id;
			} else {
				if (found != undefined) value = found.metadata_valor_abierto;
			}
		}

		return value;
	}

	function renderMetadataFields() {
		return (
			<>
				<div className="row">
					{appMetadata?.length > 0 &&
						appMetadata.map((attribute) => {
							if (attribute.metadata_es_respuesta_abierta) {
								return (
									<>
										<div className="col-6">
											<TextField
												id={attribute}
												defaultValue={getMetadataValue(
													"metadata_valor_abierto",
													attribute.app_metadata_id
												)}
												label={
													attribute.metadata_nombre
												}
												onChange={handleChangeMetadata(
													"metadata_valor_abierto",
													attribute.app_metadata_id
												)}
												InputLabelProps={{
													shrink: true,
												}}
												margin="normal"
												variant="outlined"
											/>
										</div>
									</>
								);
							} else {
								return (
									<>
										<div className="col-6">
											<FormControl
												style={{ width: "100%" }}
											>
												<InputLabel id="demo-simple-select-standard-label">
													{attribute.metadata_nombre}
												</InputLabel>
												<Select
													labelId="demo-simple-select-standard-label"
													id="demo-simple-select-standard"
													defaultValue={getMetadataValue(
														"metadata_valor_select_id",
														attribute.app_metadata_id
													)}
													onChange={handleChangeMetadata(
														"metadata_valor_select",
														attribute.app_metadata_id
													)}
													MenuProps={MenuProps}
												>
													{attribute.metadata_select_values?.map(
														(option) => (
															<MenuItem
																key={option.id}
																value={
																	option.id
																}
															>
																{
																	option.meta_valor_select
																}
															</MenuItem>
														)
													)}
												</Select>
											</FormControl>

											<br />
											<br />
										</div>
									</>
								);
							}
						})}
				</div>
			</>
		);
	}

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title={myProfile ? "Edit profile" : "Edit user"}></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-4 gx-3">
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
							</div>
							<div className="col-4 gx-3">
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
							</div>
							<div className="col-4 gx-3">
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
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<TextField
									id={`codigoHexa`}
									label="Código"
									value={user.codigo_hexa}
									onChange={handleChange("codigo_hexa")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									disabled={true}
								/>
							</div>
							<div className="col-4 gx-3">
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
							</div>
							<div className="col-4 gx-3">
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
							</div>
						</div>
						{!userId && (
							<>
								<br />
								<div className="row">
									<div className="col w-25 gx-3">
										<TextField
											id={`password`}
											label="Password"
											value={newPassword.password}
											onChange={(event) => {
												if (event.target.value !== " ")
													setNewPassword({
														...newPassword,
														password:
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
									</div>
									<div className="col w-25 gx-3">
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
									</div>
								</div>
								<br />
							</>
						)}
						<div className="row">
							<div className="col-4 gx-3">
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
											<MenuItem
												key={option.id}
												value={option.id}
											>
												{option.descripcion}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>
										Select a role
									</FormHelperText>
								</FormControl>
							</div>
							<div className="col-4 gx-3">
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
							<div className="col-4 gx-3">
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
						<br />
						<div className="row">
							<div className="col-4 gx-3">
								<FormControl style={{ width: "100%" }}>
									<InputLabel id="demo-simple-select-standard-label">
										Entidades propietarias
									</InputLabel>
									<Select
										labelId="demo-simple-select-standard-label"
										id="demo-simple-select-standard"
										value={user.owned_entities || ""}
										multiple
										onChange={handleChange(
											"owned_entities"
										)}
										MenuProps={MenuProps}
									>
										{entities?.map((option) => (
											<MenuItem
												key={option.id}
												value={option.id}
											>
												{option.nombre}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>
										Select entities
									</FormHelperText>
								</FormControl>
							</div>
							<div className="col-4 gx-3">
								<FormControl style={{ width: "100%" }}>
									<InputLabel id="demo-simple-select-standard-label">
										Entidades gestionadas
									</InputLabel>
									<Select
										labelId="demo-simple-select-standard-label"
										id="demo-simple-select-standard"
										value={user.managed_entities || ""}
										multiple
										onChange={handleChange(
											"managed_entities"
										)}
										MenuProps={MenuProps}
									>
										{entities?.map((option) => (
											<MenuItem
												key={option.id}
												value={option.id}
											>
												{option.nombre}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>
										Select entities
									</FormHelperText>
								</FormControl>
							</div>
							<div className="col-4 gx-3">
								<FormControl style={{ width: "100%" }}>
									<InputLabel id="demo-simple-select-standard-label">
										Apps asignadas
									</InputLabel>
									<Select
										labelId="demo-simple-select-standard-label"
										id="demo-simple-select-standard"
										value={user.apps || ""}
										multiple
										onChange={handleChange("apps")}
										MenuProps={MenuProps}
									>
										{getPermittedApps()?.map((option) => (
											<MenuItem
												key={option.id}
												value={option.id}
											>
												{option.nombre}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>Select apps</FormHelperText>
								</FormControl>
							</div>
						</div>
					</CardBody>
				</Card>
				<Card>
					<CardHeader title="Additional information"></CardHeader>
					<CardBody>{renderMetadataFields()}</CardBody>
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
			</>
		);
}
