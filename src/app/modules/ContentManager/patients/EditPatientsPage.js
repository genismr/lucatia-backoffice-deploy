import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	CardHeaderToolbar,
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
	Tooltip,
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
	getUserAssignedGames,
} from "../../../../api/user";
import { getEntities } from "../../../../api/entity";
import { getRoles } from "../../../../api/role";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { checkIsEmpty, userRoles } from "../../../../utils/helpers";
import { getAppMetadata } from "../../../../api/app";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import { getProvincias } from "../../../../api/provincia";
import Table, {
	buttonsStyle,
	booleanFormatter,
	dateFormatter,
} from "../../../components/tables/table";
import GameTableDialog from "../../../components/dialogs/GameTableDialog";
import { getGames } from "../../../../api/game";
import { Replay } from "@material-ui/icons";
import { postGameSession } from "../../../../api/game-session";

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

function getEmptyPatient() {
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
		provincia_id: null,
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

function getGameData(assignedGames) {
	let data = [];

	for (let i = 0; i < assignedGames.length; ++i) {
		const elem = {};

		elem.juego = assignedGames[i].juego.nombre;
		elem.preescriptor =
			assignedGames[i].asignado_por.nombre +
			" " +
			assignedGames[i].asignado_por.apellidos;
		elem.fechaAsignado = assignedGames[i].fecha_asignado;
		elem.fechaInicio = assignedGames[i].fecha_inicio;
		elem.fechaFin = assignedGames[i].fecha_fin;
		elem.jugado = assignedGames[i].jugado;
		elem.id = assignedGames[i].id;

		data = data.concat(elem);
	}

	return data;
}

export default function EditPatientsPage() {
	const [patient, setPatient] = useState(getEmptyPatient());
	const [games, setGames] = useState([]);

	const [newPassword, setNewPassword] = useState({
		password: null,
		repeatPassword: null,
	});

	const [assignedGames, setAssignedGames] = useState([]);
	const [selectedSession, setSelectedSession] = useState([]);

	const [openTableDialog, setOpenTableDialog] = useState(null);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);

	const [roles, setRoles] = useState(null);
	const [entities, setEntities] = useState(null);
	const [apps, setApps] = useState(null);
	const [provincias, setProvincias] = useState([]);

	const [appMetadata, setAppMetadata] = useState(null);

	const [initialAppMetadata, setInitialAppMetadata] = useState(null);

	const [initialAssignedEntities, setInitialAssignedEntities] = useState(
		null
	);
	const [initialManagedEntities, setInitialManagedEntities] = useState(null);
	const [initialAssignedApps, setInitialAssignedApps] = useState(null);

	const [success, setSuccess] = useState(false);

	const patientId = useParams().id;
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
				loggedUser.role.rango == userRoles.SUPER_ADMIN ||
				roles[i].rango > loggedUser.role.rango
			) {
				let elem = {};
				elem.id = roles[i].id;
				elem.descripcion = roles[i].descripcion;
				elem.rango = roles[i].rango;

				data = data.concat(elem);
			}
		}

		return data;
	}

	function handleOwnedEntitiesAssignment(assignedUserId) {
		let newAssignedEntities = patient.owned_entities;
		if (initialAssignedEntities != null) {
			newAssignedEntities = patient.owned_entities.filter(
				(e) => !initialAssignedEntities.includes(e)
			);
		}

		if (!patientId || newAssignedEntities.length) {
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
					if (!patientId) deleteUser(assignedUserId);
					alertError({
						error: error,
						customMessage: "Could not save user.",
					});
				});
		}

		let unassignedEntities = null;
		if (initialAssignedEntities != null)
			unassignedEntities = initialAssignedEntities.filter(
				(e) => !patient.owned_entities.includes(e)
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
		let newAssignedEntities = patient.managed_entities;
		if (initialManagedEntities != null) {
			newAssignedEntities = patient.managed_entities.filter(
				(e) => !initialManagedEntities.includes(e)
			);
		}

		if (!patientId || newAssignedEntities.length) {
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
					if (!patientId) deleteUser(assignedUserId);
					alertError({
						error: error,
						customMessage: "Could not save user.",
					});
				});
		}

		let unassignedEntities = null;
		if (initialManagedEntities != null)
			unassignedEntities = initialManagedEntities.filter(
				(e) => !patient.managed_entities.includes(e)
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

		for (
			let i = 0;
			patient.apps != undefined && i < patient.apps.length;
			++i
		) {
			if (!permittedApps.find((x) => x.id == patient.apps[i]))
				patient.apps.splice(i, 1);
		}

		let newAssignedApps = patient.apps;
		if (initialAssignedApps != null) {
			newAssignedApps = patient.apps.filter(
				(e) => !initialAssignedApps.includes(e)
			);
		}

		if (!patientId || newAssignedApps.length) {
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
					if (!patientId) deleteUser(assignedUserId);
					alertError({
						error: error,
						customMessage: "Could not save user.",
					});
				});
		}

		let unassignedApps = null;
		if (initialAssignedApps != null)
			unassignedApps = initialAssignedApps.filter(
				(e) => !patient.apps.includes(e)
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

	function savePatientMetadata(metadataUserId) {
		let saveNewMetadata = patient.app_metadata;
		if (initialAppMetadata != null) {
			saveNewMetadata = patient.app_metadata.filter(
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

		let saveMetadata = patient.app_metadata.filter(
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

	function savePatient() {
		if (checkIsEmpty(patient.nombre) || checkIsEmpty(patient.email)) {
			alertError({
				error: null,
				customMessage: "Some required fields are missing",
			});
			return;
		}
		if (
			patient.fecha_nacimiento != null &&
			isNaN(Date.parse(patient.fecha_nacimiento))
		) {
			alertError({
				error: null,
				customMessage: "Invalid date format",
			});
			return;
		}

		let savePatient = patient;
		if (!patientId) {
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
			savePatient = { ...savePatient, password: newPassword.password };
		}

		if (!patientId) {
			savePatient.user_rol_id = roles.find((x) => x.rango === 30).id;
			postUser(savePatient, loggedUser.accessToken)
				.then((res) => {
					if (res.status === 201) {
						if (patient.app_metadata.length) {
							savePatientMetadata(res.data.id);
						}
						if (
							patient.owned_entities.length ||
							patient.managed_entities.length
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
							history.push("/patients");
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
			updateUser(patientId, savePatient, loggedUser.accessToken)
				.then((res) => {
					if (res.status === 204) {
						if (patient.app_metadata.length) {
							savePatientMetadata(patientId);
						}
						handleOwnedEntitiesAssignment(patientId);
						handleManagedEntitiesAssignment(patientId);
						handleAppAssignment(patientId);
						if ({ ...success }) {
							alertSuccess({
								title: "Saved!",
								customMessage: "User successfully saved.",
							});
							history.push("/patients");
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
				history.push("/patients");
			});
		getProvincias()
			.then((res) => {
				if (res.status === 200) {
					setProvincias(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get provincias.",
				});
				history.push("/patients");
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
		getAppMetadata(
			"404eb47a-4b1c-408a-fcb7-08db4575ec5a",
			loggedUser.accessToken
		)
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
		if (!patientId) {
			disableLoadingData();
			return;
		}
		getGames()
			.then((res) => {
				if (res.status === 200) {
					setGames(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get games.",
				});
			});
		getUserAssignedGames(patientId, loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setAssignedGames(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get assigned games.",
				});
			});
		getUserById(patientId, loggedUser.accessToken)
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

					user.provincia_id = user.provincia
						? user.provincia.id
						: null;
					delete user.provincia;

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
					setPatient(user);
					setInitialAppMetadata(user.app_metadata);

					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get user.",
				});
				history.push("/patients");
			});
	}, [patientId, disableLoadingData, history]);

	function getPermittedApps() {
		if (apps != null) {
			let userEntities = [
				...patient.owned_entities,
				...patient.managed_entities,
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
		setPatient({ ...patient, [element]: text });
	};

	const handleChangeMetadata = (element, app_metadata_id) => (event) => {
		let metadataUser = [...patient.app_metadata];
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
		setPatient({ ...patient, ["app_metadata"]: metadataUser });
	};

	function getMetadataValue(attribute, app_metadata_id) {
		let value = "";
		if (patient.app_metadata.length) {
			let found = patient.app_metadata.find(
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

	function buttonFormatter(cell) {
		const elem = assignedGames.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title="Assign again">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							setSelectedSession(elem);
							setOpenConfirmDialog(true);
						}}
					>
						<Replay />
					</Button>
				</Tooltip>
			</>
		);
	}

	const columns = [
		{
			dataField: "juego",
			text: "Juego",
			sort: true,
		},
		{
			dataField: "preescriptor",
			text: "Preescriptor",
			sort: true,
		},
		{
			dataField: "fechaAsignado",
			text: "Asignado",
			sort: true,
			formatter: dateFormatter,
		},
		{
			dataField: "jugado",
			text: "Jugado",
			sort: true,
			formatter: booleanFormatter,
		},
		{
			dataField: "id",
			text: "",
			formatter: buttonFormatter,
		},
	];

	function reAssignGameSession() {
		let saveSession = [
			{
				juego_id: selectedSession.juego.id,
				asignado_a: selectedSession.asignado_a.id,
				asignado_por: selectedSession.asignado_por.id,
			},
		];
		postGameSession(saveSession)
			.then((res) => {
				if (res.status === 201) {
					alertSuccess({
						title: "Saved!",
						customMessage: "Session successfully created.",
					});
					let newAssignedGames = [...assignedGames];
					newAssignedGames = newAssignedGames.concat(res.data);
					setAssignedGames(newAssignedGames);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not save session.",
				});
			});
	}

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit patient"></CardHeader>
					<CardBody>
						<form autoComplete="off">
							<div className="row">
								<div className="col-4 gx-3">
									<TextField
										id={`nombre`}
										label="Nombre"
										value={patient?.nombre || ""}
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
										value={patient?.apellidos || ""}
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
										value={patient?.email || ""}
										onChange={handleChange("email")}
										InputLabelProps={{
											shrink: true,
										}}
										margin="normal"
										variant="outlined"
										required
										disabled={patientId}
									/>
								</div>
							</div>
							<div className="row">
								<div className="col-4 gx-3">
									<TextField
										id={`codigo`}
										label="Código"
										value={patient?.codigo_hexa || ""}
										onChange={handleChange("nombre")}
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
										value={patient?.telefono || ""}
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
										id={`fecha`}
										label="Fecha de nacimiento"
										value={patient?.fecha_nacimiento}
										onChange={handleChange(
											"fecha_nacimiento"
										)}
										InputLabelProps={{
											shrink: true,
										}}
										type="date"
										margin="normal"
										variant="outlined"
									/>
								</div>
							</div>
						</form>
						{!patientId && (
							<>
								<br />
								<div className="row">
									<div className="col-6 gx-3">
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
											autoComplete="off"
										/>
									</div>
									<div className="col-6 gx-3">
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
											autoComplete="off"
										/>
									</div>
								</div>
								<br />
							</>
						)}
						<div className="row">
							<div className="col-6 gx-3">
								<TextField
									id={`direccion`}
									label="Dirección"
									value={patient.direccion}
									onChange={handleChange("direccion")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
							<div className="col-6 gx-3">
								<TextField
									id={`poblacion`}
									label="Población"
									value={patient.poblacion}
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
									value={patient.cp}
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
										(x) => x.id === patient?.provincia_id
									)}
									onChange={(event, selected) => {
										setPatient({
											...patient,
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
									value={patient.pais}
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
						<div className="row">
							<div className="col-6 gx-3">
								<Autocomplete
									id="autocomplete-owned-entities"
									multiple
									disableCloseOnSelect
									options={entities}
									getOptionLabel={(option) => option.nombre}
									value={entities?.filter((x) =>
										patient.owned_entities.includes(x.id)
									)}
									filterSelectedOptions
									onChange={(event, selected) => {
										setPatient({
											...patient,
											owned_entities: selected.map(
												(x) => x.id
											),
										});
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Entidades propietarias"
											placeholder="Entidades"
											InputLabelProps={{
												shrink: true,
											}}
											margin="normal"
											variant="outlined"
										/>
									)}
								/>
							</div>
							<div className="col-6 gx-3">
								<Autocomplete
									id="autocomplete-assigned-apps"
									multiple
									disableCloseOnSelect
									options={getPermittedApps()}
									getOptionLabel={(option) => option.nombre}
									value={
										getPermittedApps()?.filter((x) =>
											patient.apps.includes(x.id)
										) || ""
									}
									filterSelectedOptions
									onChange={(event, selected) => {
										setPatient({
											...patient,
											apps: selected.map((x) => x.id),
										});
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Apps asignadas"
											placeholder="Apps"
											InputLabelProps={{
												shrink: true,
											}}
											margin="normal"
											variant="outlined"
										/>
									)}
								/>
							</div>
						</div>
					</CardBody>
				</Card>
				<Card>
					<CardHeader title="Additional information"></CardHeader>
					<CardBody>{renderMetadataFields()}</CardBody>
				</Card>
				<Card>
					<CardHeader title="Assigned games">
						<CardHeaderToolbar>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => setOpenTableDialog(true)}
							>
								Assign new
							</button>
						</CardHeaderToolbar>
					</CardHeader>
					<CardBody>
						{assignedGames.length > 0 && (
							<Table
								data={getGameData(assignedGames)}
								columns={columns}
							/>
						)}
					</CardBody>
				</Card>
				<GameTableDialog
					open={openTableDialog}
					setOpen={setOpenTableDialog}
					data={games}
					patient={patientId}
					onCreate={(data) => {
						let newAssignedGames = [...assignedGames];
						newAssignedGames = newAssignedGames.concat(data);
						setAssignedGames(newAssignedGames);
					}}
				/>
				<ConfirmDialog
					title={"Are you sure you want to reassign this game?"}
					open={openConfirmDialog}
					setOpen={setOpenConfirmDialog}
					onConfirm={() => {
						reAssignGameSession();
					}}
				/>
				<Button
					onClick={() => history.push("/patients")}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				<Button
					onClick={() => savePatient()}
					variant="outlined"
					color="primary"
					style={{ marginRight: "20px" }}
				>
					Save user
				</Button>
			</>
		);
}
