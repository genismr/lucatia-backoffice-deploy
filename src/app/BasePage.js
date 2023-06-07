import React from "react";
import { Redirect, Switch } from "react-router-dom";
import { ContentRoute } from "../_metronic/layout";
import { shallowEqual, useSelector } from "react-redux";
import { DashboardPage } from "./pages/DashboardPage";
import UsersPage from "./modules/ContentManager/users/UsersPage";
import ViewUsersPage from "./modules/ContentManager/users/ViewUsersPage";
import EditUsersPage from "./modules/ContentManager/users/EditUsersPage";
import EntitiesPage from "./modules/ContentManager/entities/EntitiesPage";
import ViewEntitiesPage from "./modules/ContentManager/entities/ViewEntitiesPage";
import EditEntitiesPage from "./modules/ContentManager/entities/EditEntitiesPage";
import AssetsPage from "./modules/ContentManager/assets/AssetsPage";
import ViewAssetsPage from "./modules/ContentManager/assets/ViewAssetsPage";
import EditAssetsPage from "./modules/ContentManager/assets/EditAssetsPage";
import AppsPage from "./modules/ContentManager/apps/AppsPage";
import ViewAppsPage from "./modules/ContentManager/apps/ViewAppsPage";
import EditAppsPage from "./modules/ContentManager/apps/EditAppsPage";
import ExternalEntitiesPage from "./modules/ContentManager/external-entities/ExternalEntitiesPage";
import ViewExternalEntitiesPage from "./modules/ContentManager/external-entities/ViewExternalEntitiesPage";
import EditExternalEntitiesPage from "./modules/ContentManager/external-entities/EditExternalEntitiesPage";
import PatientsPage from "./modules/ContentManager/patients/PatientsPage";
import ViewPatientsPage from "./modules/ContentManager/patients/ViewPatientsPage";
import EditPatientsPage from "./modules/ContentManager/patients/EditPatientsPage";
import { userRoles } from "../utils/helpers";
import GamesPage from "./modules/ContentManager/games/GamesPage";
import EditGamesPage from "./modules/ContentManager/games/EditGamesPage";
import EditEnvironmentsPage from "./modules/ContentManager/game-environments/EditEnvironmentsPage";
import EditActivitiesPage from "./modules/ContentManager/game-activities/EditActivitiesPage";
import EditQuestionsPage from "./modules/ContentManager/game-questions/EditQuestionsPage";
import EditAnswersPage from "./modules/ContentManager/game-answer/EditAnswersPage";

export default function BasePage() {
	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	return (
		<Switch>
			{/* Redirect from root URL to /dashboard. */}
			<Redirect exact from="/" to="/dashboard" />
			<ContentRoute path="/dashboard" component={DashboardPage} />

			<ContentRoute
				from="/my-area/edit-user/:id?"
				component={EditUsersPage}
			/>
			<ContentRoute
				from="/my-area/edit-patient/:id?"
				component={EditPatientsPage}
			/>

			{/* USERS */}
			{/* Users */}
			<ContentRoute from="/users" component={UsersPage} />
			<ContentRoute from="/view-user/:id?" component={ViewUsersPage} />
			<ContentRoute from="/edit-user/:id?" component={EditUsersPage} />

			{/* Patients */}
			<ContentRoute
				from="/patients"
				component={
					loggedUser?.role?.rango <= userRoles.USER
						? PatientsPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/view-patient/:id?"
				component={
					loggedUser?.role?.rango <= userRoles.USER
						? ViewPatientsPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/edit-patient/:id?"
				component={
					loggedUser?.role?.rango < userRoles.USER
						? EditPatientsPage
						: DashboardPage
				}
			/>

			{/* ENTITIES */}
			{/* Entities */}
			<ContentRoute
				from="/entities"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser?.role?.rango === userRoles.ADMIN_ENTIDAD
						? EntitiesPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/view-entity/:id?"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser?.role?.rango === userRoles.ADMIN_ENTIDAD
						? ViewEntitiesPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/edit-entity/:id?"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser?.role?.rango === userRoles.ADMIN_ENTIDAD
						? EditEntitiesPage
						: DashboardPage
				}
			/>
			{/* External Entities */}
			<ContentRoute
				from="/external-entities"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN
						? ExternalEntitiesPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/view-external-entity/:id?"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN
						? ViewExternalEntitiesPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/edit-external-entity/:id?"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN
						? EditExternalEntitiesPage
						: DashboardPage
				}
			/>

			{/* APPS */}
			{/* Apps */}
			<ContentRoute
				from="/apps"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser?.role?.rango === userRoles.ADMIN_ENTIDAD
						? AppsPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/view-app/:id?"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser?.role?.rango === userRoles.ADMIN_ENTIDAD
						? ViewAppsPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/edit-app/:id?"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser?.role?.rango === userRoles.ADMIN_ENTIDAD
						? EditAppsPage
						: DashboardPage
				}
			/>

			{/* GAMES */}
			{/* Games */}
			<ContentRoute from="/games" component={GamesPage} />
			<ContentRoute from="/edit-game/:id?" component={EditGamesPage} />
			{/* Environments */}
			<ContentRoute
				from="/edit-environment/:id?"
				component={EditEnvironmentsPage}
			/>
			{/* Activities */}
			<ContentRoute
				from="/edit-activity/:id?"
				component={EditActivitiesPage}
			/>
			{/* Questions */}
			<ContentRoute
				from="/edit-question/:id?"
				component={EditQuestionsPage}
			/>
			{/* Answers */}
			<ContentRoute
				from="/edit-answer/:id?"
				component={EditAnswersPage}
			/>
			<ContentRoute
				from="/edit-answer-question/:id?"
				component={EditQuestionsPage}
			/>

			{/* ASSETS */}
			{/* Assets */}
			<ContentRoute
				from="/assets"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser?.role?.rango === userRoles.DESIGNER
						? AssetsPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/view-asset/:id?"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser?.role?.rango === userRoles.DESIGNER
						? ViewAssetsPage
						: DashboardPage
				}
			/>
			<ContentRoute
				from="/edit-asset/:id?"
				component={
					loggedUser?.role?.rango === userRoles.SUPER_ADMIN ||
					loggedUser?.role?.rango === userRoles.DESIGNER
						? EditAssetsPage
						: DashboardPage
				}
			/>

			<Redirect to="/error" />
		</Switch>
	);
}
