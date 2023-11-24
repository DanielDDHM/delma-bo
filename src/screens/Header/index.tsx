/**
 *
 * Header
 *
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Title, Breadcrumb } from 'components';
import { Popover } from 'antd';

import './styles.scss';

/* eslint-disable react/prefer-stateless-function */
export class Header extends Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			isMobile: window.innerWidth < 992,
			showMenu: false,
		};

		this.toggleSidebar = this.toggleSidebar.bind(this);
		this.handleResize = this.handleResize.bind(this);
	}

	componentDidMount() {
		window.addEventListener('resize', this.handleResize)
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize() {
		this.setState({ isMobile: window.innerWidth < 992 });
	}

	toggleSidebar() {
		this.props.onToggleSidebar();
	}

	renderBurger() {
		const { sidebarOpen } = this.props;

		return (
			<div className="BurgerContainer" onClick={this.toggleSidebar}>
				{sidebarOpen ? (
					<Icon name="dots-vertical" className="BurgerMenu __bigger" />
				) : (
					<Icon name="Menu" className="BurgerMenu" />
				)}
			</div>
		);
	}

	renderTitle() {
		const { title } = this.props;

		return (
			<React.Fragment>
				<div className="HeaderLeftSection">
					{this.renderBurger()}
					{/* <span className="PageTitle">{title}</span> */}
					<Title title={title} />
				</div>
				<div className="HeaderRightSection" />
			</React.Fragment>
		);
	}

	renderOptions() {
		const { isMobile } = this.state;

		if (isMobile) {
			return (
				<Popover
					placement="bottomRight"
					trigger="click"
					content={null}
				>
					<div onClick={() => this.setState({ showMenu: true })} className="MobileHeaderOptions">
						<Icon name="preferences" />
					</div>
				</Popover>
			);
		}

		return (
			<div className="HeaderOptions"></div>
		)
	}

	render() {
		const { sidebarOpen } = this.props;

		return (
			<div className="HeaderContainer">
				<div id='AppHeader' className='Header'>
					{this.renderTitle()}
					{/* {partners.length >= 2 ? this.renderPartners(partners, selectedPartner) : null} */}
				</div>
				<Breadcrumb sidebarOpen={sidebarOpen} />
			</div>
		);
	}
}

const mapStateToProps = (state: any) => ({
	router: state.router,
	title: state.title,
	user: state.user,
	language: state.language,
	settings: state.settings,
});

export default connect(mapStateToProps)(Header);
