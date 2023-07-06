import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import {
	Button,
	Checkbox,
	FormControlLabel,
	Radio,
	RadioGroup,
	TextField,
	Tooltip,
} from "@material-ui/core";
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
import Table, {
	buttonsStyle,
	substringFormatter,
} from "../../../components/tables/table";
import EditIcon from "@material-ui/icons/Edit";
import {
	getAssets,
	getCategories,
	getExtensions,
	getFormats,
	getTags,
	getTypes,
} from "../../../../api/asset";
import {
	getGameQuestionAnswers,
	getGameQuestionById,
	getGameQuestionTypes,
	postGameQuestion,
	updateGameQuestion,
} from "../../../../api/game-question";
import {
	CheckBox,
	Delete,
	Replay,
	Visibility,
	VolumeUp,
} from "@material-ui/icons";
import AddResourceIcon from "@material-ui/icons/AddPhotoAlternate";
import AssetTableDialog from "../../../components/dialogs/AssetTableDialog";
import PreviewDialog from "../../../components/dialogs/PreviewDialog";
import { FormControl, FormLabel } from "react-bootstrap";
import { deleteGameAnswer } from "../../../../api/game-answer";

function getEmptyQuestion() {
	return {
		actividad_id: "",
		nombre: "",
		descripcion: null,
		icono_id: null,
		audio_id: null,
		amb_imagen_id: null,
		es_reintento: false,
		tiene_puntuacion_global: false,
		puntuacion: null,
		tipo_pregunta_id: "",
		repetir_si_fallo: null,
	};
}

function getData(answers) {
	let data = [];
	for (let i = 0; i < answers.length; ++i) {
		const elem = {};

		elem.nombre = answers[i].nombre;
		elem.descripcion = answers[i].descripcion;
		elem.icono = answers[i].icono_id;
		elem.ofrece_reintento = answers[i].ofrece_reintento;
		elem.id = answers[i].id;

		data = data.concat(elem);
	}

	return data;
}

export default function EditQuestionsPage() {
	const [question, setQuestion] = useState(getEmptyQuestion());
	const [selectedAnswer, setSelectedAnswer] = useState(null);

	const [answers, setAnswers] = useState([]);

	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);
	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewFile, setPreviewFile] = useState(null);
	const [openTableDialog, setOpenTableDialog] = useState(false);

	const [assets, setAssets] = useState([]);
	const [questionTypes, setQuestionTypes] = useState([]);

	const [types, setTypes] = useState(null);
	const [categories, setCategories] = useState(null);
	const [formats, setFormats] = useState(null);
	const [extensions, setExtensions] = useState(null);
	const [tags, setTags] = useState(null);

	const [iconSelected, setIconSelected] = useState(null);
	const [audioSelected, setAudioSelected] = useState(null);
	const [imageSelected, setImageSelected] = useState(null);

	const activityId = getFromSession("activity").id;
	const answerId = getFromSession("answer");

	const questionId = useParams().id;
	const history = useHistory();

	const PREGUNTA_ABIERTA_SUFICIENTE = "AS";

	const [refresh, setRefresh] = useState(false);

	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	const retryQuestion = window.location.href
		.toString()
		.includes("edit-answer-question");

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
				history.push("/edit-activity/" + activityId);
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
				history.push("/edit-activity/" + activityId);
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
				history.push("/edit-activity/" + activityId);
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
				history.push("/edit-activity/" + activityId);
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
				history.push("/edit-activity/" + activityId);
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
				history.push("/edit-activity/" + activityId);
			});
		getGameQuestionTypes()
			.then((res) => {
				if (res.status === 200) {
					console.log(res.data);
					setQuestionTypes(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get game question types.",
				});
				history.push("/edit-activity/" + activityId);
			});
		if (!questionId) {
			disableLoadingData();
			return;
		}
		getGameQuestionAnswers(questionId)
			.then((res) => {
				if (res.status === 200) {
					setAnswers(getData(res.data));
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get activity answers.",
				});
				history.push("/edit-activity/" + activityId);
			});
		getGameQuestionById(questionId)
			.then((res) => {
				if (res.status === 200) {
					let question = res.data;
					question.tipo_pregunta_id =
						question.tipo_pregunta.id || null;
					setQuestion(question);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get activity.",
				});
				history.push("/edit-activity/" + activityId);
			});
	}, [questionId, disableLoadingData, history, refresh]);

	function saveQuestion() {
		if (checkIsEmpty(question.nombre)) {
			alertError({
				error: null,
				customMessage: "Nombre is required",
			});
			return;
		}
		if (checkIsEmpty(question.tipo_pregunta_id)) {
			alertError({
				error: null,
				customMessage: "Tipo de pregunta is required",
			});
			return;
		}

		if (!questionId) {
			question.actividad_id = activityId;
			if (retryQuestion) question.es_reintento = true;
			postGameQuestion(question)
				.then((res) => {
					if (res.status === 201) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Question successfully created.",
						});
						if (retryQuestion) {
							storeToSession("retryQuestion", res.data.id);
							history.push(
								"/edit-answer/" +
									(answerId != null ? answerId : "")
							);
						} else history.push("/edit-activity/" + activityId);
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save question.",
					});
				});
		} else {
			updateGameQuestion(questionId, question)
				.then((res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Question successfully saved.",
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
		setQuestion({ ...question, [element]: text });
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
		const elem = answers.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							storeToSession("question", {
								id: questionId,
								name: question.nombre,
							});
							history.push("/edit-answer/" + cell);
						}}
					>
						<EditIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Delete">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							setSelectedAnswer(elem);
							setOpenConfirmDialog(true);
						}}
					>
						<Delete />
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
					<CardHeader title="Edit question"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-6 gx-3">
								<TextField
									id={`nombre`}
									label="Nombre"
									value={question.nombre}
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
											(x) => x.id === question.icono_id
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
													{question?.icono_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				question.icono_id
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
							value={question.descripcion}
							onChange={handleChange("descripcion")}
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
									label="Audio"
									value={
										assets.find(
											(x) => x.id === question.audio_id
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
													{question?.audio_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				question.audio_id
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
												x.id === question.amb_imagen_id
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
													{question?.amb_imagen_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				question.amb_imagen_id
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
						<br />
						<div className="row d-flex align-items-center">
							{!retryQuestion && (
								<div className="col md-3">
									<FormControlLabel
										control={
											<Checkbox
												checked={question.es_reintento}
												name="checkActive"
												onChange={(event) => {
													setQuestion({
														...question,
														es_reintento:
															event.target
																.checked,
													});
												}}
											/>
										}
										label="Pregunta de reintento"
									/>
								</div>
							)}
							<div className="col-md-3">
								<FormControlLabel
									control={
										<Checkbox
											checked={
												question.tiene_puntuacion_global
											}
											name="checkActive"
											onChange={(event) => {
												let checked =
													event.target.checked;
												setQuestion({
													...question,
													tiene_puntuacion_global: checked,
													puntuacion: checked
														? 0
														: null,
												});
											}}
										/>
									}
									label="Puntuación global"
								/>
							</div>
							<div className="col-md-6">
								{question.tiene_puntuacion_global && (
									<TextField
										id={`punctuation`}
										label="Puntuación"
										value={question.puntuacion}
										onChange={handleChange("puntuacion")}
										InputLabelProps={{
											shrink: true,
										}}
										InputProps={{
											inputProps: {
												min: 0,
											},
										}}
										margin="normal"
										variant="outlined"
										type="number"
									/>
								)}
							</div>
						</div>
						<div className="row d-flex align-items-center">
							<div className="col">
								<Autocomplete
									id="autocomplete-question-type"
									options={questionTypes}
									getOptionLabel={(option) =>
										option.codigo +
										(option.descripcion
											? " - " +
											  substringFormatter(
													option.descripcion,
													30
											  )
											: "")
									}
									value={questionTypes.find(
										(x) =>
											x.id === question.tipo_pregunta_id
									)}
									filterSelectedOptions
									onChange={(event, selected) => {
										setQuestion({
											...question,
											tipo_pregunta_id: selected
												? selected.id
												: "",
											repetir_si_fallo:
												questionTypes.find(
													(x) => x.id === selected?.id
												).codigo ===
												PREGUNTA_ABIERTA_SUFICIENTE
													? false
													: null,
										});
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Tipo de pregunta"
											required
											InputLabelProps={{
												shrink: true,
											}}
											margin="normal"
											variant="outlined"
										/>
									)}
								/>
							</div>
							<div className="col">
								{questionTypes.find(
									(x) => x.id === question.tipo_pregunta_id
								).codigo === PREGUNTA_ABIERTA_SUFICIENTE && (
									<FormControlLabel
										control={
											<Checkbox
												checked={
													question.repetir_si_fallo
												}
												name="checkActive"
												onChange={(event) => {
													let checked =
														event.target.checked;
													setQuestion({
														...question,
														repetir_si_fallo: checked,
													});
												}}
											/>
										}
										label="Repetir si se falla"
									/>
								)}
							</div>
						</div>
					</CardBody>
					{questionId && (
						<div className="d-flex justify-content-end">
							<Button
								onClick={() => saveQuestion()}
								variant="outlined"
								color="primary"
								style={{
									marginRight: "30px",
									marginBottom: "20px",
								}}
							>
								Save question
							</Button>
						</div>
					)}
				</Card>
				{questionId && (
					<Card>
						<CardHeader title="Answers">
							<CardHeaderToolbar>
								<button
									type="button"
									className="btn btn-primary"
									onClick={() => {
										storeToSession("question", {
											id: questionId,
											name: question.nombre,
										});
										history.push("/edit-answer");
									}}
								>
									Add new
								</button>
							</CardHeaderToolbar>
						</CardHeader>
						<CardBody>
							<Table data={answers} columns={columns} />
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
							setQuestion({
								...question,
								icono_id: item.id,
							});
							setIconSelected(null);
						}
						if (audioSelected) {
							setQuestion({
								...question,
								audio_id: item.id,
							});
							setAudioSelected(null);
						}
						if (imageSelected) {
							setQuestion({
								...question,
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
							setQuestion({
								...question,
								icono_id: item.id,
							});
							setIconSelected(null);
						}
						if (audioSelected) {
							setQuestion({
								...question,
								audio_id: item.id,
							});
							setAudioSelected(null);
						}
						if (imageSelected) {
							setQuestion({
								...question,
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
				<ConfirmDialog
					title={"Are you sure you want to delete this answer?"}
					open={openConfirmDialog}
					setOpen={setOpenConfirmDialog}
					onConfirm={() => {
						deleteGameAnswer(selectedAnswer.id)
							.then((res) => {
								if (res.status === 204) {
									alertSuccess({
										title: "Deleted!",
										customMessage:
											"Answer successfully deleted.",
									});
									setRefresh(true);
								}
							})
							.catch((error) => {
								alertError({
									error: error,
									customMessage: "Could not delete answer.",
								});
							});
					}}
				/>
				<Button
					onClick={() =>
						retryQuestion
							? history.push("/edit-answer/" + answerId)
							: history.push("/edit-activity/" + activityId)
					}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				{!questionId && (
					<Button
						onClick={() => saveQuestion()}
						variant="outlined"
						color="primary"
						style={{ marginRight: "20px" }}
					>
						Save question
					</Button>
				)}
			</>
		);
}
