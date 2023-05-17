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
	InputAdornment,
} from "@material-ui/core";
import { buttonsStyle } from "../../../components/tables/table";
import { useHistory, useParams } from "react-router-dom";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import LinkIcon from "@material-ui/icons/Link";
import EntityContactsTableDialog from "../../../components/dialogs/EntityContactsTableDialog";
import { checkIsEmpty } from "../../../../utils/helpers";
import {
	getExternalEntityById,
	postExternalEntity,
	updateExternalEntity,
} from "../../../../api/external-entity";

// Create theme for delete button (red)
const theme = createMuiTheme({
	palette: {
		secondary: {
			main: "#F64E60",
		},
	},
});

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

function getEmptyExternalEntity() {
	return {
		nombre: "",
		razon_social: null,
		nif: null,
		telefono: null,
		direccion: null,
		cp: null,
		poblacion: null,
		provincia: null,
		pais: null,
		fecha_alta: "",
		user_alta_id: "",
	};
}

export default function EditExternalEntitiesPage() {
	const [externalEntity, setExternalEntity] = useState(
		getEmptyExternalEntity()
	);

	const externalEntityId = useParams().id;
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
		if (!externalEntityId) {
			disableLoadingData();
			return;
		}
		getExternalEntityById(externalEntityId, loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setExternalEntity(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get external entity.",
				});
				history.push("/external-entities");
			});
	}, [externalEntityId, disableLoadingData, history]);

	function saveExternalEntity() {
		if (checkIsEmpty(externalEntity.nombre)) {
			alertError({
				error: null,
				customMessage: "Nombre is required",
			});
			return;
		}

		if (!externalEntityId) {
			postExternalEntity(externalEntity, loggedUser.accessToken)
				.then((res) => {
					if (res.status === 201) {
						alertSuccess({
							title: "Saved!",
							customMessage:
								"External entity successfully created.",
						});
						history.push("/external-entities");
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save external entity.",
					});
				});
		} else {
			updateExternalEntity(externalEntityId, externalEntity, loggedUser.accessToken)
				.then((res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Changes successfully saved.",
						});
						history.push("/external-entities");
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
		if (event.target.value.trim() == "") text = null;
		setExternalEntity({ ...externalEntity, [element]: text });
	};

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit external entity"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-4 gx-3">
								<TextField
									id={`nombre`}
									label="Nombre"
									value={externalEntity.nombre}
									onChange={handleChange("nombre")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									required
								/>
							</div>
							<div className="col-4 gx-3">
								<TextField
									id={`razonSocial`}
									label="Razónn social"
									value={externalEntity.razon_social}
									onChange={handleChange("razon_social")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
							<div className="col-4 gx-3">
								<TextField
									id={`nif`}
									label="NIF"
									value={externalEntity.nif}
									onChange={handleChange("nif")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<TextField
									id={`telefono`}
									label="Teléfono"
									value={externalEntity.telefono}
									onChange={handleChange("telefono")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
							<div className="col-4 gx-3">
								<TextField
									id={`direccion`}
									label="Dirección"
									value={externalEntity.direccion}
									onChange={handleChange("direccion")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
							<div className="col-4 gx-3">
								<TextField
									id={`poblacion`}
									label="Población"
									value={externalEntity.poblacion}
									onChange={handleChange("poblacion")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<TextField
									id={`codigoPostal`}
									label="Código Postal"
									value={externalEntity.cp}
									onChange={handleChange("cp")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
							<div className="col-4 gx-3">
								<TextField
									id={`provincia`}
									label="Província"
									value={externalEntity.provincia}
									onChange={handleChange("provincia")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
							<div className="col-4 gx-3">
								<TextField
									id={`pais`}
									label="País"
									value={externalEntity.pais}
									onChange={handleChange("pais")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
								/>
							</div>
						</div>
					</CardBody>
				</Card>
				<Button
					onClick={() => history.push("/external-entities")}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				<Button
					onClick={() => saveExternalEntity()}
					variant="outlined"
					color="primary"
					style={{ marginRight: "20px" }}
				>
					Save external entity
				</Button>
			</>
		);
}
