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
import {
	postEntity,
	getEntities,
	getEntityById,
	updateEntity,
	setEntityActive,
	setEntityInactive,
} from "../../../../api/entity";
import { getUsers } from "../../../../api/user";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import LinkIcon from "@material-ui/icons/Link";
import EntityContactsTableDialog from "../../../components/dialogs/EntityContactsTableDialog";
import { checkIsEmpty } from "../../../../utils/helpers";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import { getRoles } from "../../../../api/role";

// Create theme for delete button (red)
const theme = createMuiTheme({
	palette: {
		secondary: {
			main: "#F64E60",
		},
	},
});

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
		contacto_propietario: null,
		contacto_tecnico: null,
		contacto_administrativo: null,
		contacto_helpdesk: null,
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
	const [openTableDialog, setOpenTableDialog] = useState(null);

	const [
		contactoPropietarioSelected,
		setContactoPropietarioSelected,
	] = useState(null);

	const [contactoTecnicoSelected, setContactoTecnicoSelected] = useState(
		null
	);

	const [
		contactoAdministrativoSelected,
		setContactoAdministrativoSelected,
	] = useState(null);

	const [contactoHelpDeskSelected, setContactoHelpDeskSelected] = useState(
		null
	);

	const [roles, setRoles] = useState(null);
	const [users, setUsers] = useState(null);

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

	function getPermittedRoles(roles) {
		let data = [];
		for (let i = 0; i < roles.length; ++i) {
			if (
				loggedUser.role.rango === 0 ||
				roles[i].rango > loggedUser.role.rango
			) {
				let elem = {};
				elem.id = roles[i].id;
				elem.descripcion = roles[i].descripcion;

				data = data.concat(elem);
			}
		}

		return data;
	}

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
		getUsers(loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setUsers(res.data);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get users.",
				});
			});
		getRoles()
			.then((res) => {
				if (res.status === 200) {
					setRoles(getPermittedRoles(res.data));
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get roles.",
				});
			});
		if (!entityId) {
			disableLoadingData();
			return;
		}
		getEntityById(entityId, loggedUser.accessToken)
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
		if (entity.entidad_padre_id == 0) saveEntity.entidad_padre_id = null;
		if (!entityId) {
			postEntity(saveEntity, loggedUser.accessToken)
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
			if (entity.entidad_padre_id == 0)
				saveEntity.entidad_padre_id = null;

			updateEntity(entityId, saveEntity, loggedUser.accessToken)
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

	function getUserInfo(userId) {
		if (users != null) {
			let user = users.find((x) => x.id == userId);
			return user
				? user.nombre +
						" " +
						(user.apellidos != null ? user.apellidos : "") +
						" - " +
						user.email +
						(user.telefono != null ? " - " + user.telefono : "")
				: "";
		}
		return null;
	}

	function updateContacto(user) {
		if (contactoPropietarioSelected) {
			setContactoPropietarioSelected(null);
			entity.contacto_propietario = user.id;
		} else if (contactoTecnicoSelected) {
			setContactoTecnicoSelected(null);
			entity.contacto_tecnico = user.id;
		} else if (contactoAdministrativoSelected) {
			setContactoAdministrativoSelected(null);
			entity.contacto_administrativo = user.id;
		} else if (contactoHelpDeskSelected) {
			setContactoHelpDeskSelected(null);
			entity.contacto_helpdesk = user.id;
		}
	}

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit entity"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-4 gx-3">
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
							</div>
							<div className="col-4 gx-3">
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
							</div>
							<div className="col-4 gx-3">
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
							</div>
						</div>
						<div className="row">
							<div className="col-6 gx-3">
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
							</div>
							<div className="col-6 gx-3">
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
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
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
							</div>
							<div className="col-4 gx-3">
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
							</div>
							<div className="col-4 gx-3">
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
							</div>
						</div>
						<br />
						<div className="row">
							<div className="col-6 gx-3">
								<TextField
									id={`propietario`}
									label="Contacto propietario"
									value={getUserInfo(
										entity.contacto_propietario
									)}
									onChange={handleChange(
										"contacto_propietario"
									)}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<Tooltip title="Select contact">
													<Button
														onClick={() => {
															setContactoPropietarioSelected(
																true
															);
															setOpenTableDialog(
																true
															);
														}}
													>
														<PersonAddIcon />
													</Button>
												</Tooltip>
											),
										})
									}
								/>
							</div>
							<div className="col-6 gx-3">
								<TextField
									id={`helpDesk`}
									label="Contacto técnico"
									value={getUserInfo(entity.contacto_tecnico)}
									onChange={handleChange("contacto_tecnico")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<Tooltip title="Select contact">
													<Button
														onClick={() => {
															setContactoTecnicoSelected(
																true
															);
															setOpenTableDialog(
																true
															);
														}}
													>
														<PersonAddIcon />
													</Button>
												</Tooltip>
											),
										})
									}
								/>
							</div>
						</div>
						<div className="row">
							<div className="col-6 gx-3">
								<TextField
									id={`administrativo`}
									label="Contacto administrativo"
									value={getUserInfo(
										entity.contacto_administrativo
									)}
									onChange={handleChange(
										"contacto_administrativo"
									)}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<Tooltip title="Select contact">
													<Button
														onClick={() => {
															setContactoAdministrativoSelected(
																true
															);
															setOpenTableDialog(
																true
															);
														}}
													>
														<PersonAddIcon />
													</Button>
												</Tooltip>
											),
										})
									}
								/>
							</div>
							<div className="col-6 gx-3">
								<TextField
									id={`helpDesk`}
									label="Contacto helpDesk"
									value={getUserInfo(
										entity.contacto_helpdesk
									)}
									onChange={handleChange("contacto_helpdesk")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									InputProps={
										({ readOnly: true },
										{
											endAdornment: (
												<Tooltip title="Select contact">
													<Button
														onClick={() => {
															setContactoHelpDeskSelected(
																true
															);
															setOpenTableDialog(
																true
															);
														}}
													>
														<PersonAddIcon />
													</Button>
												</Tooltip>
											),
										})
									}
								/>
							</div>
						</div>
						{loggedUser.role.rango === 0 && (
							<>
								<div className="row">
									<div className="col-6 gx-3">
										<Autocomplete
											id="autocomplete-parent-entity"
											autoSelect
											disablePortal
											options={parentEntities}
											getOptionLabel={(option) =>
												option.nombre
											}
											onChange={(event, selected) => {
												setEntity({
													...entity,
													entidad_padre_id:
														selected?.id,
												});
											}}
											value={
												parentEntities?.find(
													(x) =>
														x.id ==
														entity.entidad_padre_id
												) || ""
											}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Entidad padre"
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
							</>
						)}
					</CardBody>
					<EntityContactsTableDialog
						open={openTableDialog}
						setOpen={setOpenTableDialog}
						data={users}
						roles={roles}
						title="Users"
						onSelectRow={(item) => {
							updateContacto(item);
							setOpenTableDialog(false);
						}}
						onUserCreated={(user) => {
							let newUsers = users;
							newUsers.push(user);
							setUsers(newUsers);
							updateContacto(user);
						}}
					/>
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
