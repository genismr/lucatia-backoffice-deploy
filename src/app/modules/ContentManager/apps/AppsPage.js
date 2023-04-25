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
import { getApps, postApp, deleteApp } from "../../../../api/app";
import {
	Button,
	Tooltip,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@material-ui/core";
import FiltersCard from "../../../components/filters/Filter";
import DeleteIcon from "@material-ui/icons/Delete";
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

function getData(apps) {
	let data = [];
	for (let i = 0; i < apps.length; ++i) {
		const elem = {};

		elem.faviconApp = apps[i].icono_id;
		elem.nombre = apps[i].nombre;
		elem.tecnologia = "??";
		elem.faviconOwnerEntity = "??";
		elem.faviconsDelegatedEntities = "??";
		elem.id = apps[i].id;
		data = data.concat(elem);
	}
	return data;
}

export default function AppsPage() {
	const [data, setData] = useState([]);
	const [appId, setAppId] = useState(null);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);
	const [refresh, setRefresh] = useState(false);
	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);

	const history = useHistory();
	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

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
						onClick={() => history.push("/view-app/" + cell)}
					>
						<ViewIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/edit-app/" + cell)}
					>
						<EditIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Delete">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							setAppId(cell);
							setOpenConfirmDialog(2);
						}}
					>
						<DeleteIcon />
					</Button>
				</Tooltip>
			</>
		);
	}

	const columns = [
		{
			dataField: "faviconApp",
			text: "App Icon",
			formatter: imageFormatter,
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{
			dataField: "tecnologia",
			text: "Tecnología",
		},
		{
			dataField: "faviconOwnerEntity",
			text: "Owner Entity Icon",
			formatter: imageFormatter,
		},
		{
			dataField: "faviconsDelegatedEntities",
			text: "Delegated Entities Icon",
			formatter: imageFormatter,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	useEffect(() => {
		getApps(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setData(getData(res.data));
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get apps.",
				});
			});
	}, [refresh]);

	return (
		<>
			<Card>
				<CardHeader title="Apps list">
					{loggedUser.role.rango === 0 && (
						<CardHeaderToolbar>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => history.push("/edit-app")}
							>
								Add new
							</button>
						</CardHeaderToolbar>
					)}
				</CardHeader>
				<CardBody>
					<Table data={data} columns={columns} />
					<ConfirmDialog
						title={"Are you sure you want to remove this app?"}
						open={openConfirmDialog === 2}
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
												"App removed successfully.",
										});
										setRefresh(true);
									}
								})
								.catch((error) => {
									alertError({
										error: error,
										customMessage: "Could not delete app.",
									});
								});
						}}
					/>
				</CardBody>
			</Card>
		</>
	);
}
