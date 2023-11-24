/**
 *
 * Sidebar
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Strings from 'utils/strings';
import { SidebarMenu, UserMenu } from 'components';
import logo from 'assets/images/logo.png';
import './styles.scss';

export class Sidebar extends React.PureComponent<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			activeTab: '/dashboard',
		};

		this.selectTab = this.selectTab.bind(this);
		this.goTo = this.goTo.bind(this);
		this.goToHomepage = this.goToHomepage.bind(this);
	}

	selectTab(url: String) {
		const { activeTab } = this.state;

		this.setState({ activeTab: activeTab === url ? '' : url });
	}

	goTo(url: String) {
		const clientWidth = document.body.clientWidth;
		this.setState({ activeTab: url });
		this.props.onMobile(clientWidth < 992);
		this.props.dispatch(push(`/${url}`));
	}

	goToHomepage() {
		this.setState({ activeTab: '/dashboard' });
		this.props.dispatch(push('/'));
	}

	render() {
		const { activeTab } = this.state;
		const { open, user } = this.props;
		const isOwner = ((Boolean(user) && (user.role === 'owner' || user.role === 'sysadmin'))) || false;
		// const isStaff = ((Boolean(user) && (user.role === 'owner' || user.role === 'admin' || user.role === 'sysadmin'))) || false;

		if (!user) { return null; }

		return (
			<div className="SidebarWrapper">
				<div className={`SidebarContainer${open ? ' open' : ' closed'}`}>
					<div className="SidebarHome">
						<a className="SidebarLogoContainer" onClick={this.goToHomepage} href="/">
							<img className="Logo" alt="Logo" src={logo} />
						</a>
						<div className="SidebarSeparator" />
					</div>
					<div className="SidebarContent">
						<UserMenu
							sidebarIsOpen={open}
							subMenus={[
								{
									name: Strings.header.account,
									icon: 'user2'
								},
								{
									name: Strings.authentication.logout,
									action: 'logout',
									icon: 'logout'
								}
							]}
						/>
						<div style={{ margin: '10px 0' }} className="SidebarSeparator" />
						<SidebarMenu
							name={Strings.sidebar.dashboard}
							url="dashboard"
							icon="speedometer"
							activeTab={activeTab}
							onClick={this.goTo}
							sidebarIsOpen={open}
						/>
						<SidebarMenu
							name={Strings.sidebar.albuns}
							url="albuns"
							icon="frame"
							activeTab={activeTab}
							onClick={this.goTo}
							sidebarIsOpen={open}
						/>
						<SidebarMenu
							name={Strings.sidebar.books}
							url="books"
							icon="frame"
							activeTab={activeTab}
							onClick={this.goTo}
							sidebarIsOpen={open}
						/>
						<SidebarMenu
							name={Strings.sidebar.notifications}
							url="notifications"
							icon="bell1"
							activeTab={activeTab}
							onClick={this.goTo}
							sidebarIsOpen={open}
						/>
						<SidebarMenu
							name={Strings.sidebar.users}
							url="users"
							icon="user2"
							activeTab={activeTab}
							onClick={this.goTo}
							sidebarIsOpen={open}
						/>

						{(isOwner && (<SidebarMenu
							name={Strings.sidebar.staff}
							url="staff"
							icon="working-briefcase"
							activeTab={activeTab}
							onClick={this.goTo}
							sidebarIsOpen={open}
						/>)) || null}
						<SidebarMenu
							name={Strings.sidebar.settings}
							url="settings"
							icon="preferences"
							activeTab={activeTab}
							onClick={this.goTo}
							sidebarIsOpen={open}
						/>
					</div>
				</div>
			</div>
		);
	}
}


const mapStateToProps = (state: any) => ({
	settings: state.settings,
	user: state.user,
	language: state.language,
});

export default connect(mapStateToProps)(Sidebar);