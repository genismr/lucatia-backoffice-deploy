import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import { Button } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { getEntityById } from "../../../../api/entity";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import { getUsers } from "../../../../api/user";
import { getExternalEntityById } from "../../../../api/external-entity";

export default function ViewExternalEntitiesPage() {
	const [externalEntity, setExternalEntity] = useState(null);
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
			history.push("/external-entities");
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
					customMessage: "Could not get external entity info.",
				});
				history.push("/external-entities");
			});
	}, [externalEntityId, disableLoadingData, history]);

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="View external entity info"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Nombre</h5>
								<p>{externalEntity.nombre || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Razon social</h5>
								<p>{externalEntity.razon_social || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>NIF</h5>
								{externalEntity.nif || "---"}
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Teléfono</h5>
								<p>{externalEntity.telefono || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Dirección</h5>
								<p>{externalEntity.direccion || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Población</h5>
								<p>{externalEntity.poblacion || "---"}</p>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Código Postal</h5>
								<p>{externalEntity.cp || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Província</h5>
								<p>{externalEntity.provincia || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>País</h5>
								<p>{externalEntity.pais || "---"}</p>
							</div>
						</div>						
					</CardBody>
				</Card>
				<div style={{ display: "flex", flexDirection: "row" }}>
					<Button
						onClick={() => history.push("/external-entities")}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Back
					</Button>
				</div>
			</>
		);
}
