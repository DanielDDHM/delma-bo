/**
 *
 * UserMenu
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Collapse, Icon } from 'components';
import { Tooltip, Tabs, Row, Col, Form, Input, Button } from 'antd';
import { setLogout, setStaffModal, setLoader, setUser, setLanguage } from 'store/actions';
import { capitalize } from 'utils/utils';
import { Endpoints, API } from 'utils/api';
import Strings from 'utils/strings';
import './styles.scss';

import userPlaceholder from 'assets/images/placeholders/user.jpg';

const { TabPane } = Tabs;

export class UserMenu extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			open: false,
			profileModal: false,
			windowWidth: window.innerWidth < 1200 ? window.innerWidth - 20 : 800,

			name: props.user.name,
			email: props.user.email,
			phone: props.user.phone || '',
			photo: props.user.photo || null,
			language: props.user.language || null,
			role: props.user.role,
		};

		this.getUserMenus = this.getUserMenus.bind(this);
		this.toggleProfile = this.toggleProfile.bind(this);
		this.logout = this.logout.bind(this);
	}

	async componentDidMount() {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		try {
            const response = await API.get({ url: Endpoints.uriStaff('me') });
            if (response.ok) {
                const { staff } = response.data.results || {};
                const staffCopy = JSON.parse(JSON.stringify(staff));

                Strings.setLanguage(staff?.language || 'pt');
                dispatch(setLanguage(staff?.language || 'pt'));

                dispatch(setUser(staffCopy));
            }
        } catch (err) {
            console.log('API Error', err);
        }

		// try {
		// 	const response = await API.get({ url: Endpoints.uriStaff('me') });
		// 	if (response.ok) {
		// 		dispatch(setUser(response.data.results));

		// 		Strings.setLanguage(response.data.results?.language || 'en');
		// 		dispatch(setLanguage(response.data.results?.language || 'en'));
		// 	}
		// } catch (err) {
		// 	console.log('API Error', err);
		// }

		dispatch(setLoader(false));
	}

	componentDidUpdate(prevProps: any) {
		const { sidebarIsOpen } = this.props;
		const { open } = this.state;

		if (sidebarIsOpen !== prevProps.sidebarIsOpen && open) {
			this.forceUpdate();
		}
	}

	toggleProfile() {
		const { dispatch, user } = this.props;

		dispatch(setStaffModal({
			staff: JSON.parse(JSON.stringify(user)),
			open: true,
			isMe: true,
		}));
	}

	async logout() {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		try {
			const response = await API.post({ url: Endpoints.uriLogout() });
			if (response.ok) {
				dispatch(setLogout());
			}
		} catch (err) {
			console.log('API Error', err);
		}

		dispatch(setLoader(false));
	}

	getUserMenus() {
		const { sidebarIsOpen } = this.props;

		if (sidebarIsOpen) {
			return (
				<div className="SidebarMenu">
					<div className="SidebarMenuOptions __forceWidth">
						<div onClick={this.toggleProfile} className="SidebarMenuOption">
							<Icon name="user2" className="m10r" />
							<span>{Strings.sidebar.profile}</span>
						</div>
						<div onClick={this.logout} className="SidebarMenuOption">
							<Icon name="logout" className="m10r" />
							<span>{Strings.authentication.logout}</span>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="SidebarMenu">
				<div className="SidebarMenuOptions __mobile">
					<Tooltip placement="right" title={Strings.sidebar.profile}>
						<div onClick={this.toggleProfile} className="SidebarMenuOption">
							<Icon name="user2" />
						</div>
					</Tooltip>
					<Tooltip placement="right" title={Strings.authentication.logout}>
						<div onClick={this.logout} className="SidebarMenuOption">
							<Icon name="logout" />
						</div>
					</Tooltip>
				</div>
			</div>
		);
	}

	renderProfile() {
		const { name, email, photo, role } = this.state;
		const { user } = this.props;

		return (
			<Row gutter={[24, 24]}>
				<Col xs={24} md={8}>
					<div className="ProfilePictureContainer">
						<div className="ProfilePicture">
							<img alt={Strings.profile.profilePicture} src={photo} />
						</div>
						<span className="ProfileName">{user.name}</span>
						<div className="ProfileEmail">
							<span>{email}</span>
						</div>
					</div>
					<Button type="primary" block onClick={this.logout}>
						{Strings.authentication.logout}
					</Button>
				</Col>
				<Col xs={24} md={16}>
					<Form layout="vertical" name="profile">
						<Form.Item
							label={Strings.fields.name}
							name="name"
							initialValue={name}
							rules={[{ required: true, message: Strings.errors.fillField }]}
						>
							<Input
								placeholder={Strings.placeholders.name}
								onChange={e => this.setState({ name: e.target.value })}
							/>
						</Form.Item>
						<Form.Item
							label={Strings.profile.role}
							name="email"
							initialValue={capitalize(role)}
						>
							<Input
								disabled
								placeholder={Strings.placeholders.role}
							/>
						</Form.Item>
					</Form>
				</Col>
			</Row>
		);
	}

	renderProfileHeader() {
		return (
			<Tabs
				defaultActiveKey="profile"
				centered>
				<TabPane tab={Strings.sidebar.profile} key="profile">
					{this.renderProfile()}
				</TabPane>
				<TabPane tab={Strings.fields.password} key="password">
					Mudar Password
				</TabPane>
				{/* <TabPane tab={Strings.fields.email} key="email">
					Mudar Email
				</TabPane> */}
			</Tabs>
		);
	}

	render() {
		const { open } = this.state;
		const { user } = this.props;

		if (!user) { return null };

		return (
			<Collapse expandedChildren={this.getUserMenus()} expanded={open}>
				<div
					className={`SidebarMenuObject AdjustUserMenu${open ? ' active' : ''}`}
					onClick={e => this.setState((state: any) => ({ open: !state.open }))}>
					<div className="SidebarMenu">
						<div className="SidebarUserLogo" style={{ backgroundImage: `url(${user.photo || userPlaceholder})` }}>
							{/* <img src={user.photo || userPlaceholder} alt="User Logo" /> */}
						</div>
						<span className="SidebarNavName __normal">{user.name || 'Username'}</span>
					</div>
					<em className={`caret${open ? ' __opened' : ''}`} />
				</div>
			</Collapse>
		);
	}
}

const mapStateToProps = (state: any) => ({
	user: state.user,
});

export default connect(mapStateToProps)(UserMenu);