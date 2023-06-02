import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import { Button, TextField, Tooltip } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { useSkeleton } from "../../../hooks/useSkeleton";
import { alertError, alertSuccess } from "../../../../utils/logger";
import { shallowEqual, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";
import { checkIsEmpty, getFromSession } from "../../../../utils/helpers";
import { getEntities } from "../../../../api/entity";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import Table, { buttonsStyle } from "../../../components/tables/table";
import EditIcon from "@material-ui/icons/Edit";
import {
	getGameAnswerById,
	postGameAnswer,
	updateGameAnswer,
} from "../../../../api/game-answer";

function getEmptyAnswer() {
	return {
		pregunta_id: "",
		nombre: "",
		descripcion: null,
		icono_id: null,
		texto: null,
		imagen_id: null,
		es_correcto: true,
		linea_de_tiempo_id: null,
		ofrece_reintento: true,
		reintento_pregunta_id: null,
		puntuacion: null,
	};
}

export default function EditAnswersPage() {
	const [answer, setAnswer] = useState(getEmptyAnswer());

	const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);

	const questionId = getFromSession("question").id;

	const answerId = useParams().id;
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
		if (!answerId) {
			disableLoadingData();
			return;
		}
		getGameAnswerById(answerId)
			.then((res) => {
				if (res.status === 200) {
					setAnswer(res.data);
					disableLoadingData();
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not get answer.",
				});
				history.push("/edit-question/" + questionId);
			});
	}, [answerId, disableLoadingData, history]);

	function saveAnswer() {
		if (checkIsEmpty(answer.nombre)) {
			alertError({
				error: null,
				customMessage: "Nombre is required",
			});
			return;
		}

		if (!answerId) {
			answer.pregunta_id = questionId;
			postGameAnswer(answer)
				.then((res) => {
					if (res.status === 201) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Answer successfully created.",
						});
						history.push("/edit-question/" + questionId);
					}
				})
				.catch((error) => {
					alertError({
						error: error,
						customMessage: "Could not save answer.",
					});
				});
		} else {
			updateGameAnswer(answerId, answer)
				.then((res) => {
					if (res.status === 204) {
						alertSuccess({
							title: "Saved!",
							customMessage: "Answer successfully saved.",
						});
					}
					history.push("/edit-question/" + questionId);
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
		setAnswer({ ...answer, [element]: text });
	};

	function imageFormatter(cell) {
		return cell && cell !== "" ? (
			<img
				//src={SERVER_URL + '/' + cell}
				alt="icon"
				style={{ width: "50px", height: "50px" }}
				onClick={() => {
					setPreviewImage(cell);
					setOpenPreviewDialog(true);
				}}
			/>
		) : (
			<div />
		);
	}

	if (isLoadingData) return <ContentSkeleton />;
	else
		return (
			<>
				<Card>
					<CardHeader title="Edit answer"></CardHeader>
					<CardBody>
						<div className="row">
							<div className="col-6 gx-3">
								<TextField
									id={`nombre`}
									label="Nombre"
									value={answer.nombre}
									onChange={handleChange("nombre")}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
									variant="outlined"
									required
								/>
							</div>
							<div className="col-6 gx-3">
								<TextField
									id={`descripcion`}
									label="Descripción"
									value={answer.descripcion}
									onChange={handleChange("descripcion")}
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
					onClick={() => history.push("/edit-question/" + questionId)}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Back
				</Button>
				<Button
					onClick={() => saveAnswer()}
					variant="outlined"
					color="primary"
					style={{ marginRight: "20px" }}
				>
					Save answer
				</Button>
			</>
		);
}
