/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useMemo, useLayoutEffect, useEffect } from "react";
import objectPath from "object-path";
import { useLocation } from "react-router-dom";
import { BreadCrumbs } from "./components/BreadCrumbs";
import {
	getBreadcrumbsAndTitle,
	useSubheader,
} from "../../_core/MetronicSubheader";
import { useHtmlClassService } from "../../_core/MetronicLayout";
import { getFromSession } from "../../../../utils/helpers";

const months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sept",
	"Oct",
	"Nov",
	"Dec",
];
const today = new Date();
const currentDate = `${months[today.getMonth()]} ${today.getDate()}`;

export function SubHeader() {
	const uiService = useHtmlClassService();
	const location = useLocation();
	const subheader = useSubheader();

	const layoutProps = useMemo(() => {
		return {
			config: uiService.config,
			subheaderMobileToggle: objectPath.get(
				uiService.config,
				"subheader.mobile-toggle"
			),
			subheaderCssClasses: uiService.getClasses("subheader", true),
			subheaderContainerCssClasses: uiService.getClasses(
				"subheader_container",
				true
			),
		};
	}, [uiService]);

	const gameBreadCrumbs = { pathname: "/games", title: "Games" };

	const environmentBreadCrumbs = {
		pathname:
			"/edit-game/" +
			getFromSession("game")?.id,
		title: getFromSession("game")?.name,
	};

	const activityBreadCrumbs = {
		pathname:
			"/edit-environment/" +
			getFromSession("environment")?.id,
		title: getFromSession("environment")?.name,
	};

	const questionBreadCrumbs = {
		pathname:
			"/edit-activity/" +
			getFromSession("activity")?.id,
		title: getFromSession("activity")?.name,
	};

	const answerBreadCrumbs = {
		pathname:
			"/edit-question/" +
			getFromSession("question")?.id,
		title: getFromSession("question")?.name,
	};

	useLayoutEffect(() => {
		const aside = getBreadcrumbsAndTitle(
			"kt_aside_menu",
			location.pathname
		);
		const header = getBreadcrumbsAndTitle(
			"kt_header_menu",
			location.pathname
		);
		let breadcrumbs =
			aside && aside.breadcrumbs.length > 0
				? aside.breadcrumbs
				: header.breadcrumbs;
		let link = location.pathname.replace(process.env.PUBLIC_URL, "");
		let setGamesTitle = false;

		if (link.includes("edit-game")) {
			setGamesTitle = true;
			breadcrumbs.push(gameBreadCrumbs);
		} else if (link.includes("edit-environment")) {
			setGamesTitle = true;
			breadcrumbs.push(gameBreadCrumbs, environmentBreadCrumbs);
		} else if (link.includes("edit-activity")) {
			setGamesTitle = true;
			breadcrumbs.push(
				gameBreadCrumbs,
				environmentBreadCrumbs,
				activityBreadCrumbs
			);
		} else if (link.includes("edit-question")) {
			setGamesTitle = true;
			breadcrumbs.push(
				gameBreadCrumbs,
				environmentBreadCrumbs,
				activityBreadCrumbs,
				questionBreadCrumbs
			);
		} else if (link.includes("edit-answer")) {
			setGamesTitle = true;
			breadcrumbs.push(
				gameBreadCrumbs,
				environmentBreadCrumbs,
				activityBreadCrumbs,
				questionBreadCrumbs,
				answerBreadCrumbs
			);
		}
		subheader.setBreadcrumbs(breadcrumbs);
		setGamesTitle
			? subheader.setTitle("Games")
			: subheader.setTitle(
					aside && aside.title && aside.title.length > 0
						? aside.title
						: header.title
			  );
		// eslint-disable-next-line
	}, [location.pathname]);

	// Do not remove this useEffect, need from update title/breadcrumbs outside (from the page)
	useEffect(() => {}, [subheader]);

	return (
		<div
			id="kt_subheader"
			className={`subheader py-2 py-lg-4   ${layoutProps.subheaderCssClasses}`}
		>
			<div
				className={`${layoutProps.subheaderContainerCssClasses} d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap`}
			>
				{/* Info */}
				<div className="d-flex align-items-center flex-wrap mr-1">
					{layoutProps.subheaderMobileToggle && (
						<button
							className="burger-icon burger-icon-left mr-4 d-inline-block d-lg-none"
							id="kt_subheader_mobile_toggle"
						>
							<span />
						</button>
					)}

					<div className="d-flex align-items-baseline mr-5">
						<h5 className="text-dark font-weight-bold my-2 mr-5">
							<>{subheader.title}</>
							{/*<small></small>*/}
						</h5>
					</div>

					<BreadCrumbs items={subheader.breadcrumbs} />
				</div>

				{/* Toolbar */}
				<div className="d-flex align-items-center">
					<div
						/* href="#" */ className="btn btn-light btn-sm font-weight-bold"
						id="kt_dashboard_daterangepicker"
						/* data-toggle="tooltip"  */ title="Select dashboard daterange"
						data-placement="left"
						style={{ cursor: "default" }}
					>
						<span
							className="text-muted font-weight-bold mr-2"
							id="kt_dashboard_daterangepicker_title"
						>
							Today
						</span>
						<span
							className="text-primary font-weight-bold"
							id="kt_dashboard_daterangepicker_date"
						>
							{currentDate}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
