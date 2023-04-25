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

export default function BasePage() {
	const user = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);
	const isAdmin = user || user?.role !== "admin";

	return (
		<Switch>
			{/* Redirect from root URL to /dashboard. */}
			<Redirect exact from="/" to="/dashboard" />
			<ContentRoute path="/dashboard" component={DashboardPage} />

			{/* USERS */}
			{/* Users */}
			<ContentRoute from="/users" component={UsersPage} />
			<ContentRoute from="/view-user/:id?" component={ViewUsersPage} />
			<ContentRoute from="/edit-user/:id?" component={EditUsersPage} />

			{/* ENTITIES */}
			{/* Entities */}
			<ContentRoute from="/entities" component={EntitiesPage} />
			<ContentRoute
				from="/view-entity/:id?"
				component={ViewEntitiesPage}
			/>
			<ContentRoute
				from="/edit-entity/:id?"
				component={EditEntitiesPage}
			/>

			{/* APPS */}
			{/* Apps */}
			<ContentRoute from="/apps" component={AppsPage} />
			<ContentRoute
				from="/view-app/:id?"
				component={ViewAppsPage}
			/>
			<ContentRoute
				from="/edit-app/:id?"
				component={EditAppsPage}
			/>

			{/* ASSETS */}
			{/* Assets */}
			<ContentRoute from="/assets" component={AssetsPage} />
			<ContentRoute from="/view-asset/:id?" component={ViewAssetsPage} />
			<ContentRoute from="/edit-asset/:id?" component={EditAssetsPage} />

			<Redirect to="/error" />
		</Switch>
	);
}
