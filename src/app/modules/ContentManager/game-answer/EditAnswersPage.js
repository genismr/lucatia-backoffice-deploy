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
	InputAdornment,
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
	removeFromSession,
	storeToSession,
} from "../../../../utils/helpers";
import { getEntities } from "../../../../api/entity";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import Table, { buttonsStyle } from "../../../components/tables/table";
import EditIcon from "@material-ui/icons/Edit";
import {
	getGameAnswerById,
	postGameAnswer,
	updateGameAnswer,
} from "../../../../api/game-answer";
import {
	getAssets,
	getCategories,
	getExtensions,
	getFormats,
	getTags,
	getTypes,
} from "../../../../api/asset";
import { AddBox, CheckBox, Visibility } from "@material-ui/icons";
import AddResourceIcon from "@material-ui/icons/AddPhotoAlternate";
import AssetTableDialog from "../../../components/dialogs/AssetTableDialog";
import PreviewDialog from "../../../components/dialogs/PreviewDialog";
import { getTimeLines } from "../../../../api/time-line";
import CreateTimeLineDialog from "../../../components/dialogs/CreateTimeLineDialog";
import { getGameQuestionById } from "../../../../api/game-question";
import { getGameActivityQuestions } from "../../../../api/game-activity";

function getEmptyAnswer() {
	return {
		pregunta_id: "",
		nombre: "",
		descripcion: null,
		icono_id: null,
		texto: null,
		imagen_id: null,
		es_correcto: null,
		linea_de_tiempo_id: null,
		ofrece_reintento: false,
		reintento_pregunta_id: null,
		puntuacion: null,
	};
}

export default function EditAnswersPage() {
	const [answer, setAnswer] = useState(getEmptyAnswer());
	const [question, setQuestion] = useState(null);
	const [questions, setQuestions] = useState(null);

	const [openCreateTimeLineDialog, setOpenCreateTimeLineDialog] = useState(
		false
	);
	const [openCreateQuestionDialog, setOpenCreateQuestionDialog] = useState(
		false
	);

	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewFile, setPreviewFile] = useState(null);
	const [openTableDialog, setOpenTableDialog] = useState(false);

	const [timeLines, setTimeLines] = useState([]);
	const [assets, setAssets] = useState([]);
	const [types, setTypes] = useState(null);
	const [categories, setCategories] = useState(null);
	const [formats, setFormats] = useState(null);
	const [extensions, setExtensions] = useState(null);
	const [tags, setTags] = useState(null);

	const [iconSelected, setIconSelected] = useState(null);
	const [imageSelected, setImageSelected] = useState(null);

	const questionId = getFromSession("question").id;
	const activityId = getFromSession("activity").id;

	const retryQuestionId = getFromSession("retryQuestion");

	const answerId = useParams().id;
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
		return types.find((x) => x.descripcion === "Imagen");
	}

	useEffect(() => {
		getGameQuestionById(questionId)
			.then((res) => {
				if (res.status === 200) {
					setQuestion(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get question.",
				});
				history.push("/edit-question/" + questionId);
			});
		getTimeLines()
			.then((res) => {
				if (res.status === 200) {
					setTimeLines(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get time lines.",
				});
				history.push("/edit-question/" + questionId);
			});
		getGameActivityQuestions(activityId)
			.then((res) => {
				if (res.status === 200) {
					setQuestions(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get activity questions.",
				});
				history.push("/edit-question/" + questionId);
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
				history.push("/edit-question/" + questionId);
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
				history.push("/edit-question/" + questionId);
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
				history.push("/edit-question/" + questionId);
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
				history.push("/edit-question/" + questionId);
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
				history.push("/edit-question/" + questionId);
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
				history.push("/edit-question/" + questionId);
			});
		if (!answerId) {
			if (retryQuestionId !== null) {
				setAnswer({
					...answer,
					reintento_pregunta_id: retryQuestionId,
					ofrece_reintento: true,
				});
				removeFromSession("retryQuestion");
			}
			disableLoadingData();
			return;
		}
		getGameAnswerById(answerId)
			.then((res) => {
				if (res.status === 200) {
					setAnswer(res.data);
					if (retryQuestionId !== null) {
						setAnswer({
							...answer,
							reintento_pregunta_id: retryQuestionId,
							ofrece_reintento: true,
						});
						removeFromSession("retryQuestion");
					}
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get answer.",
				});
				history.push("/edit-question/" + questionId);
			});
	}, [answerId, disableLoadingData, history]);

	function saveAnswer() {
		if (checkIsEmpty(answer.nombre)) {
			alertError({
				error: null,
				customMessage: "Nombre is required",
			});
			return;
		}

		if (answer.ofrece_reintento && answer.reintento_pregunta_id == null) {
			alertError({
				error: null,
				customMessage: "Pregunta de reintento is required",
			});
			return;
		}

		if (!answerId) {
			answer.pregunta_id = questionId;
			postGameAnswer(answer)
				.then((res) => {
					if (res.status === 201) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Answer successfully created.",
						});
						if (retryQuestionId != null)
							removeFromSession("retryQuestion");
						history.push("/edit-question/" + questionId);
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save answer.",
					});
				});
		} else {
			updateGameAnswer(answerId, answer)
				.then((res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Answer successfully saved.",
						});
					}
					history.push("/edit-question/" + questionId);
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
		setAnswer({ ...answer, [element]: text });
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

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit answer"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-6 gx-3">
								<TextField
									id={`nombre`}
									label="Nombre"
									value={answer.nombre}
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
									id={`texto`}
									label="Texto"
									value={answer.texto}
									onChange={handleChange("texto")}
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
							value={answer.descripcion}
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
											(x) => x.id === answer.icono_id
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
													{answer?.icono_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				answer.icono_id
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
							<div className="col-6 gx-3">
								<TextField
									id={`image`}
									label="Imagen"
									value={
										assets.find(
											(x) => x.id === answer.imagen_id
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
													{answer?.imagen_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewFile(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				answer.imagen_id
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
																setImageSelected(
																	true
																);
																setIconSelected(
																	false
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
						{!question.es_secuencial && (
							<Autocomplete
								id="autocomplete-time-line"
								disablePortal
								filterSelectedOptions
								options={timeLines}
								getOptionLabel={(option) =>
									"Indice: " +
									option.indice +
									" - Tiempo: " +
									option.tiempo +
									" (s)"
								}
								value={timeLines.find(
									(x) => x.id == answer.linea_de_tiempo_id
								)}
								onChange={(event, selected) => {
									setAnswer({
										...answer,
										linea_de_tiempo_id: selected
											? selected.id
											: null,
									});
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Línea de tiempo"
										margin="normal"
										variant="outlined"
										InputLabelProps={{
											shrink: true,
										}}
										InputProps={{
											...params.InputProps,
											endAdornment: (
												<Tooltip title="Create">
													<Button
														onClick={() => {
															setOpenCreateTimeLineDialog(
																true
															);
														}}
													>
														<AddBox />
													</Button>
												</Tooltip>
											),
										}}
									/>
								)}
							/>
						)}
						<br />
						<div className="row">
							<div className="col-4 mr-5">
								<TextField
									id={`punctuation`}
									label="Puntuación"
									value={answer.puntuacion}
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
							</div>
							<FormControlLabel
								control={
									<Checkbox
										checked={answer.es_correcto}
										name="checkActive"
										onChange={(event) =>
											setAnswer({
												...answer,
												es_correcto:
													event.target.checked,
											})
										}
									/>
								}
								label="Correcta"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={answer.ofrece_reintento}
										name="checkActive"
										onChange={(event) => {
											let checked = event.target.checked;
											setAnswer({
												...answer,
												ofrece_reintento: checked,
												reintento_pregunta_id: !checked
													? null
													: answer.reintento_pregunta_id,
											});
										}}
									/>
								}
								label="Ofrece reintento"
							/>
							{answer.ofrece_reintento && (
								<div className="col text-right">
									<Autocomplete
										id="autocomplete-time-line"
										disablePortal
										filterSelectedOptions
										options={questions}
										getOptionLabel={(option) =>
											option.nombre
										}
										value={questions.find(
											(x) =>
												x.id ==
												answer.reintento_pregunta_id
										)}
										onChange={(event, selected) => {
											setAnswer({
												...answer,
												reintento_pregunta_id: selected
													? selected.id
													: null,
											});
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Pregunta de reintento"
												margin="normal"
												variant="outlined"
												InputLabelProps={{
													shrink: true,
												}}
												InputProps={{
													...params.InputProps,
													endAdornment: (
														<Tooltip title="Create">
															<Button
																onClick={() => {
																	storeToSession(
																		"answer",
																		answerId
																	);
																	history.push(
																		"/edit-answer-question"
																	);
																}}
															>
																<AddBox />
															</Button>
														</Tooltip>
													),
												}}
											/>
										)}
									/>
								</div>
							)}
						</div>
					</CardBody>
				</Card>
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
							setAnswer({
								...answer,
								icono_id: item.id,
							});
							setIconSelected(null);
						}
						if (imageSelected) {
							setAnswer({
								...answer,
								imagen_id: item.id,
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
							setAnswer({
								...answer,
								icono_id: item.id,
							});
							setIconSelected(null);
						}
						if (imageSelected) {
							setAnswer({
								...answer,
								imagen_id: item.id,
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
				<CreateTimeLineDialog
					title={"Create time line"}
					open={openCreateTimeLineDialog}
					setOpen={setOpenCreateTimeLineDialog}
					onCreate={(item) => {
						let newTimeLines = [...timeLines];
						newTimeLines.push(item);
						setTimeLines(newTimeLines);
						setAnswer({ ...answer, linea_de_tiempo_id: item.id });
					}}
				/>
				<Button
					onClick={() => {
						if (retryQuestionId != null)
							removeFromSession("retryQuestion");
						history.push("/edit-question/" + questionId);
					}}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				<Button
					onClick={() => saveAnswer()}
					variant="outlined"
					color="primary"
					style={{ marginRight: "20px" }}
				>
					Save answer
				</Button>
			</>
		);
}
