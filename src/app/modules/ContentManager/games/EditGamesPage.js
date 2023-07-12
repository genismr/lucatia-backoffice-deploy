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
import { checkIsEmpty, storeToSession } from "../../../../utils/helpers";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import {
	getGameById,
	getGameEnvironments,
	postGame,
	updateGame,
} from "../../../../api/game";
import Table, { buttonsStyle } from "../../../components/tables/table";
import EditIcon from "@material-ui/icons/Edit";
import AddResourceIcon from "@material-ui/icons/AddPhotoAlternate";
import { getApps } from "../../../../api/app";
import AssetTableDialog from "../../../components/dialogs/AssetTableDialog";
import {
	getAssets,
	getCategories,
	getExtensions,
	getFormats,
	getTags,
	getTypes,
} from "../../../../api/asset";
import {
	ArrowDownward,
	ArrowUpward,
	Delete,
	EventAvailableOutlined,
	Visibility,
} from "@material-ui/icons";
import PreviewDialog from "../../../components/dialogs/PreviewDialog";
import {
	deleteGameEnvironment,
	updateGameEnvironment,
} from "../../../../api/game-environment";

function getEmptyGame() {
	return {
		nombre: "",
		descripcion: null,
		app_id: null,
		icono_id: null,
		imagen_id: null,
	};
}

function getData(environments) {
	let data = [];
	for (let i = 0; i < environments.length; ++i) {
		const elem = {};

		elem.id = environments[i].id;
		elem.juego_id = environments[i].juego_id;
		elem.nombre = environments[i].nombre;
		elem.descripcion = environments[i].descripcion;
		elem.icono_id = environments[i].icono?.id;
		elem.amb_texto = environments[i].amb_texto;
		elem.amb_audio_id = environments[i].amb_audio?.id;
		elem.amb_imagen_id = environments[i].amb_imagen?.id;
		elem.orden = environments[i].orden;

		data = data.concat(elem);
	}

	return data;
}

export default function EditGamesPage() {
	const [game, setGame] = useState(getEmptyGame());
	const [apps, setApps] = useState([]);
	const [assets, setAssets] = useState([]);

	const [environments, setEnvironments] = useState([]);

	const [selectedEnvironment, setSelectedEnvironment] = useState(null);

	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);
	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);
	const [openTableDialog, setOpenTableDialog] = useState(false);

	const [refresh, setRefresh] = useState(false);

	const [iconSelected, setIconSelected] = useState(null);
	const [imageSelected, setImageSelected] = useState(null);

	const [types, setTypes] = useState(null);
	const [categories, setCategories] = useState(null);
	const [formats, setFormats] = useState(null);
	const [extensions, setExtensions] = useState(null);
	const [tags, setTags] = useState(null);

	const gameId = useParams().id;
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
		let type = types.find((x) => x.descripcion === "Imagen");

		return type;
	}

	function fetchEnvironments() {
		getGameEnvironments(gameId)
			.then((res) => {
				if (res.status === 200) {
					console.log("data", res.data);
					setEnvironments(getData(res.data));
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get game environments.",
				});
				history.push("/games");
			});
	}

	useEffect(() => {
		getApps(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setApps(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get apps.",
				});
				history.push("/games");
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
				history.push("/games");
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
				history.push("/games");
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
				history.push("/games");
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
				history.push("/games");
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
				history.push("/games");
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
				history.push("/games");
			});
		if (!gameId) {
			disableLoadingData();
			return;
		}
		fetchEnvironments();
		getGameById(gameId)
			.then((res) => {
				if (res.status === 200) {
					setGame(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get game.",
				});
				history.push("/games");
			});
	}, [gameId, disableLoadingData, history, refresh]);

	function saveGame() {
		if (checkIsEmpty(game.nombre)) {
			alertError({
				error: null,
				customMessage: "Nombre is required",
			});
			return;
		}

		if (!gameId) {
			postGame(game)
				.then((res) => {
					if (res.status === 201) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Game successfully created.",
						});
						history.push("/games");
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save game.",
					});
				});
		} else {
			updateGame(gameId, game)
				.then((res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Game successfully saved.",
						});
						setGame(res.data);
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
		setGame({ ...game, [element]: text });
	};

	const handleMoveEnvironment = (index, newIndex) => {
		let newEnvironments = [...environments];

		const aux = newEnvironments[index];
		newEnvironments.splice(index, 1, newEnvironments[newIndex]);
		newEnvironments.splice(newIndex, 1, aux);

		let saveEnvironment = { ...environments[index] };
		saveEnvironment.orden = newIndex;

		let saveEnvironment2 = { ...environments[newIndex] };
		saveEnvironment2.orden = index;

		updateGameEnvironment(saveEnvironment.id, saveEnvironment).then(
			(res) => {
				if (res.status === 204) {
					updateGameEnvironment(
						saveEnvironment2.id,
						saveEnvironment2
					).then((res) => {
						fetchEnvironments();
					});
				}
			}
		);
	};

	function imageFormatter(cell) {
		return cell && cell !== "" ? (
			<img
				src={cell}
				alt="icon"
				style={{ width: "50px", height: "50px" }}
				onClick={() => {
					setPreviewImage(cell);
					setOpenPreviewDialog(true);
				}}
			/>
		) : (
			<div />
		);
	}

	function buttonFormatter(cell) {
		const elem = environments.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							storeToSession("game", {
								id: gameId,
								name: game.nombre,
							});
							history.push("/edit-environment/" + cell);
						}}
					>
						<EditIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Move up">
					<Button
						style={buttonsStyle}
						size="small"
						disabled={elem.orden == 0}
						onClick={() =>
							handleMoveEnvironment(elem.orden, elem.orden - 1)
						}
					>
						<ArrowUpward />
					</Button>
				</Tooltip>
				<Tooltip title="Move down">
					<Button
						style={buttonsStyle}
						size="small"
						disabled={elem.orden == environments.length - 1}
						onClick={() =>
							handleMoveEnvironment(elem.orden, elem.orden + 1)
						}
					>
						<ArrowDownward />
					</Button>
				</Tooltip>
				<Tooltip title="Delete">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							setSelectedEnvironment(elem);
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

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit game"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col">
								<TextField
									id={`nombre`}
									label="Nombre"
									value={game.nombre}
									onChange={handleChange("nombre")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									required
								/>
							</div>
							<div className="col">
								<Autocomplete
									id="autocomplete-app"
									disablePortal
									filterSelectedOptions
									options={apps}
									getOptionLabel={(option) => option.nombre}
									value={apps.find(
										(x) => x.id === game?.app_id
									)}
									onChange={(event, selected) => {
										setGame({
											...game,
											app_id: selected?.id,
										});
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="App"
											margin="normal"
											variant="outlined"
											InputLabelProps={{
												shrink: true,
											}}
										/>
									)}
								/>
							</div>
						</div>
						<TextField
							id={`descripcion`}
							label="Descripción"
							value={game.descripcion}
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
									id={`icono`}
									label="Icono"
									value={
										assets.find(
											(x) => x.id === game.icono_id
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
													{game?.icono_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewImage(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				game.icono_id
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
									id={`imagen`}
									label="Imagen"
									value={
										assets.find(
											(x) => x.id === game.imagen_id
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
													{game?.imagen_id && (
														<Tooltip title="Preview">
															<Button
																onClick={() => {
																	setPreviewImage(
																		assets.find(
																			(
																				x
																			) =>
																				x.id ===
																				game.imagen_id
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
					{gameId && (
						<div className="d-flex justify-content-end">
							<Button
								onClick={() => saveGame()}
								variant="outlined"
								color="primary"
								style={{
									marginRight: "30px",
									marginBottom: "20px",
								}}
							>
								Save game
							</Button>
						</div>
					)}
				</Card>
				{gameId && (
					<Card>
						<CardHeader title="Environments">
							<CardHeaderToolbar>
								<button
									type="button"
									className="btn btn-primary"
									onClick={() => {
										storeToSession("game", {
											id: gameId,
											name: game.nombre,
										});

										history.push("/edit-environment");
									}}
								>
									Add new
								</button>
							</CardHeaderToolbar>
						</CardHeader>
						<CardBody>
							<Table data={environments} columns={columns} />
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
							setGame({ ...game, icono_id: item.id });
							setIconSelected(null);
						}
						if (imageSelected) {
							setGame({ ...game, imagen_id: item.id });
							setImageSelected(null);
						}
						setOpenTableDialog(false);
					}}
					onAssetCreated={(item) => {
						let newAssets = [...assets];
						newAssets.push(item);
						setAssets(newAssets);

						if (iconSelected) {
							setGame({ ...game, icono_id: item.id });
							setIconSelected(null);
						}
						if (imageSelected) {
							setGame({ ...game, imagen_id: item.id });
							setImageSelected(null);
						}
					}}
				/>
				<PreviewDialog
					title={"Preview file"}
					open={openPreviewDialog}
					setOpen={setOpenPreviewDialog}
					src={previewImage}
				/>
				<ConfirmDialog
					title={"Are you sure you want to delete this environment?"}
					open={openConfirmDialog}
					setOpen={setOpenConfirmDialog}
					onConfirm={() => {
						deleteGameEnvironment(selectedEnvironment.id)
							.then((res) => {
								if (res.status === 204) {
									alertSuccess({
										title: "Deleted!",
										customMessage:
											"Environment successfully deleted.",
									});
									setRefresh(true);
								}
							})
							.catch((error) => {
								alertError({
									error: error,
									customMessage:
										"Could not delete environment.",
								});
							});
					}}
				/>
				<Button
					onClick={() => history.push("/games")}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				{!gameId && (
					<Button
						onClick={() => saveGame()}
						variant="outlined"
						color="primary"
						style={{ marginRight: "20px" }}
					>
						Save game
					</Button>
				)}
			</>
		);
}
