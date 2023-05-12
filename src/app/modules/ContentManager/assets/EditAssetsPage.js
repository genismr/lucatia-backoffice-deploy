import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import {
	Button,
	Tooltip,
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
	postAsset,
	getAssetById,
	updateAsset,
	deleteAsset,
	getTypes,
	getCategories,
	getFormats,
	getExtensions,
	getTags,
	assignTags,
	unassignTags,
} from "../../../../api/asset";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import PreviewDialog from "../../../components/dialogs/PreviewDialog";
import { buttonsStyle } from "../../../components/tables/table";
import { checkIsEmpty, getFileType } from "../../../../utils/helpers";
import Visibility from "@material-ui/icons/Visibility";
import { uploadSingleFile } from "../../../../api/files";

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

const theme = createMuiTheme({
	palette: {
		secondary: {
			main: "#F64E60",
		},
	},
});

function getEmptyAsset() {
	return {
		id: "",
		descripcion: "",
		url: "",
		asset_tipo_id: "",
		asset_categoria_id: "",
		asset_formato_id: "",
		asset_extension_id: "",
		fecha_alta: "",
		user_alta_id: "",
		tags: [],
	};
}

function getData(asset) {
	let data = {};

	data.id = asset.id;
	data.descripcion = asset.descripcion;
	data.url = asset.url;
	data.asset_tipo_id = asset.type.id;
	data.asset_categoria_id = asset.category.id;
	data.asset_formato_id = asset.format.id;
	data.asset_extension_id = asset.extension.id;
	data.fecha_alta = asset.fecha_alta;
	data.user_alta_id = asset.user_alta_id;
	data.tags = asset.tags.map((t) => t.id);

	return data;
}

export default function EditAssetsPage() {
	const [asset, setAsset] = useState(getEmptyAsset());
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

	const [types, setTypes] = useState(null);
	const [categories, setCategories] = useState(null);
	const [formats, setFormats] = useState(null);
	const [extensions, setExtensions] = useState(null);
	const [tags, setTags] = useState(null);

	const [initialAssignedTags, setInitialAssignedTags] = useState(null);

	const [selectedFile, setSelectedFile] = useState(null);

	const assetId = useParams().id;
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
			});
		if (!assetId) {
			disableLoadingData();
			return;
		}
		getAssetById(assetId)
			.then((res) => {
				if (res.status === 200) {
					setInitialAssignedTags(res.data.tags.map((t) => t.id));
					setAsset(getData(res.data));
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get asset.",
				});
				history.push("/assets");
			});
	}, [assetId, disableLoadingData, history]);

	function handleTagAssignment(assignedAssetId) {
		let newAssignedTags = asset.tags;
		if (initialAssignedTags != null) {
			newAssignedTags = asset.tags.filter(
				(t) => !initialAssignedTags.includes(t)
			);
		}

		if (!assetId || newAssignedTags.length) {
			assignTags(assignedAssetId, newAssignedTags)
				.then((res) => {
					if (res.status === 200) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Asset successfully created.",
						});
						history.push("/assets");
					}
				})
				.catch((error) => {
					deleteAsset(assignedAssetId);
					alertError({
						error: error,
						customMessage: "Could not assign tags.",
					});
				});
		}

		let unassignedTags = null;
		if (initialAssignedTags != null)
			unassignedTags = initialAssignedTags.filter(
				(t) => !asset.tags.includes(t)
			);

		if (unassignedTags != null) {
			unassignTags(assignedAssetId, unassignedTags).then((res) => {
				if (res.status === 204) {
					alertSuccess({
						title: "Saved!",
						customMessage: "Asset successfully saved.",
					});
					history.push("/assets");
				}
			});
		}
	}

	function saveAsset() {
		if (
			checkIsEmpty(asset.descripcion) ||
			checkIsEmpty(asset.asset_tipo_id) ||
			checkIsEmpty(asset.asset_categoria_id) ||
			checkIsEmpty(asset.asset_formato_id) ||
			checkIsEmpty(asset.asset_extension_id)
		) {
			alertError({
				error: null,
				customMessage: "Some required fields are missing",
			});
			return;
		}

		if (!selectedFile) {
			alertError({
				error: null,
				customMessage: "File is required",
			});
			return;
		}

		let saveAsset = asset;
		if (!assetId) {
			saveAsset.fecha_alta = new Date();
			saveAsset.user_alta_id = loggedUser.userID;
			postAsset(saveAsset, selectedFile)
				.then((res) => {
					if (res.status === 201) {
						if (asset.tags.length) {
							handleTagAssignment(res.data.id);
						} else {
							alertSuccess({
								title: "Saved!",
								customMessage: "Asset successfully created.",
							});
							history.push("/assets");
						}
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save asset.",
					});
				});
		} else {
			updateAsset(assetId, saveAsset, selectedFile)
				.then((res) => {
					if (res.status === 204) {
						handleTagAssignment(assetId);
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
		setAsset({ ...asset, [element]: text });
	};

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit asset"></CardHeader>
					<CardBody>
						<TextField
							id={`nombre`}
							label="Nombre"
							value={asset.descripcion}
							onChange={handleChange("descripcion")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
							required
						/>
						<br />
						<br />
						<div className="row">
							<div className="col-6 gx-3">
								<FormControl style={{ width: "100%" }}>
									<InputLabel id="demo-simple-select-standard-label">
										Asset type *
									</InputLabel>
									<Select
										labelId="demo-simple-select-standard-label"
										id="demo-simple-select-standard"
										value={asset.asset_tipo_id || ""}
										onClick={handleChange("asset_tipo_id")}
										MenuProps={MenuProps}
									>
										{types?.map((type) => (
											<MenuItem
												key={type.id}
												value={type.id}
											>
												{type.descripcion}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>
										Select a type
									</FormHelperText>
								</FormControl>
							</div>
							<div className="col-6 gx-3">
								<FormControl style={{ width: "100%" }}>
									<InputLabel id="demo-simple-select-standard-label">
										Asset format *
									</InputLabel>
									<Select
										labelId="demo-simple-select-standard-label"
										id="demo-simple-select-standard"
										value={asset.asset_formato_id || ""}
										onClick={handleChange(
											"asset_formato_id"
										)}
										MenuProps={MenuProps}
									>
										{formats?.map((format) => (
											<MenuItem
												key={format.id}
												value={format.id}
											>
												{format.descripcion}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>
										Select a format
									</FormHelperText>
								</FormControl>
							</div>
						</div>
						<br />
						<div className="row">
							<div className="col-6 gx-3">
								<FormControl style={{ width: "100%" }}>
									<InputLabel id="demo-simple-select-standard-label">
										Asset category *
									</InputLabel>
									<Select
										labelId="demo-simple-select-standard-label"
										id="demo-simple-select-standard"
										value={asset.asset_categoria_id || ""}
										onClick={handleChange(
											"asset_categoria_id"
										)}
										MenuProps={MenuProps}
									>
										{categories?.map((category) => (
											<MenuItem
												key={category.id}
												value={category.id}
											>
												{category.descripcion}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>
										Select a category
									</FormHelperText>
								</FormControl>
							</div>
							<div className="col-6 gx-3">
								<FormControl style={{ width: "100%" }}>
									<InputLabel id="demo-simple-select-standard-label">
										Asset extension *
									</InputLabel>
									<Select
										labelId="demo-simple-select-standard-label"
										id="demo-simple-select-standard"
										value={asset.asset_extension_id || ""}
										onClick={handleChange(
											"asset_extension_id"
										)}
										MenuProps={MenuProps}
									>
										{extensions?.map((extension) => (
											<MenuItem
												key={extension.id}
												value={extension.id}
											>
												{extension.descripcion}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>
										Select a extension
									</FormHelperText>
								</FormControl>
							</div>
						</div>
						<br />
						<FormControl style={{ width: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Asset tags
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={asset.tags || ""}
								multiple
								onChange={handleChange("tags")}
								MenuProps={MenuProps}
							>
								{tags?.map((tag) => (
									<MenuItem key={tag.id} value={tag.id}>
										{tag.descripcion}
									</MenuItem>
								))}
							</Select>
							<FormHelperText>Select tags</FormHelperText>
						</FormControl>
						<br />
						<br />
						<label htmlFor={"upload-file"}>
							<input
								style={{ display: "none" }}
								id={"upload-file"}
								name={"upload-file"}
								type="file"
								onChange={(e) => {
									setSelectedFile(e.target.files[0]);
								}}
							/>
							<Button
								style={{ marginRight: "15px" }}
								color="secondary"
								component="span"
								variant="outlined"
							>
								{selectedFile || asset.url !== ""
									? "Change file"
									: "Upload file"}
							</Button>
						</label>
						{(selectedFile || (asset.url && asset.url !== "")) && (
							<>
								<Tooltip title={"Preview file"}>
									<Button
										size="small"
										onClick={() =>
											setOpenPreviewDialog(true)
										}
										style={{
											...buttonsStyle,
											marginRight: "15px",
										}}
									>
										<Visibility />
									</Button>
								</Tooltip>
								<PreviewDialog
									title={"Preview file"}
									open={openPreviewDialog}
									setOpen={setOpenPreviewDialog}
									src={
										selectedFile
											? URL.createObjectURL(selectedFile)
											: asset.url
									}
								/>
								<span>
									{selectedFile
										? selectedFile?.name
										: asset.url !== ""
										? asset.url.split(/-(.*)/s)[1]
										: ""}
								</span>
							</>
						)}
					</CardBody>
				</Card>
				<Button
					onClick={() => history.push("/assets")}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				<Button
					onClick={() => saveAsset()}
					variant="outlined"
					color="primary"
					style={{ marginRight: "20px" }}
				>
					Save asset
				</Button>
			</>
		);
}
