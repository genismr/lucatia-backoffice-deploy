import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import { Button, Chip } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { getUserById } from "../../../../api/user";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import { userRoles } from "../../../../utils/helpers";

export default function ViewUsersPage() {
	const [user, setUser] = useState(null);
	const userId = useParams().id;
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

	function getCommonEntities(entities) {
		let commonEntities = [];

		for (let i = 0; i < entities.length; ++i) {
			if (
				loggedUser.role.rango === userRoles.SUPER_ADMIN ||
				loggedUser.managedEntities.includes(entities[i].id)
			) {
				commonEntities.push(entities[i].nombre);
			}
		}

		return commonEntities;
	}

	useEffect(() => {
		if (!userId) {
			disableLoadingData();
			history.push("/users");
			return;
		}
		getUserById(userId, loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					let user = res.data;

					user.fecha_nacimiento = user.fecha_nacimiento.substring(
						0,
						user.fecha_nacimiento.lastIndexOf("T")
					);
					setUser(user);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get user info.",
				});
				history.push("/users");
			});
	}, [userId, disableLoadingData, history]);

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="View user info"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Nombre</h5>
								<p>{user.nombre || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Apellidos</h5>
								<p>{user.apellidos || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Email</h5>
								<p>{user.email || "---"}</p>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Código</h5>
								<p>{user.codigo_hexa || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Teléfono</h5>
								<p>{user.telefono || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Fecha de nacimiento</h5>
								{user.fecha_nacimiento != "0001-01-01" ? (
									<p>{user.fecha_nacimiento}</p>
								) : (
									<p>{"---"}</p>
								)}
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Role</h5>
								<p>{user.role.descripcion || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Dirección</h5>
								<p>{user.direccion || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Población</h5>
								<p>{user.poblacion || "---"}</p>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Código Postal</h5>
								<p>{user.cp || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Província</h5>
								<p>{user.provincia?.nombre || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>País</h5>
								<p>{user.pais || "---"}</p>
							</div>
						</div>
						<h5>Entidades asignadas</h5>
						{!user.owned_entities.length && <p>{"---"}</p>}
						{user.owned_entities.length > 0 && (
							<>
								<div className="row ml-0">
									{getCommonEntities(user.owned_entities).map(
										(data) => {
											return (
												<Chip
													label={data}
													className="mr-2 mt-2"
												/>
											);
										}
									)}
								</div>
								<br />
							</>
						)}
						<h5>Entidades gestionadas</h5>
						{!user.managed_entities.length && <p>{"---"}</p>}
						{user.managed_entities.length > 0 && (
							<>
								<div className="row ml-0">
									{getCommonEntities(
										user.managed_entities
									).map((data) => {
										return (
											<Chip
												label={data}
												className="mr-2 mt-2"
											/>
										);
									})}
								</div>
								<br />
							</>
						)}
						<h5>Apps asignadas</h5>
						{!user.apps.length && <p>{"---"}</p>}
						{user.apps.length > 0 && (
							<>
								<div className="row ml-0">
									{user.apps.map((data) => {
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
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Estado</h5>
								{user.activo ? <p>Activo</p> : <p>Inactivo</p>}
							</div>
						</div>
					</CardBody>
				</Card>
				<div style={{ display: "flex", flexDirection: "row" }}>
					<Button
						onClick={() => history.push("/users")}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Back
					</Button>
				</div>
			</>
		);
}
