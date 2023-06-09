/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl, checkIsActive } from "../../../../_helpers";
import RecentActorsIcon from "@material-ui/icons/RecentActors";
import PeopleIcon from "@material-ui/icons/People";
import PatientIcon from "@material-ui/icons/DirectionsWalk";
import BuildingIcon from "@material-ui/icons/AccountBalance";
import AppIcon from "@material-ui/icons/PhoneIphone";
import GameIcon from "@material-ui/icons/Games";
import AssetIcon from "@material-ui/icons/WebAsset";
import StoreIcon from "@material-ui/icons/Store";
import { shallowEqual, useSelector } from "react-redux";
import { SERVER_URL } from "../../../../../api";
import { userRoles } from "../../../../../utils/helpers";

export function AsideMenuList({ layoutProps }) {
	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);
	const location = useLocation();
	const getMenuItemActive = (url, hasSubmenu = false) => {
		return checkIsActive(location, url)
			? ` ${!hasSubmenu &&
					"menu-item-active"} menu-item-open menu-item-not-hightlighted`
			: "";
	};

	return (
		<>
			{/* begin::Menu Nav */}
			<ul className={`menu-nav ${layoutProps.ulClasses}`}>
				<li
					className={`menu-item ${getMenuItemActive(
						"/dashboard",
						false
					)}`}
					aria-haspopup="true"
				>
					<NavLink className="menu-link" to="/dashboard">
						<span className="svg-icon menu-icon">
							<SVG
								src={toAbsoluteUrl(
									"/media/svg/icons/Design/Layers.svg"
								)}
							/>
						</span>
						<span className="menu-text">Dashboard</span>
					</NavLink>
				</li>
				<li
					className={`menu-item ${getMenuItemActive(
						"/my-area/edit-user",
						false
					)}`}
					aria-haspopup="true"
				>
					<NavLink
						className="menu-link"
						to={"/my-area/edit-user/" + loggedUser?.userID}
					>
						<span className="menu-icon">
							<RecentActorsIcon />
						</span>
						<span className="menu-text">My area</span>
					</NavLink>
				</li>

				{loggedUser.role?.rango <= userRoles.USER && (
					<>
						<li className="menu-section">
							<h4 className="menu-text">USERS</h4>
							<i className="menu-icon ki ki-bold-more-hor icon-md"></i>
						</li>
						{(loggedUser.role?.rango === userRoles.SUPER_ADMIN ||
							loggedUser.role?.rango ===
								userRoles.ADMIN_ENTIDAD) && (
							<>
								<li
									className={`menu-item ${getMenuItemActive(
										"/users",
										false
									)} ${getMenuItemActive(
										"/view-user",
										false
									)} ${getMenuItemActive(
										"#/edit-user",
										false
									)}`}
									aria-haspopup="true"
								>
									<NavLink className="menu-link" to="/users">
										<span className="menu-icon">
											<PeopleIcon />
										</span>
										<span className="menu-text">Users</span>
									</NavLink>
								</li>
							</>
						)}
						<li
							className={`menu-item ${getMenuItemActive(
								"/patients",
								false
							)} ${getMenuItemActive(
								"/view-patient",
								false
							)} ${getMenuItemActive("/edit-patient", false)}`}
							aria-haspopup="true"
						>
							<NavLink className="menu-link" to="/patients">
								<span className="menu-icon">
									<PatientIcon />
								</span>
								<span className="menu-text">Patients</span>
							</NavLink>
						</li>
					</>
				)}

				{(loggedUser.role?.rango === userRoles.SUPER_ADMIN ||
					(loggedUser.role?.rango === userRoles.ADMIN_ENTIDAD &&
						loggedUser.managedEntities?.length)) && (
					<>
						<li className="menu-section">
							<h4 className="menu-text">ENTITIES</h4>
							<i className="menu-icon ki ki-bold-more-hor icon-md"></i>
						</li>
						<li
							className={`menu-item ${getMenuItemActive(
								"/entities",
								false
							)} ${getMenuItemActive(
								"/view-entity",
								false
							)} ${getMenuItemActive("/edit-entity", false)}`}
							aria-haspopup="true"
						>
							<NavLink className="menu-link" to="/entities">
								<span className="menu-icon">
									<BuildingIcon />
								</span>
								<span className="menu-text">Entities</span>
							</NavLink>
						</li>
						{loggedUser.role?.rango === userRoles.SUPER_ADMIN && (
							<>
								<li
									className={`menu-item ${getMenuItemActive(
										"/external-entities",
										false
									)} ${getMenuItemActive(
										"/view-external-entity",
										false
									)} ${getMenuItemActive(
										"/edit-external-entity",
										false
									)}`}
									aria-haspopup="true"
								>
									<NavLink
										className="menu-link"
										to="/external-entities"
									>
										<span className="menu-icon">
											<StoreIcon />
										</span>
										<span className="menu-text">
											External Entities
										</span>
									</NavLink>
								</li>
							</>
						)}
						<li className="menu-section">
							<h4 className="menu-text">APPS</h4>
							<i className="menu-icon ki ki-bold-more-hor icon-md"></i>
						</li>
						<li
							className={`menu-item ${getMenuItemActive(
								"/apps",
								false
							)} ${getMenuItemActive(
								"/view-app",
								false
							)} ${getMenuItemActive("/edit-app", false)}`}
							aria-haspopup="true"
						>
							<NavLink className="menu-link" to="/apps">
								<span className="menu-icon">
									<AppIcon />
								</span>
								<span className="menu-text">Apps</span>
							</NavLink>
						</li>
					</>
				)}

				<li className="menu-section">
					<h4 className="menu-text">GAMES</h4>
					<i className="menu-icon ki ki-bold-more-hor icon-md"></i>
				</li>
				<li
					className={`menu-item ${getMenuItemActive(
						"/games",
						false
					)}  ${getMenuItemActive(
						"/edit-game",
						false
					)} ${getMenuItemActive(
						"/edit-environment",
						false
					)} ${getMenuItemActive(
						"/edit-activity",
						false
					)} ${getMenuItemActive(
						"/edit-question",
						false
					)} ${getMenuItemActive("/edit-answer", false)}`}
					aria-haspopup="true"
				>
					<NavLink className="menu-link" to="/games">
						<span className="menu-icon">
							<GameIcon />
						</span>
						<span className="menu-text">Games</span>
					</NavLink>
				</li>

				{(loggedUser.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser.role?.rango === userRoles.DESIGNER) && (
					<>
						<li className="menu-section">
							<h4 className="menu-text">ASSETS</h4>
							<i className="menu-icon ki ki-bold-more-hor icon-md"></i>
						</li>
						<li
							className={`menu-item ${getMenuItemActive(
								"/assets",
								false
							)} ${getMenuItemActive(
								"/view-asset",
								false
							)} ${getMenuItemActive("/edit-asset", false)}`}
							aria-haspopup="true"
						>
							<NavLink className="menu-link" to="/assets">
								<span className="menu-icon">
									<AssetIcon />
								</span>
								<span className="menu-text">Assets</span>
							</NavLink>
						</li>
					</>
				)}
			</ul>

			{/* end::Menu Nav */}
		</>
	);
}
