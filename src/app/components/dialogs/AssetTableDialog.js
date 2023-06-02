import React, { useEffect, useState } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Tooltip,
	MuiThemeProvider,
	createMuiTheme,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	TextField,
	Chip,
} from "@material-ui/core";
import Table, {
	buttonsStyle,
	dateFormatter,
	substringFormatter,
} from "../tables/table";
import {
	Card,
	CardBody,
	CardHeader,
	CardHeaderToolbar,
} from "../../../_metronic/_partials/controls";
import AddResourceIcon from "@material-ui/icons/AddPhotoAlternate";
import DownloadIcon from "@material-ui/icons/GetApp";
import { Visibility } from "@material-ui/icons";
import PreviewDialog from "./PreviewDialog";
import { Autocomplete } from "@material-ui/lab";
import FiltersCard from "../filters/Filter";
import AddTagIcon from "@material-ui/icons/PlaylistAdd";
import TagsTableDialog from "./TagsTableDialog";
import { assignTags, deleteAsset, postAsset } from "../../../api/asset";
import { shallowEqual, useSelector } from "react-redux";
import { alertError, alertSuccess } from "../../../utils/logger";
import { checkIsEmpty } from "../../../utils/helpers";

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

const initialFilters = {
	tags: [],
};



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

const AssetTableDialog = (props) => {
	const {
		title,
		open,
		setOpen,
		data,
		onSelectRow,
		type,
		formats,
		categories,
		extensions,
		tags,
		onAssetCreated,
	} = props;

	function getData(assets) {
		let data = [];
		for (let i = 0; i < assets.length; ++i) {
			const elem = {};

			if (assets[i].type.id === type?.id) {
				elem.faviconType = assets[i].type.icono_id;
				elem.nombre = assets[i].descripcion;
				elem.type = assets[i].type.descripcion;
				elem.category = assets[i].category.descripcion;
				elem.faviconFormat = assets[i].format.icono_id;
				elem.extension = assets[i].extension.descripcion;
				elem.url = assets[i].url;
				elem.id = assets[i].id;
				data = data.concat(elem);
			}
		}
		return data;
	}

	const [asset, setAsset] = useState(getEmptyAsset());

	const [allTags, setAllTags] = useState([...tags]);

	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);

	const [openTagTableDialog, setOpenTagTableDialog] = useState(null);

	const [filteredData, setFilteredData] = useState([...data]);
	const [collapsed, setCollapsed] = useState(true);
	const [filterOptions, setFilterOptions] = useState(initialFilters);

	const [renderInputFields, setRenderInputFields] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);

	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	function urlFormatter(cell) {
		const elem = data.find((item) => item.id === cell);
		return (
			<>
				<Button
					style={buttonsStyle}
					size="small"
					onClick={() => window.open(elem.url, "_blank").focus()}
				>
					<DownloadIcon />
				</Button>
			</>
		);
	}

	function imageFormatter(cell) {
		return cell && cell !== "" ? (
			<img
				//src={SERVER_URL + '/' + cell}
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
		const elem = data.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title="View">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							setPreviewImage(elem.url);
							setOpenPreviewDialog(true);
						}}
					>
						<Visibility />
					</Button>
				</Tooltip>
				<Tooltip title="Select">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							onSelectRow(elem);
						}}
					>
						<AddResourceIcon />
					</Button>
				</Tooltip>
			</>
		);
	}

	const columns = [
		{
			dataField: "faviconType",
			text: "Type",
			formatter: imageFormatter,
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{
			dataField: "type",
			text: "Tipo",
			sort: true,
		},
		{
			dataField: "category",
			text: "Categoría",
		},
		{
			dataField: "faviconFormat",
			text: "Format",
			sort: true,
			formatter: imageFormatter,
		},
		{
			dataField: "extension",
			text: "Extensión",
		},
		{
			dataField: "id",
			text: "File",
			align: "center",
			headerAlign: "center",
			formatter: urlFormatter,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	const handleSearch = async () => {
		if (!data.length) return;
		setFilteredData(
			data.filter((item) => {
				let filter = true;
				if (filterOptions.tags && filterOptions.tags.length);
				filter =
					filter &&
					filterOptions.allTags.some((t) =>
						item.tags.map((tg) => tg.id).includes(t.id)
					);
				if (filter) return item;
				return false;
			})
		);
	};

	const handleClearFilters = () => {
		setFilterOptions(initialFilters);
		setFilteredData([...data]);
	};

	const renderFiltersContent = () => {
		return (
			<>
				<Autocomplete
					multiple
					id="autocomplete tag"
					filterSelectedOptions
					disablePortal
					disableCloseOnSelect
					options={allTags}
					getOptionLabel={(option) => option.descripcion}
					value={filterOptions.tags || []}
					onChange={(event, selected) => {
						setFilterOptions({
							...filterOptions,
							tags: selected,
						});
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							margin="normal"
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							label="Tag"
						/>
					)}
				/>
			</>
		);
	};

	const handleChange = (element) => (event) => {
		let text = event.target.value;
		setAsset({ ...asset, [element]: text });
	};

	function saveAsset() {
		if (
			checkIsEmpty(asset.descripcion) ||
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
		asset.asset_tipo_id = type.id;
		postAsset(asset, selectedFile, loggedUser.accessToken)
			.then((res) => {
				if (res.status === 201) {
					if (asset.tags.length) {
						let assetId = res.data.id;
						assignTags(assetId, asset.tags, loggedUser.accessToken)
							.then((res) => {
								if (res.status === 200) {
									alertSuccess({
										title: "Saved!",
										customMessage:
											"Asset successfully created.",
									});
								}
							})
							.catch((error) => {
								deleteAsset(assetId, loggedUser.accessToken);
								alertError({
									error: error,
									customMessage: "Could not assign tags.",
								});
							});
					} else {
						alertSuccess({
							title: "Saved!",
							customMessage: "Asset successfully created.",
						});
					}

					let newAsset = res.data;
					newAsset.type = type;
					newAsset.category = categories.find(
						(x) => x.id === asset.asset_categoria_id
					);
					newAsset.format = formats.find(
						(x) => x.id === asset.asset_formato_id
					);
					newAsset.extension = extensions.find(
						(x) => x.id === asset.asset_extension_id
					);
					newAsset.tags = asset.tags;

					onAssetCreated(newAsset);
					setAsset(getEmptyAsset());
					setRenderInputFields(null);
					setOpen(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not save asset.",
				});
			});
	}

	function renderTagSelector() {
		return (
			<>
				<div className="d-flex justify-content-between">
					<Button
						onClick={() => {
							setOpenTagTableDialog(true);
						}}
					>
						<AddTagIcon />
					</Button>
					<div className="w-100">
						<Autocomplete
							multiple
							id="autocomplete-tags"
							filterSelectedOptions
							options={allTags}
							value={allTags.filter((x) =>
								asset?.tags.includes(x.id)
							)}
							getOptionLabel={(option) => option.descripcion}
							open={false}
							freeSolo
							readOnly
							disableClearable
							renderTags={(value) =>
								value.map((option, index) => (
									<Chip
										label={option.descripcion}
										className="m-2"
									/>
								))
							}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Asset Tags"
									margin="normal"
									variant="outlined"
									InputProps={{
										readOnly: true,
										...params.InputProps,
									}}
								/>
							)}
						/>
					</div>
				</div>
			</>
		);
	}

	function renderAssetFields() {
		return (
			<>
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
								Type *
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={type.id || ""}
								MenuProps={MenuProps}
								disabled
							>
								<MenuItem key={type.id} value={type.id}>
									{type.descripcion}
								</MenuItem>
							</Select>
						</FormControl>
					</div>
					<div className="col-6 gx-3">
						<FormControl style={{ width: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Format *
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={asset.asset_formato_id || ""}
								onClick={handleChange("asset_formato_id")}
								MenuProps={MenuProps}
							>
								{formats?.map((format) => (
									<MenuItem key={format.id} value={format.id}>
										{format.descripcion}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</div>
				</div>
				<br />
				<div className="row">
					<div className="col-6 gx-3">
						<FormControl style={{ width: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Category *
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={asset.asset_categoria_id || ""}
								onClick={handleChange("asset_categoria_id")}
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
						</FormControl>
					</div>
					<div className="col-6 gx-3">
						<FormControl style={{ width: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Extension *
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={asset.asset_extension_id || ""}
								onClick={handleChange("asset_extension_id")}
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
						</FormControl>
					</div>
				</div>
				<br />
				{renderTagSelector()}
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
								onClick={() => setOpenPreviewDialog(true)}
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
				<br />
				<div className="d-flex justify-content-end">
					<Button
						onClick={() => {
							setRenderInputFields(null);
							setAsset(getEmptyAsset());
							setSelectedFile(null);
						}}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Cancel
					</Button>
					<Button
						onClick={() => saveAsset()}
						variant="outlined"
						color="primary"
					>
						Save asset
					</Button>
					<br />
					<br />
				</div>
				<br />
				<TagsTableDialog
					open={openTagTableDialog}
					setOpen={setOpenTagTableDialog}
					data={allTags}
					tagsSelected={asset.tags}
					onSaveSelectedTags={(selectedTags, allTags) => {
						asset.tags = selectedTags;
						setAllTags(allTags);
					}}
				/>
			</>
		);
	}

	return (
		<>
			<Dialog
				fullWidth={true}
				maxWidth="xl"
				open={open}
				onClose={() => setOpen(false)}
				aria-labelledby="table-dialog"
			>
				<DialogTitle id="table-dialog">{title}</DialogTitle>
				<DialogContent>
					<Card>
						<CardHeader title={"Assets list"}>
							<CardHeaderToolbar>
								<button
									type="button"
									className="btn btn-primary"
									onClick={() => {
										setRenderInputFields(true);
									}}
								>
									Add new
								</button>
							</CardHeaderToolbar>
						</CardHeader>
						<CardBody>
							{renderInputFields && renderAssetFields()}
							<FiltersCard
								filtersContent={renderFiltersContent}
								collapsed={collapsed}
								setCollapsed={setCollapsed}
								handleClearFilters={handleClearFilters}
								handleSearch={handleSearch}
							/>
							{!data || !data.length ? (
								<p>{"No assets found."}</p>
							) : (
								<Table
									data={getData(filteredData)}
									columns={columns}
								/>
							)}
						</CardBody>
					</Card>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setAsset(getEmptyAsset());
							setSelectedFile(null);
							setRenderInputFields(null);
							setOpen(false);
						}}
						variant="outlined"
						color="secondary"
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
			<PreviewDialog
				title={"Preview file"}
				open={openPreviewDialog}
				setOpen={setOpenPreviewDialog}
				src={previewImage}
			/>
		</>
	);
};
export default AssetTableDialog;
