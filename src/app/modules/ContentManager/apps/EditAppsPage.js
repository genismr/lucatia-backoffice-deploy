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
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { checkIsEmpty } from "../../../../utils/helpers";
import {
	postApp,
	getAppById,
	updateApp,
	deleteApp,
	assignEntities,
	unassignEntities,
	changeEntityOwnership
} from "../../../../api/app";
import { getEntities } from "../../../../api/entity";

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

function getEmptyApp() {
	return {
		id: "",
		nombre: "",
		descripcion: "",
		icono_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
		banner_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
		fecha_alta: "",
		user_alta_id: "",
		ownedEntities: [],
		delegatedEntities: [],
	};
}

function getData(app) {
	let data = {};

	data.id = app.id;
	data.nombre = app.nombre;
	data.descripcion = app.descripcion;
	data.icono_id = app.icono_id;
	data.banner_id = app.banner_id;
	data.fecha_alta = app.fecha_alta;
	data.user_alta_id = app.user_alta_id;
	data.ownedEntities = app.ownedEntities.map((e) => e.id);
	data.delegatedEntities = app.delegatedEntities.map((e) => e.id);

	return data;
}

export default function EditAppsPage() {
	const [app, setApp] = useState(getEmptyApp());
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

	const [entities, setEntities] = useState(null);

	const [initialOwnedEntities, setInitialOwnedEntities] = useState(null);
	const [initialDelegatedEntities, setInitialDelegatedEntities] = useState(
		null
	);

	const appId = useParams().id;
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

	useEffect(() => {
		getEntities(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setEntities(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get app.",
				});
				history.push("/apps");
			});
		if (!appId) {
			disableLoadingData();
			return;
		}
		getAppById(appId)
			.then((res) => {
				if (res.status === 200) {
					setInitialOwnedEntities(
						res.data.ownedEntities.map((e) => e.id)
					);
					setInitialDelegatedEntities(
						res.data.delegatedEntities.map((e) => e.id)
					);
					setApp(getData(res.data));
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get app.",
				});
				history.push("/apps");
			});
	}, [appId, disableLoadingData, history]);

	function checkEntitySelectionOverlap() {
		return (
			app.ownedEntities.filter((e) => app.delegatedEntities.includes(e))
				.length > 0
		);
	}

	function handleEntitiesAssignment(assignedAppId) {
		let newOwnedEntities = app.ownedEntities;
		if (initialOwnedEntities != null) {
			newOwnedEntities = app.ownedEntities.filter(
				(e) =>
					!initialOwnedEntities.includes(e) &&
					!app.delegatedEntities.includes(e)
			);
		}

		let newDelegatedEntities = app.delegatedEntities;
		if (initialDelegatedEntities != null) {
			newDelegatedEntities = app.delegatedEntities.filter(
				(e) =>
					!initialDelegatedEntities.includes(e) &&
					!app.ownedEntities.includes(e)
			);
		}

		let newAssignedEntities = newOwnedEntities.concat(newDelegatedEntities);
		let newAssignedEntitiesBody = [];

		for (let i = 0; i < newAssignedEntities.length; ++i) {
			const elem = {};
			elem.entidad_id = newAssignedEntities[i];
			elem.es_propietaria = newOwnedEntities.includes(
				newAssignedEntities[i]
			)
				? true
				: false;
			elem.fecha_alta = new Date();
			elem.user_alta_id = loggedUser.userID;

			newAssignedEntitiesBody = newAssignedEntitiesBody.concat(elem);
		}

		if (!appId || newAssignedEntities.length) {
			assignEntities(assignedAppId, newAssignedEntitiesBody)
				.then((res) => {
					if (res.status === 200) {
						alertSuccess({
							title: "Saved!",
							customMessage: "App successfully saved.",
						});
						history.push("/apps");
					}
				})
				.catch((error) => {
					deleteApp(assignedAppId);
					alertError({
						error: error,
						customMessage: "Could not assign entities.",
					});
				});
		}

		let ownedToDelegated =
			initialOwnedEntities != null
				? initialOwnedEntities.filter((value) =>
						app.delegatedEntities.includes(value)
				  )
				: null;
		let delegatedToOwned =
			initialDelegatedEntities != null
				? initialDelegatedEntities.filter((value) =>
						app.ownedEntities.includes(value)
				  )
				: null;

		let changedEntities = null;

		if (ownedToDelegated != null) {
			if (delegatedToOwned != null) {
				changedEntities = ownedToDelegated.concat(delegatedToOwned);
			} else {
				changedEntities = ownedToDelegated;
			}
		} else {
			if (delegatedToOwned != null) {
				changedEntities = delegatedToOwned;
			}
		}

		if (changedEntities != null) {
			changeEntityOwnership(assignedAppId, changedEntities)
				.then((res) => {
					if (res.status === 200) {
						alertSuccess({
							title: "Saved!",
							customMessage: "App successfully saved.",
						});
						history.push("/apps");
					}
				})
				.catch((error) => {
					deleteApp(assignedAppId);
					alertError({
						error: error,
						customMessage: "Could not assign entities.",
					});
				});
		}

		let unassignedOwned = [];
		if (initialOwnedEntities != null) {
			unassignedOwned = initialOwnedEntities.filter(
				(value) =>
					!app.ownedEntities.includes(value) &&
					!app.delegatedEntities.includes(value)
			);
		}
		let unassignedDelegated = [];

		if (initialDelegatedEntities != null) {
			unassignedDelegated = initialDelegatedEntities.filter(
				(value) =>
					!app.ownedEntities.includes(value) &&
					!app.delegatedEntities.includes(value)
			);
		}
		
		let unassignedEntities = unassignedOwned.concat(unassignedDelegated);

		if (unassignedEntities.length) {
			unassignEntities(assignedAppId, unassignedEntities).then((res) => {
				if (res.status === 204) {
					alertSuccess({
						title: "Saved!",
						customMessage: "App successfully saved.",
					});
					history.push("/apps");
				}
			}).catch((error) => {
				deleteApp(assignedAppId);
				alertError({
					error: error,
					customMessage: "Could not assign entities.",
				});
			});
		}
	}

	function saveApp() {
		if (checkIsEmpty(app.nombre)) {
			alertError({
				error: null,
				customMessage: "Nombre is required",
			});
			return;
		}

		if (checkEntitySelectionOverlap()) {
			alertError({
				error: null,
				customMessage:
					"An entity cannot own and have delegated access at the same time",
			});
			return;
		}

		let saveApp = app;
		if (!appId) {
			saveApp.fecha_alta = new Date();
			saveApp.user_alta_id = loggedUser.userID;
			postApp(saveApp)
				.then((res) => {
					if (res.status === 201) {
						handleEntitiesAssignment(res.data.id);
						/*alertSuccess({
							title: "Saved!",
							customMessage: "App successfully created.",
						});
						history.push("/apps");*/
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save app.",
					});
				});
		} else {
			updateApp(appId, saveApp)
				.then((res) => {
					if (res.status === 204) {
						handleEntitiesAssignment(appId);
						/*alertSuccess({
							title: "Saved!",
							customMessage: "App successfully saved.",
						});
						history.push("/apps");*/
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

	const handleChange = (element) => (event) => {
		let text = event.target.value;
		setApp({ ...app, [element]: text });
	};

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit app"></CardHeader>
					<CardBody>
						<TextField
							id={`nombre`}
							label="Nombre"
							value={app.nombre}
							onChange={handleChange("nombre")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
							required
						/>
						<br />
						<br />
						<TextField
							id={`descripcion`}
							label="Descripción"
							value={app.descripcion}
							onChange={handleChange("descripcion")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<br />
						<br />
						<FormControl style={{ width: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Entidades propietarias
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={app.ownedEntities || ""}
								multiple
								onChange={handleChange("ownedEntities")}
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
						<br />
						<br />
						<FormControl style={{ width: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Entidades con acceso delegado
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={app.delegatedEntities || ""}
								multiple
								onChange={handleChange("delegatedEntities")}
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
					onClick={() => history.push("/apps")}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				<Button
					onClick={() => saveApp()}
					variant="outlined"
					color="primary"
					style={{ marginRight: "20px" }}
				>
					Save app
				</Button>
				{appId && (
					<>
						<MuiThemeProvider theme={theme}>
							<Button
								onClick={() => setOpenConfirmDialog(true)}
								variant="outlined"
								color="secondary"
							>
								Delete app
							</Button>
						</MuiThemeProvider>

						<ConfirmDialog
							title={"Are you sure you want to delete this app?"}
							open={openConfirmDialog}
							setOpen={setOpenConfirmDialog}
							onConfirm={() => {
								deleteApp(appId)
									.then((res) => {
										if (
											res.status === 204 ||
											res.status === 200
										) {
											alertSuccess({
												title: "Deleted!",
												customMessage:
													"App deleted successfully",
											});
											history.push("/apps");
										}
									})
									.catch((error) => {
										alertError({
											error: error,
											customMessage:
												"Could not delete app.",
										});
									});
							}}
						/>
					</>
				)}
			</>
		);
}
