import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
} from "../../../../_metronic/_partials/controls";
import { Button } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { getAssetById } from "../../../../api/asset";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";

export default function ViewAssetsPage() {
	const [asset, setAsset] = useState(null);
	const assetId = useParams().id;
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
		if (!assetId) {
			disableLoadingData();
			history.push("/assets");
			return;
		}
		getAssetById(assetId)
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
						<h5>Nombre</h5>
						<p>{asset.descripcion || "---"}</p>
						<h5>Tipo</h5>
						<p>{asset.type.descripcion || "---"}</p>
						<h5>Formato</h5>
						<p>{asset.format.descripcion || "---"}</p>
						<h5>Categoría</h5>
						<p>{asset.category.descripcion || "---"}</p>
						<h5>Extensión</h5>
						<p>{asset.extension.descripcion || "---"}</p>
						<h5>URL</h5>
						<p>{asset.url || "---"}</p>
						<h5>Tags</h5>
						<p>{asset.tags.length ? asset.tags.map(t => t.descripcion).join(", ") : "---"}</p>
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
