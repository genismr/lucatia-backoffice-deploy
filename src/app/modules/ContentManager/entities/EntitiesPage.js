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
import { getEntities, deleteEntity } from "../../../../api/entity";
import { getRoles } from "../../../../api/role";
import {
	Button,
	Tooltip,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ViewIcon from "@material-ui/icons/Visibility";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { useHistory, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { CheckBox } from "@material-ui/icons";
import { useSkeleton } from "../../../hooks/useSkeleton";

function getData(entities) {
	let data = [];
	for (let i = 0; i < entities.length; ++i) {
		const elem = {};
		elem.favicon = "??"
		elem.nombre = entities[i].nombre;
		elem.faviconParentEntity = "??";
		elem.ownerName = "??"
		elem.id = entities[i].id;
		data = data.concat(elem);
	}
	return data;
}

export default function EntitiesPage() {
	const [data, setData] = useState([]);
	const [entityId, setEntityId] = useState(null);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(null);
	const [refresh, setRefresh] = useState(false);
	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);

	const history = useHistory();
	const user = useSelector(
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
						onClick={() =>
							history.push("/view-entity/" + cell)
						}
					>
						<ViewIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/edit-entity/" + cell)}
					>
						<EditIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Delete">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => {
							setEntityId(cell);
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
		{ dataField: "favicon", text: "Icon", formatter: imageFormatter },
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{ dataField: "faviconParentEntity", text: "Parent entity", formatter: imageFormatter },
		{ dataField: "ownerName", text: "Owner name" },
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	useEffect(() => {
		getEntities(user.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setData(getData(res.data));
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get entities.",
				});
			});
	}, [refresh]);

	return (
		<>
			<Card>
				<CardHeader title="Entities list">
					{(user.role.rango === 0 || user.role.rango === 10) && (
						<CardHeaderToolbar>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => history.push("/edit-entity")}
							>
								Add new
							</button>
						</CardHeaderToolbar>
					)}
				</CardHeader>
				<CardBody>
					<Table data={data} columns={columns} />
					<ConfirmDialog
						title={"Are you sure you want to remove this entity?"}
						open={openConfirmDialog === 2}
						setOpen={setOpenConfirmDialog}
						onConfirm={() => {
							deleteEntity(entityId)
								.then((res) => {
									if (
										res.status === 204 ||
										res.status === 200
									) {
										alertSuccess({
											title: "Deleted!",
											customMessage:
												"Entity removed successfully.",
										});
										setRefresh(true);
									}
								})
								.catch((error) => {
									alertError({
										error: error,
										customMessage:
											"Could not remove entity.",
									});
								});
						}}
					/>
				</CardBody>
			</Card>
		</>
	);
}
