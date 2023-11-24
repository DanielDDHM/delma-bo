/**
 *
 * StaffModal
 *
 */

import React from "react";
import { connect } from "react-redux";
import { setStaffModal, setLogout, setLoader, setUser, setLanguage } from "store/actions";
import { Row, Col, Input, Form, Modal, Button, Tabs, Select, Tooltip, notification } from "antd";
import { FormInstance } from "antd/lib/form";
import { emailIsValid } from "utils/utils";
import Dropzone from "react-dropzone";
import Compressor from "compressorjs";
import { Icon } from "components";

import { API, Endpoints } from "utils/api";
import Strings from "utils/strings";
import "./styles.scss";

import userPlaceholder from "assets/images/placeholders/user.jpg";

const { TabPane } = Tabs;
const { Option } = Select;

export class StaffModal extends React.Component<any, any> {
	passwordForm = React.createRef<FormInstance>();

	constructor(props: any) {
		super(props);

		this.state = {
			windowWidth: window.innerWidth < 600 ? window.innerWidth - 20 : 600,
			selectedTab: "profile",
			language: "pt",
			hasUnsavedFields: {},

			newPassword: "",
			confirmPassword: "",
			newEmail: "",
		};

		this.closeProfile = this.closeProfile.bind(this);
		this.logout = this.logout.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.handleTabClick = this.handleTabClick.bind(this);
		this.onLanguageChange = this.onLanguageChange.bind(this);
		this.onRoleChange = this.onRoleChange.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.submit = this.submit.bind(this);
		this.deletePhoto = this.deletePhoto.bind(this);

		window.addEventListener("resize", this.handleResize);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize);
	}

	UNSAFE_componentWillReceiveProps(nextProps: any) {
		this.setState({
			...nextProps.staffModal?.staff,
			isMe: nextProps.staffModal?.isMe,
			hasUnsavedFields: {},
			newEmail: "",
			newPassword: "",
			confirmPassword: "",
			callback: nextProps.staffModal?.callback,
		});
	}

	handleResize() {
		const { staffModal } = this.props;

		if (staffModal?.open) {
			this.setState({
				windowWidth: window.innerWidth < 600 ? window.innerWidth - 20 : 600,
			});
		}
	}

	closeProfile() {
		const { dispatch } = this.props;

		dispatch(setStaffModal(null));
	}

	isValid(tab: string) {
		switch (tab) {
			case "profile": {
				const { name } = this.state;

				if (!name || !name.trim()) {
					notification.warn({
						message: Strings.errors.invalidFields,
						description: Strings.errors.nameIsEmpty,
						placement: 'bottomRight',
						duration: 5,
					});

					return false;
				}

				return true;
			}

			case "password": {
				const { password, newPassword, confirmPassword } = this.state;

				if (!password || !newPassword || !confirmPassword) {
					notification.warn({
						message: Strings.authentication.header,
						description: Strings.errors.invalidFields,
						placement: 'bottomRight',
						duration: 5,
					});

					return false;
				} else if (newPassword !== confirmPassword) {
					notification.warn({
						message: Strings.authentication.header,
						description: Strings.errors.passwordsDontMatch,
						placement: 'bottomRight',
						duration: 5,
					});

					return false;
				}

				return true;
			}

			case "email": {
				const { newEmail } = this.state;

				if (!newEmail || !newEmail.trim()) {
					notification.warn({
						message: Strings.errors.invalidFields,
						description: Strings.errors.emailIsEmpty,
						placement: 'bottomRight',
						duration: 5,
					});

					return false;
				} else if (!emailIsValid(newEmail, Strings.errors.passwordsDontMatch)) {
					return false;
				}

				return true;
			}

			default:
				return false;
		}
	}

	async submit() {
		const {
			name,
			photo,
			role,
			newEmail,
			password,
			newPassword,
			language,
			selectedTab,
			isActive,
			callback,
		} = this.state;
		const { staffModal, dispatch } = this.props;

		if (!staffModal?.staff) return;

		dispatch(setLoader(true));

		try {
			if (selectedTab === "profile" && this.isValid("profile")) {
				const body = new FormData();

				body.append("isActive", isActive);
				body.append("name", name);
				body.append("role", role);
				body.append("language", language);

				if (photo && Object.keys(photo).length > 0) {
					if (photo.file) {
						body.append("photo", photo.file);
					} else {
						body.append("photo", photo);
					}
				}

				const response = await API.put({
					url: Endpoints.uriStaff(staffModal.staff._id),
					data: body,
				});
				if (response.ok) {
					if (staffModal.isMe) {
						Strings.setLanguage(response.data.results.staff?.language || 'en');
						dispatch(setLanguage(response.data.results.staff?.language || 'en'));

						notification.success({
							message: Strings.sidebar.profile,
							description: Strings.profile.editedSuccessfully,
							placement: 'bottomRight',
							duration: 5,
						});

						dispatch(
							setStaffModal({
								...staffModal,
								staff: response.data.results.staff,
							})
						);
						dispatch(setUser(response.data.results));
					} else {
						notification.success({
							message: Strings.sidebar.profile,
							description: Strings.profile.editedSuccessfully,
							placement: 'bottomRight',
							duration: 5,
						});

						dispatch(setStaffModal(null));
					}

					if (callback && typeof callback === 'function') {
						callback(response.data.results.object);
					}
				}
			} else if (selectedTab === "password" && this.isValid("password")) {
				const body = {
					password,
					newPassword,
				};

				const response = await API.put({
					url: Endpoints.uriStaffPassword(),
					data: body,
				});

				if (response.ok) {
					this.setState(
						{ password: "", newPassword: "", confirmPassword: "" },
						() => {
							this.passwordForm.current?.resetFields();
						}
					);
					dispatch(setStaffModal({ ...staffModal }));
					notification.success({
						message: Strings.authentication.header,
						description: Strings.staff.passwordChangedSuccessfully,
						placement: 'bottomRight',
						duration: 5,
					});
				} else {
					notification.warn({
						message: Strings.authentication.header,
						description: Strings.staff.wrongPassword,
						placement: 'bottomRight',
						duration: 5,
					});
				}
			} else if (selectedTab === "email" && this.isValid("email")) {
				const body = {
					newEmail,
				};

				const response = await API.put({
					url: Endpoints.uriStaffEmail(),
					data: body,
				});
				if (response.ok) {
					this.setState({
						newEmail: "",
						email: response.data.results.object.email,
					});

					dispatch(
						setStaffModal({
							...staffModal,
							staff: response.data.results.object,
						})
					);
					dispatch(setUser(response.data.results.object));

					notification.success({
						message: Strings.authentication.header,
						description: Strings.staff.emailChangedSuccessfully,
						placement: 'bottomRight',
						duration: 5,
					});
				} else {
					notification.error({
						message: Strings.errors.invalidFields,
						description: Strings.staff.emailInUse,
						placement: 'bottomRight',
						duration: 5,
					});
				}
			}
		} catch (err) {
			console.log("API Error", err);
		}

		dispatch(setLoader(false));
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
			console.log("API Error", err);
		}

		dispatch(setLoader(false));
	}

	handleTabClick(
		selectedTab: string,
		e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
	) {
		this.setState({ selectedTab });
	}

	onLanguageChange(value: string) {
		this.setState((state: any) => ({
			language: value,
			hasUnsavedFields: {
				...state.hasUnsavedFields,
				[state.selectedTab]: true,
			},
		}));
	}

	onRoleChange(value: string) {
		this.setState((state: any) => ({
			role: value,
			hasUnsavedFields: {
				...state.hasUnsavedFields,
				[state.selectedTab]: true,
			},
		}));
	}

	getBase64(file: any) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	}

	onDrop(files: any) {
		try {
			const file = files[files.length - 1];

			new Compressor(file, {
				quality: 0.9,
				maxWidth: 400,
				mimeType: "image/jpeg",
				success: (result: any) => {
					this.getBase64(result).then((res) => {
						this.setState((state: any) => ({
							photo: { file: result, preview: res },
							hasUnsavedFields: { ...state.hasUnsavedFields, profile: true },
						}));
					});
				},
			});
		} catch (err) {
			notification.warn({
				message: Strings.errors.unsupportedFile,
				description: Strings.errors.fileNotSupported,
				placement: 'bottomRight',
				duration: 5,
			});
		}
	}

	deletePhoto() {
		this.setState((state: any) => ({
			photo: null,
			hasUnsavedFields: { ...state.hasUnsavedFields, profile: true },
		}));
	}

	renderProfile() {
		const { name, photo, language, role } = this.state;
		const { staffModal } = this.props;

		return (
			<Row gutter={[24, 24]}>
				<Col xs={24} md={8}>
					<div className="ProfilePictureContainer">
						<div className="ProfilePicture">
							<img
								alt={Strings.profile.profilePicture}
								src={
									(photo?.preview ? photo.preview : photo) || userPlaceholder
								}
							/>
							<div className="ProfilePictureOverlay">
								<Dropzone
									accept="image/jpg, image/jpeg, image/png"
									className="ProfilePictureOverlayOption"
									onDrop={this.onDrop}
								>
									<Icon name="pencil-outline" />
								</Dropzone>
								<div
									className={`ProfilePictureOverlayOption${Boolean(photo) ? "" : " __disabled"
										}`}
									onClick={this.deletePhoto}
								>
									<Icon name="trash" />
								</div>
							</div>
						</div>
						<Tooltip placement="right" title={staffModal?.staff?.name}>
							<div className="ProfileName">
								<span>{staffModal?.staff?.name || ""}</span>
							</div>
						</Tooltip>
						<Tooltip placement="right" title={staffModal?.staff?.email}>
							<div className="ProfileEmail">
								<span>{staffModal?.staff?.email || ""}</span>
							</div>
						</Tooltip>
					</div>
					{(staffModal?.isMe && (
						<Button type="primary" block className="GenericButton" onClick={this.logout}>
							<Icon name="logout" />
							{Strings.authentication.logout}
						</Button>
					)) ||
						null}
				</Col>
				<Col xs={24} md={16}>
					<Form
						key={`modal_${staffModal?.open || false}`}
						layout="vertical"
						name="profile"
					>
						<Form.Item
							label={Strings.fields.name}
							name="name"
							initialValue={name}
							rules={[{ required: true, message: Strings.errors.fillField }]}
						>
							<Input
								placeholder={Strings.placeholders.name}
								onChange={(e: any) => {
									const { value: name } = e.target;
									this.setState((state: any) => ({
										name,
										hasUnsavedFields: {
											...state.hasUnsavedFields,
											[state.selectedTab]: true,
										},
									}));
								}}
							/>
						</Form.Item>
						<Form.Item
							label={Strings.profile.role}
							name="role"
							initialValue={role}
						>
							<Select
								disabled={staffModal?.isMe || staffModal?.staff?.role === 'admin'}
								placeholder={Strings.placeholders.role}
								optionFilterProp="children"
								onChange={this.onRoleChange}
								filterOption={(input: any, option: any) =>
									option.children.toLowerCase().indexOf(input.toLowerCase()) >=
									0
								}
								value={role}
							>
								<Option value="owner">{Strings.staff.owner}</Option>
								<Option value="admin">{Strings.staff.admin}</Option>
							</Select>
						</Form.Item>
						{/* <Form.Item
							label={Strings.language.header}
							name="language"
							initialValue={language}
						>
							<Select
								showSearch
								placeholder={Strings.placeholders.language}
								optionFilterProp="children"
								onChange={this.onLanguageChange}
								filterOption={(input: any, option: any) =>
									option.children.toLowerCase().indexOf(input.toLowerCase()) >=
									0
								}
								value={language}
							>
								<Option value="pt">{Strings.language.portuguese}</Option>
								<Option value="en">{Strings.language.english}</Option>
							</Select>
						</Form.Item> */}
					</Form>
				</Col>
			</Row>
		);
	}

	renderPassword() {
		const { staffModal } = this.props;
		const { password = "", newPassword, confirmPassword } = this.state;

		return (
			<Form
				ref={this.passwordForm}
				key={`modal_${JSON.stringify(staffModal) || false}`}
				layout="vertical"
				name="password"
			>
				<Form.Item
					label={Strings.fields.password}
					name="oldPassword"
					initialValue={password}
					rules={[{ required: true, message: Strings.errors.fillField }]}
				>
					<Input.Password
						placeholder={Strings.placeholders.currentPassword}
						onChange={(e: any) => {
							const { value: password } = e.target;
							this.setState((state: any) => ({
								password,
								hasUnsavedFields: {
									...state.hasUnsavedFields,
									[state.selectedTab]: true,
								},
							}));
						}}
						visibilityToggle
					/>
				</Form.Item>
				<Form.Item
					label={Strings.authentication.newPassword}
					name="newPassword"
					initialValue={newPassword}
					rules={[{ required: true, message: Strings.errors.fillField }]}
				>
					<Input.Password
						placeholder={Strings.placeholders.newPassword}
						value={newPassword}
						onChange={(e: any) => {
							const { value: newPassword } = e.target;
							this.setState((state: any) => ({
								newPassword,
								hasUnsavedFields: {
									...state.hasUnsavedFields,
									[state.selectedTab]: true,
								},
							}));
						}}
						visibilityToggle
					/>
				</Form.Item>
				<Form.Item
					label={Strings.authentication.confirmPassword}
					name="confirmPassword"
					initialValue={confirmPassword}
					rules={[{ required: true, message: Strings.errors.fillField }]}
				>
					<Input.Password
						placeholder={Strings.placeholders.confirmPassword}
						onChange={(e: any) => {
							const { value: confirmPassword } = e.target;
							this.setState((state: any) => ({
								confirmPassword,
								hasUnsavedFields: {
									...state.hasUnsavedFields,
									[state.selectedTab]: true,
								},
							}));
						}}
						visibilityToggle
					/>
				</Form.Item>
			</Form>
		);
	}

	renderEmail() {
		const { staffModal } = this.props;
		const { newEmail } = this.state;

		return (
			<Form
				key={`modal_${staffModal?.open || false}_${staffModal?.staff?.email}`}
				layout="vertical"
				name="email"
			>
				<Form.Item
					label={Strings.fields.email}
					name="email"
					initialValue={staffModal?.staff?.email || ""}
				>
					<Input placeholder={Strings.placeholders.email} disabled />
				</Form.Item>
				<Form.Item
					label={Strings.authentication.newEmail}
					name="newEmail"
					initialValue={newEmail}
					rules={[
						{ required: true, message: Strings.errors.fillField },
						{ type: "email", message: Strings.errors.emailIsInvalid },
					]}
				>
					<Input
						placeholder={Strings.placeholders.newEmail}
						onChange={(e: any) => {
							const { value: newEmail } = e.target;
							this.setState((state: any) => ({
								newEmail,
								hasUnsavedFields: {
									...state.hasUnsavedFields,
									[state.selectedTab]: true,
								},
							}));
						}}
					/>
				</Form.Item>
			</Form>
		);
	}

	renderProfileHeader() {
		const { staffModal } = this.props;

		return (
			<Tabs
				defaultActiveKey="profile"
				onTabClick={this.handleTabClick}
				centered
			>
				<TabPane tab={Strings.sidebar.profile} key="profile">
					{this.renderProfile()}
				</TabPane>
				<TabPane
					tab={Strings.authentication.changePassword}
					key="password"
					disabled={!staffModal?.isMe}
				>
					{this.renderPassword()}
				</TabPane>
				{/* <TabPane
					tab={Strings.authentication.changeEmail}
					key="email"
					disabled={!staffModal?.isMe}
				>
					{this.renderEmail()}
				</TabPane> */}
			</Tabs>
		);
	}

	render() {
		const { windowWidth, hasUnsavedFields, selectedTab } = this.state;
		const { staffModal } = this.props;

		return (
			<Modal
				key={staffModal?.open}
				centered
				width={windowWidth}
				visible={staffModal?.open || false}
				cancelText={Strings.generic.close}
				okText={Strings.generic.save}
				onOk={this.submit}
				onCancel={this.closeProfile}
				title={null}
				closable={false}
				bodyStyle={{
					minHeight: 420,
				}}
				okButtonProps={{
					disabled: !hasUnsavedFields[selectedTab],
				}}
			>
				{this.renderProfileHeader()}
			</Modal>
		);
	}
}

const mapStateToProps = (state: any) => ({
	user: state.user,
	staffModal: state.staffModal,
	language: state.language,
});

export default connect(mapStateToProps)(StaffModal);
