import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import { Button, Chip } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import { getAppById } from "../../../../api/app";
import PreviewDialog from "../../../components/dialogs/PreviewDialog";

export default function ViewAppsPage() {
	const [app, setApp] = useState(null);
	const appId = useParams().id;
	const history = useHistory();

	const [openPreviewIconDialog, setOpenPreviewIconDialog] = useState(false);
	const [openPreviewBannerDialog, setOpenPreviewBannerDialog] = useState(
		false
	);

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
		if (!appId) {
			disableLoadingData();
			history.push("/apps");
			return;
		}
		getAppById(appId, loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setApp(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get app info.",
				});
				history.push("/apps");
			});
	}, [appId, disableLoadingData, history]);

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="View app info"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Nombre</h5>
								<p>{app.nombre || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Descripción</h5>
								<p>{app.descripcion || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Tecnología</h5>
								<p>{app.tecnologia || "---"}</p>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Icono</h5>
								<p />
								<img
									key={app.icono?.url}
									src={app.icono?.url}
									alt={app.icono?.url.split(/-(.*)/s)[1]}
									style={{
										maxWidth: "70px",
										cursor: "zoom-in",
									}}
									onClick={() =>
										setOpenPreviewIconDialog(true)
									}
								/>
								<PreviewDialog
									title={app.icono?.descripcion}
									open={openPreviewIconDialog}
									setOpen={setOpenPreviewIconDialog}
									src={app.icono?.url}
								/>
							</div>
							<div className="col-4 gx-3">
								<h5>Banner</h5>
								<p />
								<img
									key={app.banner?.url}
									src={app.banner?.url}
									alt={app.banner?.url.split(/-(.*)/s)[1]}
									style={{
										maxWidth: "70px",
										cursor: "zoom-in",
									}}
									onClick={() =>
										setOpenPreviewBannerDialog(true)
									}
								/>
								<PreviewDialog
									title={app.banner?.descripcion}
									open={openPreviewBannerDialog}
									setOpen={setOpenPreviewBannerDialog}
									src={app.banner?.url}
								/>
							</div>
						</div>
						<br />
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Entidades propietarias</h5>
								{!app.ownedEntities.length && <p>{"---"}</p>}
								{app.ownedEntities.length > 0 && (
									<>
										<div className="row ml-0">
											{app.ownedEntities.map((data) => {
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
								<h5>Entidades delegadas</h5>
								{!app.delegatedEntities.length && (
									<p>{"---"}</p>
								)}
								{app.delegatedEntities.length > 0 && (
									<>
										<div className="row ml-0">
											{app.delegatedEntities.map(
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
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Estado</h5>
								{app.activo ? <p>Activo</p> : <p>Inactivo</p>}
							</div>
						</div>
					</CardBody>
				</Card>
				<div style={{ display: "flex", flexDirection: "row" }}>
					<Button
						onClick={() => history.push("/apps")}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Back
					</Button>
				</div>
			</>
		);
}
