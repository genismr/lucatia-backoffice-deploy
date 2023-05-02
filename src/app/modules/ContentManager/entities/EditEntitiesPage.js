import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import {
	Button,
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
	postEntity,
	getEntities,
	getEntityById,
	updateEntity,
	setEntityActive,
	setEntityInactive
} from "../../../../api/entity";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { checkIsEmpty } from "../../../../utils/helpers";

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

function getEmptyEntity() {
	return {
		entidad_padre_id: null,
		icono_id: null,
		nombre: "",
		razon_social: "",
		nif: null,
		direccion: null,
		cp: null,
		poblacion: null,
		provincia: null,
		pais: null,
		contacto_propietario: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
		contacto_tecnico: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
		contacto_administrativo: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
		contacto_helpdesk: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
		fecha_alta: "",
		user_alta_id: "",
		activo: true,
	};
}

export default function EditEntitiesPage() {
	const [entity, setEntity] = useState(getEmptyEntity());
	const [parentEntities, setParentEntities] = useState(null);
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
	const [refresh, setRefresh] = useState(false);


	const entityId = useParams().id;
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
		getEntities(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setParentEntities(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get entities.",
				});
				history.push("/entities");
			});
		if (!entityId) {
			disableLoadingData();
			return;
		}
		getEntityById(entityId)
			.then((res) => {
				if (res.status === 200) {
					setEntity(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get entity.",
				});
				history.push("/entities");
			});
	}, [entityId, disableLoadingData, history]);

	function saveEntity() {
		if (checkIsEmpty(entity.nombre) || checkIsEmpty(entity.razon_social)) {
			alertError({
				error: null,
				customMessage: "Some required fields are missing",
			});
			return;
		}

		let saveEntity = entity;
		if (!entityId) {
			saveEntity.fecha_alta = new Date();
			saveEntity.user_alta_id = loggedUser.userID;
			postEntity(saveEntity)
				.then((res) => {
					if (res.status === 201) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Entity successfully created.",
						});
						history.push("/entities");
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save entity.",
					});
				});
		} else {
			if (entity.entidad_padre_id == 0) entity.entidad_padre_id = null;
			updateEntity(entityId, saveEntity)
				.then((res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Changes successfully saved.",
						});
						history.push("/entities");
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
		if (element != "entidad_padre_id" && event.target.value.trim() == "")
			text = null;
		if (
			element === "entidad_padre_id" &&
			event.target.value === entity[element]
		)
			text = null;
		setEntity({ ...entity, [element]: text });
	};

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit entity"></CardHeader>
					<CardBody>
						<TextField
							id={`nombre`}
							label="Nombre"
							value={entity.nombre}
							onChange={handleChange("nombre")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
							required
						/>
						<TextField
							id={`razonSocial`}
							label="Razon social"
							value={entity.razon_social}
							onChange={handleChange("razon_social")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
							required
						/>
						<TextField
							id={`nif`}
							label="NIF"
							value={entity.nif}
							onChange={handleChange("nif")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`direccion`}
							label="Dirección"
							value={entity.direccion}
							onChange={handleChange("direccion")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`codigoPostal`}
							label="Código Postal"
							value={entity.cp}
							onChange={handleChange("cp")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`poblacion`}
							label="Población"
							value={entity.poblacion}
							onChange={handleChange("poblacion")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`provincia`}
							label="Provincia"
							value={entity.provincia}
							onChange={handleChange("provincia")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`pais`}
							label="País"
							value={entity.pais}
							onChange={handleChange("pais")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`propietario`}
							label="Contacto propietario"
							value={entity.contacto_propietario}
							onChange={handleChange("contacto_propietario")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`tecnico`}
							label="Contacto técnico"
							value={entity.contacto_tecnico}
							onChange={handleChange("contacto_tecnico")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`administrativo`}
							label="Contacto administrativo"
							value={entity.contacto_administrativo}
							onChange={handleChange("contacto_administrativo")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						<TextField
							id={`helpDesk`}
							label="Contacto helpDesk"
							value={entity.contacto_helpdesk}
							onChange={handleChange("contacto_helpdesk")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
						/>
						{loggedUser.role.rango === 0 && (
							<>
								<br />
								<br />
								<FormControl style={{ width: "100%" }}>
									<InputLabel id="demo-simple-select-standard-label">
										Entidad padre
									</InputLabel>
									<Select
										labelId="demo-simple-select-standard-label"
										id="demo-simple-select-standard"
										value={entity.entidad_padre_id || ""}
										onClick={handleChange(
											"entidad_padre_id"
										)}
										MenuProps={MenuProps}
									>
										{parentEntities?.map((option) => (
											<MenuItem
												key={option.id}
												value={option.id}
											>
												{option.nombre}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>
										Select a parent entity
									</FormHelperText>
								</FormControl>
							</>
						)}
					</CardBody>
				</Card>
				<Button
					onClick={() => history.push("/entities")}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				<Button
					onClick={() => saveEntity()}
					variant="outlined"
					color="primary"
					style={{ marginRight: "20px" }}
				>
					Save entity
				</Button>
			</>
		);
}
