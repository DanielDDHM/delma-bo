import React, { Component } from "react";
import { connect } from "react-redux";
import Routes, { offlinePages } from "./routes";
import { Sidebar, Header, ErrorBoundary } from "screens";
import { Content, RouteContent, Loader, StaffModal } from "components";
import { setBreadcrumb } from "store/actions";

import 'styles/styles.scss';
import 'styles/theme.less';
import strings from "utils/strings";

export class App extends Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			sidebarOpen: window.innerWidth >= 992,
			sidebarHidden: false,
		};

		this.handleResize = this.handleResize.bind(this);
		window.addEventListener('resize', this.handleResize);
	}

	UNSAFE_componentWillMount() {
		strings.setLanguage(this.props.language || 'pt');
	}

	componentDidUpdate(nextProps: any) {
		const { dispatch, router } = this.props;

		if (
			nextProps?.router?.location?.pathname !== router?.location?.pathname &&
			(!router?.location?.pathname?.split('/').some((path: string) => path === 'new') ||
				router?.location?.pathname?.split('/').length !== nextProps?.location?.pathname?.split('/').length)
		) {
			dispatch(setBreadcrumb(null));
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize() {
		const isMobile = window.innerWidth < 992;
		this.setState((state: any) => ({ isMobile, sidebarOpen: !isMobile }));
	}

	openSidebar() {
		this.setState({ sidebarOpen: true });
	}

	closeSidebar() {
		if (document.body.clientWidth < 992) {
			this.setState({ sidebarHidden: true, sidebarOpen: false });
		} else {
			this.setState({ sidebarOpen: false });
		}
	}

	get hideNavBar() {
		const { router } = this.props;
		const { location } = router;
		const path = location.pathname.split('/')[1];

		return (
			offlinePages.indexOf(location.pathname) !== -1 ||
			offlinePages.indexOf(`/${path}`) !== -1
		);
	}

	render() {
		return (
			<div className='App'>
				{!this.hideNavBar && (
					<Sidebar
						open={this.state.sidebarOpen}
						onMobile={(status: any) =>
							status && this.closeSidebar()
						}
						openSidebar={() => this.openSidebar()}
						closeSidebar={() => this.closeSidebar()}
					/>
				)}
				<Content>
					{!this.hideNavBar && (
						<Header
							sidebarOpen={this.state.sidebarOpen}
							onToggleSidebar={() => {
								this.setState((state: any) => ({
									sidebarHidden: !state.sidebarHidden,
									sidebarOpen: !state.sidebarOpen,
								}));
							}}
						/>
					)}
					<RouteContent
						style={this.hideNavBar ? { padding: 0 } : null}
					>
						<ErrorBoundary>
							<Routes />
						</ErrorBoundary>
					</RouteContent>
				</Content>
				<StaffModal />
				<Loader />
			</div>
		);
	}
}

const mapStateToProps = (state: any) => ({
	router: state.router,
	loader: state.loader,
	breadcrumb: state.breadcrumb,
	language: state.language,
});

export default connect(mapStateToProps)(App);
