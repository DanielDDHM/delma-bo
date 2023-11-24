import React from 'react';
import { connect } from 'react-redux';
import { delayedDispatch, setBreadcrumb, setLoader, setTitle, updateCrumb } from 'store/actions';
import { Props } from './types';
import { Helmet } from 'react-helmet';
import { ContentWrapper, Icon, Table } from 'components';
import { Col, Input, notification, Row, Modal } from 'antd';
import Compressor from 'compressorjs';
import Dropzone from 'react-dropzone';
import { API, Endpoints } from 'utils/api';
import Strings from 'utils/strings';
import './styles.scss';
import { DateTime } from 'luxon';
import { push } from 'connected-react-router';

class UserDetail extends React.Component<Props, any> {
	constructor(props: Props) {
		super(props);

		this.state = {
			name: '',
			email: '',

			hasUnsavedFields: false,
		}
	}

	componentDidMount() {
		const { dispatch } = this.props;

		dispatch(setTitle(Strings.users.header));

		delayedDispatch(
			setBreadcrumb(() => {
				const { user } = this.state;

				return {
					locations: [
						{
							icon: 'user2',
							text: Strings.sidebar.users,
							route: "/users",
						},
						{
							icon: 'user2',
							text: user?.name,
						}
					],
					actions: [
						{
							type: "button",
							text: Strings.generic.forget,
							disabled: user?.isDelete || false,
							className: "BreadcrumbForgetButton",
							onClick: () => {
								this.setState({ openConfirmForgetModal: { email: user.email } })
							},
						},
					],
				};
			})
		);

		this.getData();
	}

	componentDidUpdate() {
		const { dispatch } = this.props;

		dispatch(setTitle(Strings.users.header));
		dispatch(updateCrumb());
	}

	async getData() {
		const { dispatch, match } = this.props;

		dispatch(setLoader(true));

		const response = await API.get({
			url: Endpoints.uriUsers(match?.params?.id),
		});

		if (response.ok) {
			const { user } = response.data.results || {};

			this.setState({ ...user, user });
		}

		dispatch(setLoader(false));
	}

	async forgetUser() {
		const { dispatch } = this.props;
		const { user } = this.state;

		dispatch(setLoader(true));

		const response = await API.patch({
			url: Endpoints.uriUsers(`${user._id}/forget`),
		});

		if (response.ok) {
			const { user } = response.data.results || {};

			this.setState({ openConfirmForgetModal: false, user, name: user.name, email: user.email });

		} else {
			notification.error({
				message: Strings.serverErrors.title,
				description: (response.data?.message as string) || Strings.serverErrors.wentWrong,
				placement: "bottomRight",
				duration: 5,
			});
		}

		dispatch(setLoader(false));
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
						this.setState({
							photo: { file: result, preview: res },
							hasUnsavedFields: true,
						});
					});
				},
			});
		} catch (err) {
			console.log('err', err)
			notification.warn({
				message: Strings.errors.unsupportedFile,
				description: Strings.errors.fileNotSupported,
				placement: 'bottomRight',
				duration: 5,
			});
		}
	}

	renderConfirmForget = () => {
		const { openConfirmForgetModal } = this.state;

		return (
			<Modal
				centered
				className="confirmForget"
				style={{ textAlign: 'center' }}
				visible={openConfirmForgetModal}
				cancelText={Strings.generic.close}
				okText={Strings.authentication.forgetConfirm}
				onOk={() => this.forgetUser()}
				onCancel={() => this.setState({ openConfirmForgetModal: false })}
				title={null}
				closable={false}
				bodyStyle={{ minHeight: 420 }}
			>
				<Icon name='user2' style={{ fontSize: '50px' }}></Icon>
				<div className="title">
					{openConfirmForgetModal?.email ? Strings.formatString(
						Strings.authentication.forgetTitle,
						openConfirmForgetModal?.email) :
						Strings.authentication.forgetTitle}
				</div>
			</Modal>
		);
	}

	renderAppointments() {
		const { history } = this.state;
		const { dispatch } = this.props;

		return (
			<Table
				title={{
					icon: "calendar",
					title: Strings.clients.consultationsHistory,
				}}
				data={history}
				columns={[
					{
						Header: Strings.fields.date,
						id: "date",
						accessor: (row: any) => (row.date && DateTime.fromISO(row.date).toFormat('dd/LL/yyyy HH:mm')) || '-',
						type: "date",
						Filter: () => { },
						maxWidth: 200,
					},
					{
						Header: Strings.appointments.psychologist,
						id: "psychologist",
						accessor: (row: any) => row.psychologist?.name || '-',
						type: "text",
					},
				]}
				filterable
				actions={{
					view: (original: any) => ({
						onClick: () => dispatch(push(`/appointments/${original._id}`)),
					}),
				}}
			/>
		);
	}

	render() {
		const { photo, name, email } = this.state;

		return (
			<div className="Screen-User-Details">
				<Helmet>
					<title>{Strings.users.header}</title>
					<meta name='description' content="Edit your user\'s information" />
				</Helmet>
				<ContentWrapper extraStyle={{ padding: 20 }}>
					<div style={{ margin: "0 0 20px" }} className="GenericTitleContainer">
						<Icon name="user2" />
						<h1>{Strings.users.fullInfo}</h1>
					</div>
					<Row gutter={[20, 20]}>
						<Col xs={24} lg={8}>
							<div className="UserMainImage">
								<Dropzone
									accept="image/jpg, image/jpeg, image/png"
									className="GenericImageUpload"
									disabled
									style={{ minHeight: 250 }}
									onDrop={(files: any) => this.onDrop(files)}
								>
									{photo ? (
										<div
											className="UserImage"
											style={{ backgroundImage: (photo && `url('${photo?.preview || photo}')`) || 'none' }}
										/>
									) : (
										<div className={`GenericImageUploadOverlay${!photo ? ' --visible' : ''}`}>
											<Icon name="user2" />
											<span>{Strings.generic.userImage}</span>
										</div>
									)}
									{photo && (
										<button
											onClick={(e: React.MouseEvent<HTMLElement>) => {
												e.stopPropagation();
												this.setState({ photo: null, hasUnsavedFields: true });
											}}
											className="GenericImageDelete"
										>
											<Icon name="close" />
										</button>
									)}
								</Dropzone>
							</div>
						</Col>
						<Col xs={24} lg={16}>
							<Row gutter={[20, 20]}>
								<Col xs={24} md={12}>
									<label htmlFor="user_name" className="InputLabel --label-required">
										{Strings.fields.name}
									</label>
									<Input
										id="user_name"
										value={name || ''}
										disabled
										placeholder={Strings.fields.name}
										onChange={(event: any) => this.setState({ name: event.target.value, hasUnsavedFields: true })}
									/>
								</Col>
								<Col xs={24} md={12}>
									<label htmlFor="user_email" className="InputLabel --label-required">
										{Strings.fields.email}
									</label>
									<Input
										id="user_email"
										value={email || ''}
										disabled
										placeholder={Strings.fields.email}
										onChange={(event: any) => this.setState({ email: event.target.value, hasUnsavedFields: true })}
									/>
								</Col>
							</Row>
						</Col>
					</Row>
				</ContentWrapper>
				{this.renderConfirmForget()}
				{this.renderAppointments()}
			</div>
		);
	}
}

const mapStateToProps = (state: any) => ({
	language: state.language,
});

export default connect(mapStateToProps)(UserDetail);
