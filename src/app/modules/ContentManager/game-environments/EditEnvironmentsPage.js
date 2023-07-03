import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import { Button, TextField, Tooltip } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import {
	checkIsEmpty,
	getFromSession,
	storeToSession,
} from "../../../../utils/helpers";
import { getEntities } from "../../../../api/entity";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import Table, { buttonsStyle } from "../../../components/tables/table";
import EditIcon from "@material-ui/icons/Edit";
import {
	getGameEnvironmentActivities,
	getGameEnvironmentById,
	postGameEnvironment,
	updateGameEnvironment,
} from "../../../../api/game-environment";
import Editor from "../../../components/editor/Editor";
import {
	getAssets,
	getCategories,
	getExtensions,
	getFormats,
	getTags,
	getTypes,
} from "../../../../api/asset";
import AddResourceIcon from "@material-ui/icons/AddPhotoAlternate";
import { Visibility, VolumeUp } from "@material-ui/icons";
import AssetTableDialog from "../../../components/dialogs/AssetTableDialog";
import PreviewDialog from "../../../components/dialogs/PreviewDialog";

function getEmptyEnvironment() {
	return {
		juego_id: "",
		nombre: "",
		descripcion: null,
		icono_id: null,
		amb_texto: "",
		amb_audio_id: "",
		amb_imagen_id: "",
	};
}

function getData(activities) {
	let data = [];
	for (let i = 0; i < activities.length; ++i) {
		const elem = {};

		elem.nombre = activities[i].nombre;
		elem.descripcion = activities[i].descripcion;
		elem.icono = activities[i].icono?.id;
		elem.id = activities[i].id;

		data = data.concat(elem);
	}

	return data;
}

export default function EditEnvironmentsPage() {
	const [environment, setEnvironment] = useState(getEmptyEnvironment());
	const [activities, setActivities] = useState([]);
	const [assets, setAssets] = useState([]);

	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewFile, setPreviewFile] = useState(null);
	const [openTableDialog, setOpenTableDialog] = useState(false);

	const [types, setTypes] = useState(null);
	const [categories, setCategories] = useState(null);
	const [formats, setFormats] = useState(null);
	const [extensions, setExtensions] = useState(null);
	const [tags, setTags] = useState(null);

	const [iconSelected, setIconSelected] = useState(null);
	const [audioSelected, setAudioSelected] = useState(null);
	const [imageSelected, setImageSelected] = useState(null);

	const gameId = getFromSession("game").id;

	const environmentId = useParams().id;
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
				history.push("/edit-game/" + gameId);
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
				history.push("/edit-game/" + gameId);
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
				history.push("/edit-game/" + gameId);
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
				history.push("/edit-game/" + gameId);
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
				history.push("/edit-game/" + gameId);
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
				history.push("/edit-game/" + gameId);
			});
		if (!environmentId) {
			disableLoadingData();
			return;
		}
		getGameEnvironmentActivities(environmentId)
			.then((res) => {
				if (res.status === 200) {
					setActivities(getData(res.data));
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get environment activities.",
				});
				history.push("/edit-game/" + gameId);
			});
		getGameEnvironmentById(environmentId)
			.then((res) => {
				if (res.status === 200) {
					setEnvironment(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get environment.",
				});
				history.push("/edit-game/" + gameId);
			});
	}, [environmentId, disableLoadingData, history]);

	function saveEnvironment() {
		if (checkIsEmpty(environment.nombre)) {
			alertError({
				error: null,
				customMessage: "Nombre is required",
			});
			return;
		}

		if (checkIsEmpty(environment.amb_texto)) {
			alertError({
				error: null,
				customMessage: "Ambientación is required",
			});
			return;
		}

		if (!environmentId) {
			environment.juego_id = gameId;
			postGameEnvironment(environment)
				.then((res) => {
					if (res.status === 201) {
						alertSuccess({
							title: "Saved!",
							customMessage:
								"Game environment successfully created.",
						});
						history.push("/edit-game/" + gameId);
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save game environment.",
					});
				});
		} else {
			updateGameEnvironment(environmentId, environment)
				.then((res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage:
								"Game environment successfully saved.",
						});
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
		setEnvironment({ ...environment, [element]: text });
	};

	function imageFormatter(cell) {
		return cell && cell !== "" ? (
			<img
				//src={SERVER_URL + '/' + cell}
				alt="icon"
				style={{ width: "50px", height: "50px" }}
				onClick={() => {
					setPreviewFile(cell);
					setOpenPreviewDialog(true);
				}}
			/>
		) : (
			<div />
		);
	}

	function buttonFormatter(cell) {
		const elem = activities.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							storeToSession("environment", {
								id: environmentId,
								name: environment.nombre,
							});
							history.push("/edit-activity/" + cell);
						}}
					>
						<EditIcon />
					</Button>
				</Tooltip>
			</>
		);
	}

	const columns = [
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{
			dataField: "descripcion",
			text: "Descripcion",
			sort: true,
		},
		{
			dataField: "icono",
			text: "Icono",
			formatter: imageFormatter,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	function getFilteredType() {
		let type = audioSelected
			? types.find((x) => x.descripcion === "Audio")
			: types.find((x) => x.descripcion === "Imagen");

		return type;
	}

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit environment"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-6 gx-3">
								<TextField
									id={`nombre`}
									label="Nombre"
									value={environment.nombre}
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
									id={`icon`}
									label="Icono"
									value={
										assets.find(
											(x) => x.id === environment.icono_id
										)?.descripcion
									}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									inputProps={{ readOnly: true }}
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<>
													{environment?.icono_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				environment.icono_id
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
																setAudioSelected(
																	null
																);
																setImageSelected(
																	null
																);
																setIconSelected(
																	true
																);
																setOpenTableDialog(
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
						<TextField
							id={`descripcion`}
							label="Descripción"
							value={environment.descripcion}
							onChange={handleChange("descripcion")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<br />
						<br />
						<p>Ambientación *</p>
						<Editor
							body={environment.amb_texto || ""}
							setBody={(new_body) => {
								if (new_body !== " ")
									setEnvironment({
										...environment,
										amb_texto: new_body,
									});
							}}
							className="max-height"
							placeholder={"Enter environment context here ..."}
						/>
						<br />
						<div className="row">
							<div className="col">
								<TextField
									id={`audio`}
									label="Audio ambiente"
									value={
										assets.find(
											(x) =>
												x.id ===
												environment.amb_audio_id
										)?.descripcion
									}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									inputProps={{ readOnly: true }}
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<>
													{environment?.amb_audio_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				environment.amb_audio_id
																		)?.url
																	);
																	setOpenPreviewDialog(
																		true
																	);
																}}
															>
																<VolumeUp />
															</Button>
														</Tooltip>
													)}
													<Tooltip title="Select audio">
														<Button
															onClick={() => {
																setIconSelected(
																	null
																);
																setImageSelected(
																	null
																);
																setAudioSelected(
																	true
																);
																setOpenTableDialog(
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
							<div className="col">
								<TextField
									id={`image`}
									label="Imagen ambiente"
									value={
										assets.find(
											(x) =>
												x.id ===
												environment.amb_imagen_id
										)?.descripcion
									}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									inputProps={{ readOnly: true }}
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<>
													{environment?.amb_imagen_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				environment.amb_imagen_id
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
																	null
																);
																setAudioSelected(
																	null
																);
																setImageSelected(
																	true
																);
																setOpenTableDialog(
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
					</CardBody>
					{environmentId && (
						<div className="d-flex justify-content-end">
							<Button
								onClick={() => saveEnvironment()}
								variant="outlined"
								color="primary"
								style={{
									marginRight: "30px",
									marginBottom: "20px",
								}}
							>
								Save environment
							</Button>
						</div>
					)}
				</Card>
				{environmentId && (
					<Card>
						<CardHeader title="Activities">
							<CardHeaderToolbar>
								<button
									type="button"
									className="btn btn-primary"
									onClick={() => {
										storeToSession("environment", {
											id: environmentId,
											name: environment.nombre,
										});
										history.push("/edit-activity");
									}}
								>
									Add new
								</button>
							</CardHeaderToolbar>
						</CardHeader>
						<CardBody>
							<Table data={activities} columns={columns} />
						</CardBody>
					</Card>
				)}
				<AssetTableDialog
					open={openTableDialog}
					setOpen={setOpenTableDialog}
					data={assets}
					type={getFilteredType()}
					formats={formats}
					categories={categories}
					extensions={extensions}
					tags={tags}
					onSelectRow={(item) => {
						if (iconSelected) {
							setEnvironment({
								...environment,
								icono_id: item.id,
							});
							setIconSelected(null);
						}
						if (audioSelected) {
							setEnvironment({
								...environment,
								amb_audio_id: item.id,
							});
							setAudioSelected(null);
						}
						if (imageSelected) {
							setEnvironment({
								...environment,
								amb_imagen_id: item.id,
							});
							setImageSelected(null);
						}
						setOpenTableDialog(false);
					}}
					onAssetCreated={(item) => {
						let newAssets = [...assets];
						newAssets.push(item);
						setAssets(newAssets);

						if (iconSelected) {
							setEnvironment({
								...environment,
								icono_id: item.id,
							});
							setIconSelected(null);
						}
						if (audioSelected) {
							setEnvironment({
								...environment,
								amb_audio_id: item.id,
							});
							setAudioSelected(null);
						}
						if (imageSelected) {
							setEnvironment({
								...environment,
								amb_imagen_id: item.id,
							});
							setImageSelected(null);
						}
					}}
				/>
				<PreviewDialog
					title={"Preview file"}
					open={openPreviewDialog}
					setOpen={setOpenPreviewDialog}
					src={previewFile}
				/>
				<Button
					onClick={() => history.push("/edit-game/" + gameId)}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				{!environmentId && (
					<Button
						onClick={() => saveEnvironment()}
						variant="outlined"
						color="primary"
						style={{ marginRight: "20px" }}
					>
						Save environment
					</Button>
				)}
			</>
		);
}
