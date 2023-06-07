import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import "../../../customStyles/bootstrap_table.css";
import CheckBox from "@material-ui/icons/CheckBox";
import CheckBoxOutlineBlank from "@material-ui/icons/CheckBoxOutlineBlank";

const { SearchBar, ClearSearchButton } = Search;

export const buttonsStyle = {
	maxWidth: "30px",
	maxHeight: "30px",
	minWidth: "30px",
	minHeight: "30px",
	marginLeft: "1em",
};

export function booleanFormatter(cell) {
	return cell ? (
		<CheckBox style={{ color: "#0454DC" }} />
	) : (
		<CheckBoxOutlineBlank style={{ color: "#0454DC" }} />
	);
}

export function longTextFormatter(cell) {
	return (
		<td className="truncate">
			<div dangerouslySetInnerHTML={{ __html: cell }}></div>
		</td>
	);
}

function extractContent(s) {
	if (!s) return "----";
	var span = document.createElement("span");
	span.innerHTML = s;
	return span.textContent || span.innerText;
}

export function substringFormatter(cell) {
	const text = extractContent(cell);
	return text.length > 50 ? text.substring(0, 50) + "..." : text;
}

const buildDate = (date) => {
	if (Object.prototype.toString.call(date) !== "[object Date]") return;

	if (date.getTime() === new Date("0001-01-01T00:00:00").getTime())
		return "---";

	const displayDate = `${date.getDate()}/${date.getMonth() +
		1}/${date.getFullYear()}  ${date.getHours()}:${String(
		date.getMinutes()
	).padStart(2, "0")}`;
	return displayDate;
};

export function dateFormatter(cell) {
	let date = new Date(cell);
	date = buildDate(date);

	return date;
}

const customTotal = (from, to, size) => (
	<span
		className="react-bootstrap-table-pagination-total"
		style={{ paddingLeft: "5px" }}
	>
		Showing {from}-{to} of {size} results
	</span>
);

const pagination = paginationFactory({
	page: 1,
	sizePerPage: 10,
	lastPageText: ">>",
	firstPageText: "<<",
	nextPageText: ">",
	prePageText: "<",
	showTotal: true,
	paginationTotalRenderer: customTotal,
	alwaysShowAllBtns: false,
	onPageChange: function(page, sizePerPage) {},
	onSizePerPageChange: function(page, sizePerPage) {},
});

const rowClasses = row => (row.activo === false ? "inactive-row" : "");

export default function Table({ data, columns, selectRow, ...tableProps }) {
	return (
		<ToolkitProvider
			bootstrap4
			keyField="id"
			data={data}
			columns={columns}
			search
		>
			{(props) => (
				<div>
					<SearchBar placeholder="Search" {...props.searchProps} />
					<ClearSearchButton
						className="ml-3"
						{...props.searchProps}
					/>
					<br />
					<br />
					<BootstrapTable
						wrapperClasses="table-responsive"
						classes="table table-head-custom table-vertical-center overflow-hidden"
						bordered={false}
						// remote
						pagination={pagination}
						striped
						rowClasses={rowClasses}
						selectRow={selectRow}												
						{...tableProps}
						{...props.baseProps}
					/>
				</div>
			)}
		</ToolkitProvider>
	);
}
