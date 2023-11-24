/*
 *
 * Staff
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Icon, Table } from 'components';
import { Tooltip, Modal, notification, Drawer, Input, Row, Col, Select } from 'antd';
import { setBreadcrumb, setLoader, setStaffModal, setTitle } from 'store/actions';
import { Props, State } from './types';

import Strings from 'utils/strings';
import { API, Endpoints } from 'utils/api';
import './styles.scss';

const ROLES = ["owner", "admin"];

export class Staff extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			staff: [],
			openSidebar: false,
			tempStaff: null,
			openConfirmResendInviteModal: false,
		};
	}

	componentDidMount() {
		const { dispatch } = this.props;

		dispatch(setTitle(''));
		dispatch(setBreadcrumb(null));

		this.getStaff();
	}

	async getStaff() {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		try {
			const response = await API.get({
				url: Endpoints.uriStaff(),
			});

			if (response.ok) {
				this.setState({
					staff: response.data.results.staff || [],
				});
			}
		} catch (err) {
			console.log('API Error', err);
		}

		dispatch(setLoader(false));
	}

	onEdit(value: any) {
		const { staff = [] } = this.state;
		const { dispatch, user } = this.props;
		dispatch(
			setStaffModal({
				open: true,
				isMe: value._id === user._id,
				staff: value,
				callback: (user: any) => {
					const index = staff.findIndex(
						(staff: any) => staff._id === user._id
					);
					if (index !== -1) {
						staff[index] = JSON.parse(JSON.stringify(user));
						this.setState({ staff });
					}
				},
			})
		);
	}

	onDelete = async (id: any) => {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		try {
			const response = await API.delete({ url: Endpoints.uriStaff(id) });

			if (response.ok && response.data.results.staff) {
				this.setState({ staff: response.data.results.staff, openSidebar: false, tempStaff: null });
			}
		} catch (err) {
			notification.error({
				message: Strings.serverErrors.title,
				description: err as string || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		dispatch(setLoader(false));
	}

	toogleStaff = async (staff: any) => {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		try {
			const response = await API.patch({
				url: Endpoints.uriStaff(staff._id),
				data: { isActive: !staff.isActive }
			});

			if (response.ok) {
				this.setState({ staff: response.data.results.staff });
			}
		} catch (err) {
			notification.error({
				message: Strings.serverErrors.title,
				description: err as string || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		dispatch(setLoader(false));
	}

	resendEmail = async (staff: any) => {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		try {
			const response = await API.post({
				url: Endpoints.uriStaff(`resend-invite/${staff._id}`),
			});

			if (response.ok && response.data.results) {
				this.setState({ staff: response.data.results, openConfirmResendInviteModal: false });
				notification.success({
					message: Strings.emails.invite,
					description: response.data.message,
					placement: 'bottomRight',
					duration: 5,
				})
			}
		} catch (err) {
			notification.error({
				message: Strings.serverErrors.title,
				description: err as string || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		dispatch(setLoader(false));
	}

	getStatus(status: any) {
		if (status) {
			return Strings.staff.confirmed;
		}
		return Strings.staff.pending;
	}

	submitStaff = async () => {
		const { tempStaff } = this.state;
		const { dispatch } = this.props;

		if (!tempStaff?.name?.trim() || !tempStaff?.email?.trim() || !tempStaff?.role) {
			return notification.warn({
				message: tempStaff._id ? Strings.staff.editStaff : Strings.staff.createStaff,
				description: Strings.errors.invalidFields,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		dispatch(setLoader(true));

		try {
			const request = tempStaff._id ? API.put : API.post;
			const response = await request({
				url: Endpoints.uriStaff(tempStaff._id || ''),
				data: {
					name: tempStaff.name,
					email: tempStaff.email,
					role: tempStaff.role
				},
			});

			if (response.ok && response.data.results.staff) {
				this.setState({ openSidebar: false, tempStaff: null }, () => this.getStaff());

				notification.success({
					message: tempStaff._id ? Strings.staff.editStaff : Strings.staff.createStaff,
					description: response.data.message || (tempStaff._id ? Strings.staff.editedSuccessfully : Strings.staff.createdSuccessfully),
					placement: 'bottomRight',
					duration: 5,
				});
			}
		} catch (err) {
			notification.error({
				message: Strings.serverErrors.title,
				description: err as string || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		dispatch(setLoader(false));
	}

	removeStaff = async (id: any) => {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		try {
			const response = await API.delete({
				url: Endpoints.uriStaff(id),
			});

			if (response?.ok) {
				const { staff = [] } = response.data.results;

				this.setState({ staff });

				notification.success({
					message: Strings.staff.removeStaff,
					description: response.data.message || Strings.staff.removed,
					placement: 'bottomRight',
					duration: 5,
				});
			}
		} catch (err) {
			notification.error({
				message: Strings.serverErrors.title,
				description: (err as string) || Strings.serverErrors.wentWrong,
				placement: "bottomRight",
				duration: 5,
			});
		}

		dispatch(setLoader(false));
	};

	toggleStaff = async (user: any) => {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		try {
			const body = {
				isActive: !user.isActive,
			};

			const response = await API.patch({
				url: Endpoints.uriStaff(user._id),
				data: body,
			});

			if (response?.ok) {
				const { staff = [] } = response.data.results;

				this.setState({ staff });

				notification.success({
					message: user.isActive ? Strings.staff.disableStaff : Strings.staff.enableStaff,
					description: response.data.message || (user.isActive ? Strings.staff.disabled : Strings.staff.enabled),
					placement: 'bottomRight',
					duration: 5,
				});
			}
		} catch (err) {
			notification.error({
				message: Strings.serverErrors.title,
				description: (err as string) || Strings.serverErrors.wentWrong,
				placement: "bottomRight",
				duration: 5,
			});
		}
		dispatch(setLoader(false));
	};

	renderConfirmResendInvite = () => {
		const { openConfirmResendInviteModal } = this.state;

		return (
			<Modal
				className="resendInvite"
				style={{ textAlign: 'center' }}
				visible={openConfirmResendInviteModal}
				cancelText={Strings.generic.close}
				okText={Strings.authentication.resendInviteEmail}
				onOk={() => this.resendEmail(openConfirmResendInviteModal)}
				onCancel={() => this.setState({ openConfirmResendInviteModal: false })}
				title={null}
				closable={false}
				bodyStyle={{ minHeight: 200 }}
			>
				<Icon name='paper-plane' style={{ fontSize: '50px' }} />
				<div className="title">
					{openConfirmResendInviteModal ? Strings.formatString(
						Strings.authentication.confirmResendInviteEmail,
						openConfirmResendInviteModal.name) :
						Strings.authentication.resendInviteEmail}
				</div>
			</Modal>
		);
	}

	renderStatus = (elem: any) => {
		if (elem.value === 'true')
			return (
				<div className="TableTag --tag-success">
					<span>{this.getStatus(true)}</span>
				</div>
			);

		return (
			<Tooltip title={Strings.authentication.resendInviteEmail}>
				<div
					className="TableTag --tag-warning --tag-clickable"
					onClick={() => this.setState({ openConfirmResendInviteModal: elem.cell.row.original })}>
					<Icon name="refresh" className="resend" />
					<span>{this.getStatus(false)}</span>
				</div>
			</Tooltip>
		);
	}

	getRole(role: string) {
		switch (role) {
			case 'owner':
				return Strings.staff.owner;
			case 'admin':
				return Strings.staff.admin;
			case 'sysadmin':
				return Strings.staff.sysAdmin;
			default:
				return role;
		}
	}

	renderSidebarContent() {
		const { tempStaff } = this.state;

		return (
			<Row gutter={[0, 10]}>
				<Col xs={24}>
					<label
						htmlFor="staff_name"
						className="InputLabel --label-required"
					>
						{Strings.fields.name}
					</label>
					<Input
						id="staff_name"
						value={tempStaff?.name || ""}
						placeholder={Strings.fields.name}
						onChange={(event: any) => {
							const value = event.target.value;
							this.setState((state: any) => ({
								tempStaff: { ...state.tempStaff, name: value },
							}));
						}}
					/>
				</Col>
				<Col xs={24}>
					<label
						htmlFor="staff_email"
						className="InputLabel --label-required"
					>
						{Strings.fields.email}
					</label>
					<Input
						id="staff_email"
						value={tempStaff?.email || ""}
						placeholder={Strings.fields.email}
						onChange={(event: any) => {
							const value = event.target.value;
							this.setState((state: any) => ({
								tempStaff: { ...state.tempStaff, email: value },
							}));
						}}
					/>
				</Col>
				<Col xs={24}>
					<label htmlFor="role" className="InputLabel --label-required">
						{Strings.profile.role}
					</label>
					<Select
						id="role"
						key={`role_${tempStaff?.role}`}
						className="tagsSelector"
						style={{ width: "100%" }}
						placeholder={Strings.placeholders.role}
						showSearch
						filterOption={(input: any, option: any) =>
							option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}
						defaultValue={tempStaff?.role || null}
						onChange={(elem: any) =>
							this.setState((state: any) => ({
								tempStaff: { ...state.tempStaff, role: elem },
							}))
						}
					>
						{ROLES.map((role: any) => (
							<Select.Option key={`role_${role}`} value={role.toLowerCase()}>
								{role.charAt(0).toUpperCase() + role.slice(1)}
							</Select.Option>
						))}
					</Select>
				</Col>
			</Row>
		);
	}

	renderDrawer() {
		const { openSidebar } = this.state;

		return (
			<Drawer
				title={
					<div className="SidebarTitleContainer">
						<Icon name="user2" />
						<p>{Strings.staff.addStaff}</p>
					</div>
				}
				footer={
					<div className="SidebarFooterContainer">
						<button
							type="button"
							className="SidebarFooterButton --button-confirm"
							onClick={() => this.submitStaff()}
						>
							{Strings.generic.confirm}
						</button>
						<button
							type="button"
							className="SidebarFooterButton --button-cancel"
							onClick={() => { }}
						>
							{Strings.generic.cancel}
						</button>
					</div>
				}
				placement="right"
				width={400}
				onClose={() => this.setState({ tempStaff: null, openSidebar: false })}
				visible={openSidebar}
			>
				{this.renderSidebarContent()}
			</Drawer>
		)
	}

	render() {
		const { staff } = this.state;
		const { user } = this.props;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.staff}</title>
					<meta name='description' content='Description of Staff' />
				</Helmet>
				<Table
					title={{
						icon: "user2",
						title: Strings.sidebar.staff
					}}
					data={staff}
					columns={[
						{
							Header: Strings.fields.photo,
							id: 'photo',
							accessor: (row: any) => row.photo,
							type: 'image',
							maxWidth: 65,
						},
						{
							Header: Strings.fields.name,
							id: 'name',
							accessor: (row: any) => row.name,
						},
						{
							Header: Strings.fields.email,
							id: 'email',
							accessor: (row: any) => row.email,
						},
						{
							Header: Strings.staff.status,
							id: 'status',
							accessor: (user: any) => String(user.isConfirmed),
							Cell: this.renderStatus,
						},
						{
							Header: Strings.profile.role,
							id: 'role',
							accessor: (row: any) => this.getRole(row.role),
						},
					]}
					filterable
					add={{
						onClick: () => this.setState({ tempStaff: {}, openSidebar: true }),
					}}
					actions={{
						edit: (original: any) => ({
							disabled: original.role === 'sysadmin' && user?.role !== "sysadmin",
							onClick: () => {
								this.setState({ tempStaff: JSON.parse(JSON.stringify(original)), openSidebar: true });
							},
						}),
						remove: (original: any) => ({
							disabled: original.role === "sysadmin",
							onClick: () => this.removeStaff(original._id),
						}),
						toggle: (original: any) => ({
							value: original.isActive,
							disabled: original.role === "sysadmin",
							onChange: () => this.toggleStaff(original),
						}),
					}}
				/>
				{this.renderConfirmResendInvite()}
				{this.renderDrawer()}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({
	language: state.language,
	user: state.user,
});

export default connect(mapStateToProps)(Staff);
