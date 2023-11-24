/**
 *
 * Sidebar Menu
 *
 */

import React, { Component } from 'react';
import { Collapse, Icon } from 'components';

export default class SidebarMenu extends Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			open: false,
		};
	}

	getSubMenus() {
		const { subMenus = [], onClick } = this.props;
		const { pathname, origin } = window.location;
		const path = pathname.replace('/admin/', '').replace(origin, '');

		return (
			<React.Fragment>
				{subMenus.map((subMenu: any) => {
					const isActive = path.startsWith(`/${subMenu.url}`);

					return (
						<a
							key={`subMenu_${JSON.stringify(subMenu)}`}
							href={`${window.location.origin}/${subMenu.url}`}
							onClick={e => {
								e.preventDefault();

								if (onClick && path !== `/${subMenu.url}`) {
									onClick(subMenu.url);
								}
							}}
							className={`SidebarMenuObject${isActive ? ' active' : ''}`}>
							<div className="SidebarMenu isSubMenu">
								<div className="SidebarMenuIcon">
									<span>{subMenu.name.substring(0, 2)}</span>
								</div>
								<span className="SidebarNavName">{subMenu.name}</span>
							</div>
						</a>
					);
				})}
			</React.Fragment>
		);
	}

	renderMenu() {
		const { open } = this.state;
		const { url, name, icon, subMenus = [], onClick } = this.props;
		const { pathname, origin } = window.location;
		const path = pathname.replace('/admin/', '').replace(origin, '');
		const hasChildren = subMenus.length > 0;

		let isActive = path.startsWith(`/${url}`);

		if (Array.isArray(subMenus) && subMenus.length > 0 && !isActive) {
			isActive = Boolean(subMenus.find(other => path.startsWith(`/${other.url}`)));
		}

		return (
			<a
				href={`${window.location.origin}/${url}`}
				className={`SidebarMenuObject${isActive ? ' active' : ''}`}
				onClick={e => {
					e.preventDefault();

					if (onClick && path !== `/${url}` && !hasChildren) {
						onClick(url);
					}

					if (!isActive) {
						this.setState((state: any) => ({ open: !state.open }));
					}
				}}>
				<div className="SidebarMenu">
					<div className="SidebarMenuIcon">
						{/* <em className={icon} /> */}
						<Icon name={icon} />
					</div>
					<span className="SidebarNavName">{name}</span>
				</div>
				{hasChildren && (
					// <span className="MenuHasOptions">{open ? '-' : '+'}</span>
					<em className={`caret${open ? ' __opened' : ''}`} />
				)}
			</a>
		);
	}

	render() {
		const { open } = this.state;
		const { url, subMenus = [] } = this.props;
		const { pathname, origin } = window.location;
		const path = pathname.replace('/admin/', '').replace(origin, '');

		let isActive = path.startsWith(`/${url}`);

		if (Array.isArray(subMenus) && subMenus.length > 0 && !isActive) {
			isActive = Boolean(subMenus.find(other => path.startsWith(`/${other.url}`)));
		}

		return (
			<Collapse expandedChildren={this.getSubMenus()} expanded={isActive || open}>
				{this.renderMenu()}
			</Collapse>
		);
	}
}