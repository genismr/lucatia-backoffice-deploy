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
	Tooltip,
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
	changeEntityOwnership,
} from "../../../../api/app";
import {
	getAssets,
	getCategories,
	getExtensions,
	getFormats,
	getTags,
	getTypes,
} from "../../../../api/asset";
import { getEntities } from "../../../../api/entity";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import AddResourceIcon from "@material-ui/icons/AddPhotoAlternate";
import AssetTableDialog from "../../../components/dialogs/AssetTableDialog";
import PreviewDialog from "../../../components/dialogs/PreviewDialog";
import { Visibility } from "@material-ui/icons";

// Create theme for delete button (red)
const theme = createMuiTheme({
	palette: {
		secondary: {
			main: "#F64E60",
		},
	},
});

function getEmptyApp() {
	return {
		id: "",
		nombre: "",
		descripcion: "",
		tecnologia: null,
		icono_id: null,
		banner_id: null,
		fecha_alta: "",
		user_alta_id: "",
		ownedEntities: [],
		delegatedEntities: [],
		activo: true,
	};
}

function getData(app) {
	let data = {};

	data.id = app.id;
	data.nombre = app.nombre;
	data.descripcion = app.descripcion;
	data.icono_id = app.icono?.id;
	data.banner_id = app.banner?.id;
	data.fecha_alta = app.fecha_alta;
	data.user_alta_id = app.user_alta_id;
	data.ownedEntities = app.ownedEntities.map((e) => e.id);
	data.delegatedEntities = app.delegatedEntities.map((e) => e.id);
	data.tecnologia = app.tecnologia;
	data.activo = app.activo;

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

	const [iconSelected, setIconSelected] = useState(null);
	const [bannerSelected, setBannerSelected] = useState(null);

	const [openAssetTableDialog, setOpenAssetTableDialog] = useState(null);
	const [openPreviewDialog, setOpenPreviewDialog] = useState(null);
	const [previewFile, setPreviewFile] = useState(null);

	const [assets, setAssets] = useState([]);
	const [types, setTypes] = useState(null);
	const [categories, setCategories] = useState(null);
	const [formats, setFormats] = useState(null);
	const [extensions, setExtensions] = useState(null);
	const [tags, setTags] = useState(null);

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
		getTypes()
			.then((res) => {
				if (res.status === 200) {
					setTypes(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get assets.",
				});
				history.push("/apps");
			});
		getCategories()
			.then((res) => {
				if (res.status === 200) {
					setCategories(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get assets.",
				});
				history.push("/apps");
			});
		getFormats()
			.then((res) => {
				if (res.status === 200) {
					setFormats(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get assets.",
				});
				history.push("/apps");
			});
		getExtensions()
			.then((res) => {
				if (res.status === 200) {
					setExtensions(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get assets.",
				});
				history.push("/apps");
			});
		getTags()
			.then((res) => {
				if (res.status === 200) {
					setTags(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get assets.",
				});
				history.push("/apps");
			});
		getAssets(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setAssets(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get assets.",
				});
				history.push("/apps");
			});
		if (!appId) {
			disableLoadingData();
			return;
		}
		getAppById(appId, loggedUser.accessToken)
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
			assignEntities(
				assignedAppId,
				newAssignedEntitiesBody,
				loggedUser.accessToken
			)
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
					if (!appId)
						deleteApp(assignedAppId, loggedUser.accessToken);
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
			changeEntityOwnership(
				assignedAppId,
				changedEntities,
				loggedUser.accessToken
			)
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
					if (!appId)
						deleteApp(assignedAppId, loggedUser.accessToken);
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
			unassignEntities(
				assignedAppId,
				unassignedEntities,
				loggedUser.accessToken
			)
				.then((res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage: "App successfully saved.",
						});
						history.push("/apps");
					}
				})
				.catch((error) => {
					if (!appId)
						deleteApp(assignedAppId, loggedUser.accessToken);
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
			postApp(saveApp, loggedUser.accessToken)
				.then((res) => {
					if (res.status === 201) {
						handleEntitiesAssignment(res.data.id);
						alertSuccess({
							title: "Saved!",
							customMessage: "App successfully created.",
						});
						history.push("/apps");
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save app.",
					});
				});
		} else {
			updateApp(appId, saveApp, loggedUser.accessToken)
				.then((res) => {
					if (res.status === 204) {
						handleEntitiesAssignment(appId);
						alertSuccess({
							title: "Saved!",
							customMessage: "App successfully saved.",
						});
						history.push("/apps");
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
						<div className="row">
							<div className="col-6 gx-3">
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
							</div>
							<div className="col-6 gx-3">
								<TextField
									id={`tecnologia`}
									label="Tecnología"
									value={app.tecnologia}
									onChange={handleChange("tecnologia")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
						</div>
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
						<div className="row">
							<div className="col-6 gx-3">
								<TextField
									id={`icon`}
									label="Icono"
									value={
										assets.find(
											(x) => x.id === app.icono_id
										)?.descripcion
									}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<>
													{app?.icono_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				app.icono_id
																		)?.url
																	);
																	setOpenPreviewDialog(
																		true
																	);
																}}
															>
																<Visibility />
															</Button>
														</Tooltip>
													)}
													<Tooltip title="Select image">
														<Button
															onClick={() => {
																setIconSelected(
																	true
																);
																setBannerSelected(
																	false
																);
																setOpenAssetTableDialog(
																	true
																);
															}}
														>
															<AddResourceIcon />
														</Button>
													</Tooltip>
												</>
											),
										})
									}
								/>
							</div>
							<div className="col-6 gx-3">
								<TextField
									id={`banner`}
									label="Banner"
									value={
										assets.find(
											(x) => x.id === app.banner_id
										)?.descripcion
									}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<>
													{app?.banner_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				app.banner_id
																		)?.url
																	);
																	setOpenPreviewDialog(
																		true
																	);
																}}
															>
																<Visibility />
															</Button>
														</Tooltip>
													)}
													<Tooltip title="Select image">
														<Button
															onClick={() => {
																setIconSelected(
																	false
																);
																setBannerSelected(
																	true
																);
																setOpenAssetTableDialog(
																	true
																);
															}}
														>
															<AddResourceIcon />
														</Button>
													</Tooltip>
												</>
											),
										})
									}
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
									value={entities.filter((x) =>
										app.ownedEntities.includes(x.id)
									)}
									filterSelectedOptions
									onChange={(event, selected) => {
										setApp({
											...app,
											ownedEntities: selected.map(
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
									id="autocomplete-owned-entities"
									multiple
									disableCloseOnSelect
									options={entities}
									getOptionLabel={(option) => option.nombre}
									value={entities.filter((x) =>
										app.delegatedEntities.includes(x.id)
									)}
									filterSelectedOptions
									onChange={(event, selected) => {
										setApp({
											...app,
											delegatedEntities: selected.map(
												(x) => x.id
											),
										});
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Entidades con acceso delegado"
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
						</div>
					</CardBody>
				</Card>
				<PreviewDialog
					title={"Preview file"}
					open={openPreviewDialog}
					setOpen={setOpenPreviewDialog}
					src={previewFile}
				/>
				<AssetTableDialog
					open={openAssetTableDialog}
					setOpen={setOpenAssetTableDialog}
					data={assets}
					type={types.find((x) => x.descripcion === "Imagen")}
					formats={formats}
					categories={categories}
					extensions={extensions}
					tags={tags}
					onSelectRow={(item) => {
						if (iconSelected) {
							setApp({
								...app,
								icono_id: item.id,
							});
							setIconSelected(null);
						} else if (bannerSelected) {
							setApp({
								...app,
								banner_id: item.id,
							});
							setBannerSelected(null);
						}
						setOpenAssetTableDialog(false);
					}}
					onAssetCreated={(item) => {
						let newAssets = [...assets];
						newAssets.push(item);
						setAssets(newAssets);
						if (iconSelected) {
							setApp({
								...app,
								icono_id: item.id,
							});
						} else if (bannerSelected) {
							setApp({
								...app,
								banner_id: item.id,
							});
						}
					}}
				/>
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
			</>
		);
}
