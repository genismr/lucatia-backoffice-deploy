import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import { Button, Chip } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { getEntityById } from "../../../../api/entity";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";

export default function ViewEntitiesPage() {
	const [entity, setEntity] = useState(null);
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
		if (!entityId) {
			disableLoadingData();
			history.push("/entities");
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
					customMessage: "Could not get entity info.",
				});
				history.push("/entities");
			});
	}, [entityId, disableLoadingData, history]);

	function getUserInfo(user) {
		return user
			? user.nombre +
					" " +
					(user.apellidos != null ? user.apellidos : "") +
					" - " +
					user.email +
					(user.telefono != null ? " - " + user.telefono : "")
			: "---";
	}

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="View entity info"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Nombre</h5>
								<p>{entity.nombre || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Razon social</h5>
								<p>{entity.razon_social || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>NIF</h5>
								{entity.nif || "---"}
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Dirección</h5>
								<p>{entity.direccion || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Población</h5>
								<p>{entity.poblacion || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Código Postal</h5>
								<p>{entity.cp || "---"}</p>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Província</h5>
								<p>{entity.provincia || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>País</h5>
								<p>{entity.pais || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Contacto propietario</h5>
								<p>{getUserInfo(entity.contactoPropietario)}</p>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Contacto técnico</h5>
								<p>{getUserInfo(entity.contactoTecnico)}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Contacto administrativo</h5>
								<p>
									{getUserInfo(entity.contactoAdministrativo)}
								</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Contacto helpDesk</h5>
								<p>{getUserInfo(entity.contactoHelpDesk)}</p>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Entidad padre</h5>
								{!entity.parentEntity?.nombre && <p>{"---"}</p>}
								{entity.parentEntity?.nombre && (
									<>
										<Chip
											label={entity.parentEntity.nombre}
											className="mr-2 mt-2"
										></Chip>
										<br />
										<br />
									</>
								)}
							</div>
							<div className="col-4 gx-3">
								<h5>Apps en propiedad</h5>
								{!entity.ownedApps.length && <p>{"---"}</p>}
								{entity.ownedApps.length > 0 && (
									<>
										<div className="row ml-0">
											{entity.ownedApps.map((data) => {
												return (
													<Chip
														label={data.nombre}
														className="mr-2 mt-2"
													/>
												);
											})}
										</div>
										<br />
									</>
								)}
							</div>
							<div className="col-4 gx-3">
								<h5>Apps con acceso delegado</h5>
								{!entity.delegatedApps.length && <p>{"---"}</p>}
								{entity.delegatedApps.length > 0 && (
									<>
										<div className="row ml-0">
											{entity.delegatedApps.map(
												(data) => {
													return (
														<Chip
															label={data.nombre}
															className="mr-2 mt-2"
														/>
													);
												}
											)}
										</div>
										<br />
									</>
								)}
							</div>
						</div>
						<h5>Estado</h5>
						{entity.activo ? <p>Activo</p> : <p>Inactivo</p>}
					</CardBody>
				</Card>
				<div style={{ display: "flex", flexDirection: "row" }}>
					<Button
						onClick={() => history.push("/entities")}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Back
					</Button>
				</div>
			</>
		);
}
