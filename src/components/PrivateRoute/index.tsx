/**
 *
 * PrivateRoute
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = (props: any) => {
	// eslint-disable-next-line
	const { component: Component, token, user, ...rest } = props;
	const isAuthenticated = Boolean(token) && Boolean(user);

	return (
		<Route
			{...rest}
			render={routeProps =>
				isAuthenticated ? (
					<Component {...routeProps} />
				) : (
					<Redirect
						to={{
							pathname: '/',
							state: { from: props.location, noAuthentication: true },
						}}
					/>
				)
			}
		/>
	);
};

const mapStateToProps = (state: any) => ({
	router: state.router,
	user: state.user,
	token: state.token,
});

export default connect(mapStateToProps)(PrivateRoute);