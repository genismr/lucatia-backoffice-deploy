import React, { useEffect, useState } from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import { authActions } from "./modules/Auth/_redux/authActions";
import { Layout } from "../_metronic/layout";
import BasePage from "./BasePage";
import { Logout, AuthPage } from "./modules/Auth";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { getCredentials, refreshTokens } from "../api/auth/index";
import ErrorsPage from "./modules/Errors/ErrorsPage";
import { logError } from "../utils/logger";
import { getLanguages } from "../api/language";
import { LayoutSplashScreen } from "../_metronic/layout";

export function Routes() {
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	const isLogged = useSelector(
		(store) => store.authentication?.loggedIn,
		shallowEqual
	);
	const loggedUser = useSelector(
		(store) => store.authentication?.user,
		shallowEqual
	);

	// Checking wether we have credentials in cookies before going to login
	useEffect(() => {
		function fetchMyCredentials() {
			setLoading(true);
			setTimeout(async () => {
				try {
					const response = await refreshTokens(loggedUser.refreshToken);
					if (response) {					
						dispatch(authActions.loginActionSuccess(response?.data));
					}
				} catch (error) {
					logError({
						error,
						customMessage: "Cannot get credentials, please login.",
					});
					// alertError({error})
					dispatch(authActions.logoutAction());
				}
				setLoading(false);
			}, 1000);
		}
		fetchMyCredentials();
	}, [dispatch]);

	// Refresh interval every 15 minutes if logged
	useEffect(() => {
		if (isLogged) {
			const interval = setInterval(async () => {
				try {
					const response = await refreshTokens(
						loggedUser.refreshToken
					);
					loggedUser.accessToken = response.data?.accessToken;
				} catch (error) {
					logError({
						error,
						customMessage: "Cannot refresh tokens.",
					});
					// alertError({error})
					dispatch(authActions.logoutAction());
				}
			}, 900000);
			return () => clearInterval(interval);
		}
	}, [dispatch, isLogged]);

	return loading ? (
		<LayoutSplashScreen />
	) : (
		<Switch>
			{!isLogged ? (
				/*Render auth page when user at `/auth` and not authorized.*/
				<Route>
					<AuthPage />
				</Route>
			) : (
				/*Otherwise redirect to root page (`/`)*/
				<Redirect from="/auth" to="/" />
			)}

			<Redirect from="/error" to="/" />
			<Route path="/logout" component={Logout} />

			{!isLogged ? (
				/*Redirect to `/auth` when user is not authorized*/
				<Redirect to="/auth/login" />
			) : (
				<Layout>
					<BasePage />
				</Layout>
			)}
		</Switch>
	);
}
