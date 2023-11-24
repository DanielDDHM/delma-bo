import React from "react";
import { connect } from "react-redux";
import { Route, Redirect, Switch } from "react-router-dom";
import { PrivateRoute } from "components";
import {
	Dashboard,
	Login,
	RecoverPassword,
	Staff,
	Logs,
	Settings,
	AcceptInvite,
	Pages,
	EmailTemplates,
	PageDetail,
	EmailDetail,
	Error500,
	Gallery,
	Albuns,
	AlbumDetail,
	Books,
	BookDetail,
	Notifications,
	NotificationDetail,
	GalleryItem,
	Users,
	UserDetail,
} from "screens";

export const offlinePages = [
	"/login",
	"/register",
	"/accept-invite",
	"/recover-password",
	"/confirm",
];

export class Routes extends React.Component<any, any> {
	shouldComponentUpdate(nextProps: any) {
		const { user, token } = this.props;
		const isLoggedIn = Boolean(user && token);
		const willBeLoggedIn = Boolean(nextProps.user && nextProps.token);

		return isLoggedIn !== willBeLoggedIn;
	}

	componentDidUpdate() {
		const elem = document.getElementById("app_content");

		if (elem) {
			elem.scrollTop = 0;
		}
	}

	render() {
		const { token, router, user } = this.props;
		const { location } = router;

		if (token && user) {
			location.pathname = "/dashboard";
		} else {
			location.pathname = "/login";
		}

		const path = location.pathname.split("/")[1];
		const isAdmin = true;
		if (
			offlinePages.indexOf(location.pathname) !== -1 ||
			offlinePages.indexOf(`/${path}`) !== -1
		) {
			return (
				<Switch>
					<Route exact path="/login" component={Login} />
					<Route exact path="/recover-password" component={RecoverPassword} />
					<Route
						exact
						path="/recover-password/:id/:code"
						component={RecoverPassword}
					/>
					<Route
						exact
						path="/accept-invite/:id/:code"
						component={AcceptInvite}
					/>
					<Route
						exact
						path="/confirm/:email/:code"
						component={() => <h1>Confirm Account</h1>}
					/>
					<Route
						exact
						path="/500"
						component={Error500}
					/>
					<Redirect to="/login" />
				</Switch>
			);
		}

		return (
			<Switch>
				<PrivateRoute exact path="/dashboard" component={Dashboard} />
				<PrivateRoute exact path="/users" component={Users} />
				<PrivateRoute exact path="/users/:id" component={UserDetail} />
				<PrivateRoute exact path="/library" component={Gallery} />
				<PrivateRoute exact path="/library/:id" component={GalleryItem} />
				<PrivateRoute exact path="/albuns" component={Albuns} />
				<PrivateRoute exact path="/albuns/:id" component={AlbumDetail} />
				<PrivateRoute exact path="/books" component={Books} />
				<PrivateRoute exact path="/books/:id" component={BookDetail} />
				<PrivateRoute exact path="/notifications" component={Notifications} />
				<PrivateRoute exact path="/notifications/:id" component={NotificationDetail} />
				{(isAdmin && <PrivateRoute exact path="/staff" component={Staff} />) ||
					null}
				<PrivateRoute exact path="/settings" component={Settings} />
				<PrivateRoute exact path="/settings/pages" component={Pages} />
				<PrivateRoute exact path="/settings/pages/:id" component={PageDetail} />
				<PrivateRoute
					exact
					path="/settings/email-templates"
					component={EmailTemplates}
				/>
				<PrivateRoute
					exact
					path="/settings/email-templates/:id"
					component={EmailDetail}
				/>
				<PrivateRoute exact path="/logs" component={Logs} />
				<PrivateRoute
					exact
					path="/500"
					component={Error500}
				/>
				<Redirect to="/dashboard" />
			</Switch>
		);
	}
}

const mapStateToProps = (state: any) => ({
	router: state.router,
	user: state.user,
	token: state.token,
});

export default connect(mapStateToProps)(Routes);
