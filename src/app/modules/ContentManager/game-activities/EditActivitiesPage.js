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
	getGameActivityById,
	getGameActivityQuestions,
	postGameActivity,
	updateGameActivity,
} from "../../../../api/game-activity";
import { getEvaluatedConcepts } from "../../../../api/evaluated-concept";
import Editor from "../../../components/editor/Editor";
import { Visibility, VolumeUp } from "@material-ui/icons";
import {
	getAssets,
	getCategories,
	getExtensions,
	getFormats,
	getTags,
	getTypes,
} from "../../../../api/asset";
import AddResourceIcon from "@material-ui/icons/AddPhotoAlternate";
import AssetTableDialog from "../../../components/dialogs/AssetTableDialog";
import PreviewDialog from "../../../components/dialogs/PreviewDialog";

function getEmptyActivity() {
	return {
		entorno_id: "",
		nombre: "",
		descripcion: null,
		icono_id: null,
		concepto_evaluado_id: "",
		contexto_audio: null,
		amb_texto: "",
		amb_audio_id: "",
		amb_imagen_id: "",
	};
}

function getData(questions) {
	let data = [];
	for (let i = 0; i < questions.length; ++i) {
		const elem = {};

		elem.nombre = questions[i].nombre;
		elem.descripcion = questions[i].descripcion;
		elem.icono = questions[i].icono_id;
		elem.id = questions[i].id;

		data = data.concat(elem);
	}

	return data;
}

export default function EditActivitiesPage() {
	const [activity, setActivity] = useState(getEmptyActivity());
	const [questions, setQuestions] = useState([]);
	const [evaluatedConcepts, setEvaluatedConcepts] = useState([]);

	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewFile, setPreviewFile] = useState(null);
	const [openTableDialog, setOpenTableDialog] = useState(false);

	const [assets, setAssets] = useState([]);
	const [types, setTypes] = useState(null);
	const [categories, setCategories] = useState(null);
	const [formats, setFormats] = useState(null);
	const [extensions, setExtensions] = useState(null);
	const [tags, setTags] = useState(null);

	const [iconSelected, setIconSelected] = useState(null);
	const [audioSelected, setAudioSelected] = useState(null);
	const [imageSelected, setImageSelected] = useState(null);

	const environmentId = getFromSession("environment").id;

	const activityId = useParams().id;
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

	function getFilteredType() {
		let type = audioSelected
			? types.find((x) => x.descripcion === "Audio")
			: types.find((x) => x.descripcion === "Imagen");

		return type;
	}

	useEffect(() => {
		getEvaluatedConcepts()
			.then((res) => {
				if (res.status === 200) {
					setEvaluatedConcepts(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get evaluated concepts.",
				});
				history.push("/edit-environment/" + environmentId);
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
				history.push("/edit-environment/" + environmentId);
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
				history.push("/edit-environment/" + environmentId);
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
				history.push("/edit-environment/" + environmentId);
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
				history.push("/edit-environment/" + environmentId);
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
				history.push("/edit-environment/" + environmentId);
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
				history.push("/edit-environment/" + environmentId);
			});
		if (!activityId) {
			disableLoadingData();
			return;
		}
		getGameActivityQuestions(activityId)
			.then((res) => {
				if (res.status === 200) {
					setQuestions(getData(res.data));
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get activity questions.",
				});
				history.push("/edit-environment/" + environmentId);
			});
		getGameActivityById(activityId)
			.then((res) => {
				if (res.status === 200) {
					setActivity(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get activity.",
				});
				history.push("/edit-environment/" + environmentId);
			});
	}, [activityId, disableLoadingData, history]);

	function saveActivity() {
		if (checkIsEmpty(activity.nombre)) {
			alertError({
				error: null,
				customMessage: "Nombre is required",
			});
			return;
		}

		if (checkIsEmpty(activity.concepto_evaluado_id)) {
			alertError({
				error: null,
				customMessage: "Concepto evaluado is required",
			});
			return;
		}

		if (checkIsEmpty(activity.amb_texto)) {
			alertError({
				error: null,
				customMessage: "Ambientación is required",
			});
			return;
		}

		if (!activityId) {
			activity.entorno_id = environmentId;
			postGameActivity(activity)
				.then((res) => {
					if (res.status === 201) {
						alertSuccess({
							title: "Saved!",
							customMessage:
								"Game activity successfully created.",
						});
						history.push("/edit-environment/" + environmentId);
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save game activity.",
					});
				});
		} else {
			updateGameActivity(activityId, activity)
				.then((res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Game activity successfully saved.",
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
		setActivity({ ...activity, [element]: text });
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
		const elem = questions.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							storeToSession("activity", {
								id: activityId,
								name: activity.nombre,
							});
							history.push("/edit-question/" + cell);
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

	function getFilteredAssets() {
		let typeId = audioSelected
			? types.find((x) => x.descripcion === "Audio").id
			: types.find((x) => x.descripcion === "Imagen").id;

		return assets.filter((x) => x.type.id === typeId);
	}

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit activity"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-6 gx-3">
								<TextField
									id={`nombre`}
									label="Nombre"
									value={activity.nombre}
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
											(x) => x.id === activity.icono_id
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
													{activity?.icono_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				activity.icono_id
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
																	false
																);
																setImageSelected(
																	false
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
							value={activity.descripcion}
							onChange={handleChange("descripcion")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<Autocomplete
							id="autocomplete-concepto-evaluado"
							disablePortal
							filterSelectedOptions
							options={evaluatedConcepts}
							getOptionLabel={(option) => option.nombre}
							value={evaluatedConcepts.find(
								(x) => x.id === activity?.concepto_evaluado_id
							)}
							onChange={(event, selected) => {
								setActivity({
									...activity,
									concepto_evaluado_id: selected
										? selected.id
										: "",
								});
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Concepto evaluado"
									margin="normal"
									variant="outlined"
									InputLabelProps={{
										shrink: true,
									}}
									required
								/>
							)}
						/>
						<br />
						<p>Ambientación *</p>
						<Editor
							body={activity.amb_texto || ""}
							setBody={(new_body) => {
								if (new_body !== " ")
									setActivity({
										...activity,
										amb_texto: new_body,
									});
							}}
							className="max-height"
							placeholder={"Enter activity context here ..."}
						/>
						<br />
						<TextField
							id={`audioContext`}
							label="Audio contexto"
							value={activity.contexto_audio}
							onChange={handleChange("contexto_audio")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<div className="row">
							<div className="col">
								<TextField
									id={`audio`}
									label="Audio ambiente"
									value={
										assets.find(
											(x) =>
												x.id === activity.amb_audio_id
										)?.descripcion
									}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									required
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<>
													{activity?.amb_audio_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				activity.amb_audio_id
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
																	false
																);
																setImageSelected(
																	false
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
												x.id === activity.amb_imagen_id
										)?.descripcion
									}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									required
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<>
													{activity?.amb_imagen_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				activity.amb_imagen_id
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
																setAudioSelected(
																	false
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
					{activityId && (
						<div className="d-flex justify-content-end">
							<Button
								onClick={() => saveActivity()}
								variant="outlined"
								color="primary"
								style={{
									marginRight: "30px",
									marginBottom: "20px",
								}}
							>
								Save activity
							</Button>
						</div>
					)}
				</Card>
				{activityId && (
					<Card>
						<CardHeader title="Questions">
							<CardHeaderToolbar>
								<button
									type="button"
									className="btn btn-primary"
									onClick={() => {
										storeToSession("activity", {
											id: activityId,
											name: activity.nombre,
										});
										history.push("/edit-question");
									}}
								>
									Add new
								</button>
							</CardHeaderToolbar>
						</CardHeader>
						<CardBody>
							<Table data={questions} columns={columns} />
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
							setActivity({
								...activity,
								icono_id: item.id,
							});
							setIconSelected(null);
						}
						if (audioSelected) {
							setActivity({
								...activity,
								amb_audio_id: item.id,
							});
							setAudioSelected(null);
						}
						if (imageSelected) {
							setActivity({
								...activity,
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
							setActivity({
								...activity,
								icono_id: item.id,
							});
							setIconSelected(null);
						}
						if (audioSelected) {
							setActivity({
								...activity,
								amb_audio_id: item.id,
							});
							setAudioSelected(null);
						}
						if (imageSelected) {
							setActivity({
								...activity,
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
					onClick={() =>
						history.push("/edit-environment/" + environmentId)
					}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				{!activityId && (
					<Button
						onClick={() => saveActivity()}
						variant="outlined"
						color="primary"
						style={{ marginRight: "20px" }}
					>
						Save activity
					</Button>
				)}
			</>
		);
}
