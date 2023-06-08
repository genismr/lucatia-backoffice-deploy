import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import { Button, Tooltip, Chip } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { getAssetById } from "../../../../api/asset";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import Visibility from "@material-ui/icons/Visibility";
import PreviewDialog from "../../../components/dialogs/PreviewDialog";
import { buttonsStyle } from "../../../components/tables/table";

export default function ViewAssetsPage() {
	const [asset, setAsset] = useState(null);
	const assetId = useParams().id;
	const history = useHistory();

	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

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
		if (!assetId) {
			disableLoadingData();
			history.push("/assets");
			return;
		}
		getAssetById(assetId, loggedUser.accessToken)
			.then((res) => {
				if (res.status === 200) {
					setAsset(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get asset info.",
				});
				history.push("/assets");
			});
	}, [assetId, disableLoadingData, history]);

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="View asset info"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Nombre</h5>
								<p>{asset.descripcion || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>
									File &nbsp;&nbsp;
									<img
										key={asset.imageURL}
										src={asset.url}
										alt={asset.url.split(/-(.*)/s)[1]}
										style={{
											maxWidth: "70px",
											cursor: "zoom-in",
										}}
										onClick={() =>
											setOpenPreviewDialog(true)
										}
									/>
									<PreviewDialog
										title={asset.descripcion}
										open={openPreviewDialog}
										setOpen={setOpenPreviewDialog}
										src={asset.url}
									/>
								</h5>
							</div>
							<div className="col-4 gx-3">
								<h5>Tipo</h5>
								<p>{asset.type.descripcion || "---"}</p>
							</div>
						</div>
						<div className="row">
							<div className="col-4 gx-3">
								<h5>Formato</h5>
								<p>{asset.format.descripcion || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Categoría</h5>
								<p>{asset.category.descripcion || "---"}</p>
							</div>
							<div className="col-4 gx-3">
								<h5>Extensión</h5>
								<p>{asset.extension.descripcion || "---"}</p>
							</div>
						</div>
						<div className="row">
							<div className="col-12 gx-3">
								<h5>Tags</h5>
								{!asset.tags.length && <p>{"---"}</p>}
								{asset.tags.length > 0 && (
									<>
										<div className="row ml-0">
											{asset.tags.map((data) => {
												return (
													<Chip
														label={data.descripcion}
														className="mr-2 mt-2"
													/>
												);
											})}
										</div>
										<br />
									</>
								)}
							</div>
						</div>
					</CardBody>
				</Card>
				<div style={{ display: "flex", flexDirection: "row" }}>
					<Button
						onClick={() => history.push("/assets")}
						variant="outlined"
						style={{ marginRight: "20px" }}
					>
						Back
					</Button>
				</div>
			</>
		);
}
