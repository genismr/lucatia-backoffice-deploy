import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import { Button } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { getUserById } from "../../../../api/user";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";

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

	function getCommonEntities() {
		let commonEntities = [];

		for (let i = 0; i < user.entities.length; ++i) {
			console.log(user.entities[i].id)
			if ((loggedUser.managedEntities).includes(user.entities[i].id)) {
				commonEntities.push(user.entities[i].nombre)
			}
		}

		return commonEntities.join(", ");
	}

	useEffect(() => {
		if (!userId) {
			disableLoadingData();
			history.push("/users");
			return;
		}
		getUserById(userId)
			.then((res) => {
				if (res.status === 200) {
					let user = res.data;

					user.fecha_nacimiento = user.fecha_nacimiento.substring(
						0,
						user.fecha_nacimiento.lastIndexOf("T")
					);
					console.log(user.entities);
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
						<h5>Nombre</h5>
						<p>{user.nombre || "---"}</p>
						<h5>Apellidos</h5>
						<p>{user.apellidos || "---"}</p>
						<h5>Email</h5>
						<p>{user.email || "---"}</p>
						<h5>Role</h5>
						<p>{user.role.descripcion || "---"}</p>
						<h5>Teléfono</h5>
						<p>{user.telefono || "---"}</p>
						<h5>Dirección</h5>
						<p>{user.direccion || "---"}</p>
						<h5>Código Postal</h5>
						<p>{user.cp || "---"}</p>
						<h5>Población</h5>
						<p>{user.poblacion || "---"}</p>
						<h5>Provincia</h5>
						<p>{user.provincia || "---"}</p>
						<h5>País</h5>
						<p>{user.pais || "---"}</p>
						<h5>Fecha de nacimiento</h5>
						<p>{user.fecha_nacimiento || "---"}</p>
						<h5>Entidades asignadas</h5>
						{user.entities.length ? (
							<p>
								{getCommonEntities()}
							</p>
						) : (
							<p>{"---"}</p>
						)}
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
