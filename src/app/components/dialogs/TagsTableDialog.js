import React, { useState, useEffect } from "react";
import {
	Button,
	Dialog,
	TextField,
	DialogActions,
	DialogContent,
	DialogTitle,
	Tooltip,
	MuiThemeProvider,
	createMuiTheme,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	FormHelperText,
	FormControlLabel,
} from "@material-ui/core";
import Table, {
	booleanFormatter,
	buttonsStyle,
	dateFormatter,
	substringFormatter,
} from "../tables/table";
import {
	Card,
	CardBody,
	CardHeader,
	CardHeaderToolbar,
} from "../../../_metronic/_partials/controls";
import { useHistory } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { alertError, alertSuccess } from "../../../utils/logger";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import PeopleIcon from "@material-ui/icons/People";
import SettingsIcon from "@material-ui/icons/Settings";
import RoleIcon from "@material-ui/icons/AccountCircle";
import CheckBox from "@material-ui/icons/CheckBox";
import { getRoles } from "../../../api/role";
import { checkIsEmpty } from "../../../utils/helpers";
import { postUser } from "../../../api/user";
import { postTag } from "../../../api/tag";

// Create theme for delete button (red)
const theme = createMuiTheme({
	palette: {
		secondary: {
			main: "#F64E60",
		},
	},
});

function getEmptyTag() {
	return {
		descripcion: "",
		icon_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
	};
}

const TagsTableDialog = (props) => {
	const { open, setOpen, data, onSaveSelectedTags, tagsSelected } = props;

	const [renderInputFields, setRenderInputFields] = useState(null);

	const [tag, setTag] = useState(getEmptyTag());

	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	const [selectedTags, setSelectedTags] = useState([...tagsSelected]);

	const [tags, setTags] = useState([...data]);

	const columns = [
		{ dataField: "descripcion", text: "Descripcion", sort: true },
		{ dataField: "icon_id", text: "Icon", sort: true },
	];

	const handleChange = (element) => (event) => {
		let text = event.target.value;
		if (event.target.value.trim() == "") text = null;

		setTag({ ...tag, [element]: text });
	};

	function saveTag() {
		if (checkIsEmpty(tag.descripcion)) {
			alertError({
				error: null,
				customMessage: "Descripción is required",
			});
			return;
		}
		postTag(tag)
			.then((res) => {
				if (res.status === 201) {
					let data = [...tags];
					data.push(res.data);
					setTags(data);
					selectedTags.push(res.data.id);
					alertSuccess({
						title: "Saved!",
						customMessage: "Tag successfully created.",
					});
					setTag(getEmptyTag());
					setRenderInputFields(null);
				}
			})
			.catch((error) => {
				alertError({
					error: error,
					customMessage: "Could not save user.",
				});
			});
	}

	function renderTagFields() {
		return (
			<>
				<div className="row">
					<div className="col-4">
						<TextField
							id={"decripcion"}
							label={"Descripción"}
							value={tag.descripcion}
							onChange={handleChange("descripcion")}
							InputLabelProps={{
								shrink: true,
							}}
							margin="normal"
							variant="outlined"
							required
						/>
					</div>
				</div>
				<Button
					onClick={() => {
						setTag(getEmptyTag());
						setRenderInputFields(null);
					}}
					variant="outlined"
					style={{ marginRight: "20px" }}
				>
					Cancel
				</Button>
				<Button
					onClick={() => saveTag()}
					variant="outlined"
					color="primary"
				>
					Save tag
				</Button>
				<br />
				<br />
			</>
		);
	}

	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
		selectColumnPosition: "right",
		selected: selectedTags,
		onSelect: (row, isSelect) => {
			if (selectedTags.includes(row.id)) {
				selectedTags.splice(selectedTags.indexOf(row.id), 1);
			} else {
				selectedTags.push(row.id);
			}
		},
		onSelectAll: (isSelect) => {
			if (isSelect) setSelectedTags(data.map((x) => x.id));
			else setSelectedTags([]);
		},
	};

	return (
		<Dialog
			fullWidth={true}
			maxWidth="xl"
			open={open}
			onClose={() => setOpen(false)}
			aria-labelledby="table-dialog"
		>
			<DialogContent>
				<Card>
					<CardHeader title={"Tags list"}>
						<CardHeaderToolbar>
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => setRenderInputFields(true)}
							>
								Add new
							</button>
						</CardHeaderToolbar>
					</CardHeader>
					<CardBody>
						{renderInputFields && renderTagFields()}
						{!data || !data.length ? (
							<p>{"No tags found."}</p>
						) : (
							<Table
								data={tags}
								columns={columns}
								selectRow={selectRow}
							/>
						)}
					</CardBody>
				</Card>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => {
						onSaveSelectedTags(selectedTags, tags);
						setTag(getEmptyTag());
						setRenderInputFields(null);
						setOpen(false);
					}}
					variant="outlined"
					color="secondary"
				>
					Accept
				</Button>
			</DialogActions>
		</Dialog>
	);
};
export default TagsTableDialog;
