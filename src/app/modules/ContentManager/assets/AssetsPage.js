import React, { useEffect, useState } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import Table, {
	dateFormatter,
	buttonsStyle,
} from "../../../components/tables/table";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import {
	getAssets,
	getTypes,
	getCategories,
	getFormats,
	getExtensions,
	getTags,
} from "../../../../api/asset";
import {
	Button,
	Tooltip,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@material-ui/core";
import FiltersCard from "../../../components/filters/Filter";
import EditIcon from "@material-ui/icons/Edit";
import ViewIcon from "@material-ui/icons/Visibility";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { useHistory, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { CheckBox } from "@material-ui/icons";
import { useSkeleton } from "../../../hooks/useSkeleton";
import LinkIcon from "@material-ui/icons/Link";

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
	types: [],
	categories: [],
	formats: [],
	extensions: [],
	tags: [],
};

function getData(assets) {
	let data = [];
	for (let i = 0; i < assets.length; ++i) {
		const elem = {};

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
	return data;
}

export default function AssetsPage() {
	const [data, setData] = useState([]);
	const [assetId, setAssetId] = useState(null);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);
	const [refresh, setRefresh] = useState(false);
	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);

	const [types, setTypes] = useState(null);
	const [categories, setCategories] = useState(null);
	const [formats, setFormats] = useState(null);
	const [extensions, setExtensions] = useState(null);
	const [tags, setTags] = useState(null);

	const [filteredData, setFilteredData] = useState([]);
	const [collapsed, setCollapsed] = useState(true);
	const [filterOptions, setFilterOptions] = useState(initialFilters);

	const history = useHistory();
	const user = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	function urlFormatter(cell) {
		const elem = data.find((item) => item.id === cell);
		return (
			<>
				<Tooltip title={elem.url}>
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => window.open(elem.url, "_blank").focus()}
					>
						<LinkIcon />
					</Button>
				</Tooltip>
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
						onClick={() => history.push("/view-asset/" + cell)}
					>
						<ViewIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/edit-asset/" + cell)}
					>
						<EditIcon />
					</Button>
				</Tooltip>				
			</>
		);
	}

	const columns = [
		{
			dataField: "faviconType",
			text: "Type Icon",
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
			text: "Format Icon",
			sort: true,
			formatter: imageFormatter,
		},
		{
			dataField: "extension",
			text: "Extensión",
		},
		{
			dataField: "id",
			text: "URL",
			formatter: urlFormatter,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	useEffect(() => {
		getTypes()
			.then((res) => {
				if (res.status === 200) {
					setTypes(res.data);
					setRefresh(false);
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
					setRefresh(false);
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
					setRefresh(false);
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
					setRefresh(false);
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
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get assets.",
				});
			});
		getAssets()
			.then((res) => {
				if (res.status === 200) {
					setData(res.data);
					console.log("assets");
					console.log(res.data);
					setFilteredData(res.data);
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get assets.",
				});
			});
	}, [refresh]);

	const handleSearch = async () => {
		if (!data.length) return;
		setFilteredData(
			data.filter((item) => {
				let filter = true;
				if (filterOptions.types && filterOptions.types.length)
					filter =
						filter && filterOptions.types.includes(item.type.id);
				if (filterOptions.categories && filterOptions.categories.length)
					filter =
						filter &&
						filterOptions.categories.includes(item.category.id);
				if (filterOptions.formats && filterOptions.formats.length)
					filter =
						filter &&
						filterOptions.formats.includes(item.format.id);
				if (filterOptions.extensions && filterOptions.extensions.length)
					filter =
						filter &&
						filterOptions.extensions.includes(item.extension.id);
				if (filterOptions.tags && filterOptions.tags.length)
					filter =
						filter &&
						filterOptions.tags.some((t) =>
							item.tags.map((tg) => tg.id).includes(t)
						);
				if (filter) return item;
				return false;
			})
		);
	};

	const handleClearFilters = () => {
		setFilterOptions(initialFilters);
		setRefresh(true);
	};

	const handleChange = (element) => (event) => {
		setFilterOptions({ ...filterOptions, [element]: event.target.value });
		console.log(filterOptions);
	};

	const renderFiltersContent = () => {
		return (
			<>
				<FormControl style={{ width: "100%" }}>
					<InputLabel id="demo-simple-select-standard-label">
						Type
					</InputLabel>
					<Select
						labelId="demo-simple-select-standard-label"
						id="demo-simple-select-standard"
						value={filterOptions.types || []}
						multiple
						onChange={handleChange("types")}
						MenuProps={MenuProps}
					>
						{types?.map((type) => (
							<MenuItem key={type.id} value={type.id}>
								{type.descripcion}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<br />
				<br />
				<FormControl style={{ width: "100%" }}>
					<InputLabel id="demo-simple-select-standard-label">
						Category
					</InputLabel>
					<Select
						labelId="demo-simple-select-standard-label"
						id="demo-simple-select-standard"
						value={filterOptions.categories || []}
						multiple
						onChange={handleChange("categories")}
						MenuProps={MenuProps}
					>
						{categories?.map((category) => (
							<MenuItem key={category.id} value={category.id}>
								{category.descripcion}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<br />
				<br />
				<FormControl style={{ width: "100%" }}>
					<InputLabel id="demo-simple-select-standard-label">
						Format
					</InputLabel>
					<Select
						labelId="demo-simple-select-standard-label"
						id="demo-simple-select-standard"
						value={filterOptions.formats || []}
						multiple
						onChange={handleChange("formats")}
						MenuProps={MenuProps}
					>
						{formats?.map((format) => (
							<MenuItem key={format.id} value={format.id}>
								{format.descripcion}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<br />
				<br />
				<FormControl style={{ width: "100%" }}>
					<InputLabel id="demo-simple-select-standard-label">
						Extension
					</InputLabel>
					<Select
						labelId="demo-simple-select-standard-label"
						id="demo-simple-select-standard"
						value={filterOptions.extensions || []}
						multiple
						onChange={handleChange("extensions")}
						MenuProps={MenuProps}
					>
						{extensions?.map((extension) => (
							<MenuItem key={extension.id} value={extension.id}>
								{extension.descripcion}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<br />
				<br />
				<FormControl style={{ width: "100%" }}>
					<InputLabel id="demo-simple-select-standard-label">
						Tag
					</InputLabel>
					<Select
						labelId="demo-simple-select-standard-label"
						id="demo-simple-select-standard"
						value={filterOptions.tags || []}
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
				</FormControl>
				<br />
				<br />
			</>
		);
	};

	return (
		<>
			<Card>
				<CardHeader title="Assets list">
					<CardHeaderToolbar>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => history.push("/edit-asset")}
						>
							Add new
						</button>
					</CardHeaderToolbar>
				</CardHeader>
				<CardBody>
					<FiltersCard
						filtersContent={renderFiltersContent}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
						handleClearFilters={handleClearFilters}
						handleSearch={handleSearch}
					/>
					<Table data={getData(filteredData)} columns={columns} />					
				</CardBody>
			</Card>
		</>
	);
}
