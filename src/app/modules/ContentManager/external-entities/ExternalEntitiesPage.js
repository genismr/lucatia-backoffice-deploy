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
import { getEntities, setEntityActive, setEntityInactive } from "../../../../api/entity";
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
import ToggleOffIcon from "@material-ui/icons/ToggleOff";
import ToggleOnIcon from "@material-ui/icons/ToggleOn";
import { getExternalEntities } from "../../../../api/external-entity";

function getData(externalEntities) {
	let data = [];
	for (let i = 0; i < externalEntities.length; ++i) {
		const elem = {};

		elem.nombre = externalEntities[i].nombre;
		elem.razonSocial = externalEntities[i].razon_social;
		elem.id = externalEntities[i].id;

		data = data.concat(elem);
	}

	return data;
}

export default function ExternalEntitiesPage() {
	const [data, setData] = useState([]);
	const [refresh, setRefresh] = useState(false);

	const history = useHistory();

	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	function buttonFormatter(cell) {
		return (
			<>
				<Tooltip title="View">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/view-external-entity/" + cell)}
					>
						<ViewIcon />
					</Button>
				</Tooltip>
				<Tooltip title="Edit">
					<Button
						style={buttonsStyle}
						size="small"
						onClick={() => history.push("/edit-external-entity/" + cell)}
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
			dataField: "razonSocial",
			text: "Razón Social",
			sort: true,
		},
		{ dataField: "id", text: "", formatter: buttonFormatter },
	];

	useEffect(() => {
		getExternalEntities(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setData(getData(res.data));
					setRefresh(false);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get external entities.",
				});
			});
	}, [refresh]);

	return (
		<>
			<Card>
				<CardHeader title="External Entities list">
					{(loggedUser.role.rango === 0 || loggedUser.role.rango === 10) && (
						<CardHeaderToolbar>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => history.push("/edit-external-entity")}
							>
								Add new
							</button>
						</CardHeaderToolbar>
					)}
				</CardHeader>
				<CardBody>
					<Table data={data} columns={columns} />
				</CardBody>
			</Card>
		</>
	);
}
