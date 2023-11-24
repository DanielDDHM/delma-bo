/*
 *
 * Accept Invite
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Icon } from 'components';
import Strings from 'utils/strings';
import { setLoader, setUser, setToken, setBreadcrumb } from 'store/actions';
import { Input, Button, Form, notification } from 'antd';
import { API, Endpoints } from 'utils/api';
import { push } from 'connected-react-router';
import logo from 'assets/images/logo.png';
import './styles.scss';

export class AcceptInvite extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			isMobile: window.innerWidth <= 768,
			password: '',
			confirmPassword: '',
		};

		this.acceptInvite = this.acceptInvite.bind(this);
		this.failedInvite = this.failedInvite.bind(this);
		this.handleResize = this.handleResize.bind(this);
		window.addEventListener('resize', this.handleResize);
	}

	async componentDidMount() {
		const { match, dispatch } = this.props;

		if (!match?.params?.id || !match?.params?.code) {
			dispatch(push('/'));
		}

		dispatch(setBreadcrumb(null));
		dispatch(setLoader(true));

		try {
			const response = await API.get({ url: Endpoints.uriStaff(`invite/${match?.params?.id}/code/${match.params.code}`) });

			if (response.ok) {
				const { invite } = response.data.results;
				if (!invite) {
					this.setState({ expired: true });
				} else {
					if (invite.staff && invite.from) {
						const { staff, from, business } = invite;
						this.setState({ staff, from, business });
					}
				}
			} else
				notification.error({
					message: Strings.serverErrors.title,
					description: response.data?.message || Strings.serverErrors.wentWrong,
					placement: 'bottomRight',
					duration: 5,
				});
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

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize() {
		this.setState({ isMobile: window.innerWidth <= 768 });
	}

	goToLogin(e: any) {
		const { dispatch } = this.props;

		e.preventDefault();
		dispatch(push('/login'));
	}

	acceptInvite(e: any) {
		const { staff, password } = this.state;
		const { match, dispatch } = this.props;

		if (!staff?.isConfirmed && e.password !== e.confirmPassword) {
			return notification.warn({
				message: Strings.authentication.header,
				description: Strings.errors.passwordsDontMatch,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		const body = {
			invite: match?.params?.id,
			invitationCode: match?.params?.code,
			password,
		} as any;

		// api call
		API.post({ url: Endpoints.uriStaff('confirm'), data: body }).then((response: any) => {
			if (response.ok) {
				const { staff, token } = response.data.results;
				dispatch(setUser({ ...staff }));
				dispatch(setToken(token));
			} else {
				notification.warn({
					message: Strings.authentication.header,
					description: response.data?.message || Strings.errors.passwordsDontMatch,
					placement: 'bottomRight',
					duration: 5,
				});
			}
		})
	}

	failedInvite() {
		notification.warn({
			message: Strings.authentication.header,
			description: Strings.errors.pleaseFillFormCorrectly,
			placement: 'bottomRight',
			duration: 5,
		});
	}

	renderForm() {
		const { isMobile, password, confirmPassword, staff, business } = this.state;
		const { user } = this.props;

		const userExists = staff?.isConfirmed || false;
		let greeting = Strings.formatString(
			Strings.acceptInvite.title,
			(this.state?.staff && this.state?.staff?.name) || '',
			(this.state?.from && this.state?.from?.name) || '',
			'Delma Nicolace',
			(this.state?.staff && this.state?.staff?.role) || '');

		if (business) {
			greeting = Strings.formatString(
				Strings.acceptInvite.title2,
				(this.state?.staff && this.state?.staff?.name) || '',
				(this.state?.from && this.state?.from?.name) || '',
				business?.name,
				(this.state?.staff && this.state?.staff?.role) || '');
		}

		return (
			<div className={`AcceptInviteWrapper${isMobile ? ' __isMobile' : ''}`}>
				<div className='AcceptInviteLogo'>
					<img style={{ width: 300 }} className="Logo" alt="Logo" src={logo} />
				</div>
				<div className='AcceptInviteContent'>
					{this.state?.expired ? (
						<>
							<div className="ExpiredInviteLabel">
								{Strings.acceptInvite.expired}
								{!user && <a href="/login" onClick={this.goToLogin} className="goToLogin">
									{Strings.authentication.goBackToLogin}
								</a>}
							</div>
						</>
					) : (
						<>
							<span className="AcceptInviteWelcome">
								{`${greeting}.`}
							</span>
							<span className="AcceptInviteSubtitle">
								{userExists ? Strings.authentication.confirmInvite : Strings.authentication.acceptSubtitle}
							</span>
							<Form name="recover" onFinish={this.acceptInvite} onFinishFailed={this.failedInvite}>
								<Form.Item
									name="password"
									rules={[{ required: true, message: Strings.errors.fillPassword }]}
								>
									<Input.Password
										value={password}
										onChange={e => this.setState({ password: e.target.value })}
										placeholder={userExists ? Strings.authentication.passwordPlaceholder : Strings.authentication.newPassword}
										prefix={<Icon name="lock m10r" />}
										visibilityToggle
									/>
								</Form.Item>
								{!staff?.isConfirmed && <Form.Item
									name="confirmPassword"
									rules={[{ required: true, message: Strings.errors.fillPassword }]}
								>
									<Input.Password
										value={confirmPassword}
										onChange={e => this.setState({ confirmPassword: e.target.value })}
										placeholder={Strings.authentication.confirmPassword}
										prefix={<Icon name="lock m10r" />}
										visibilityToggle
									/>
								</Form.Item>}
								<Button
									type="primary"
									htmlType="submit"
									className="AcceptInviteButton">
									{Strings.generic.confirm}
								</Button>
							</Form>
						</>
					)}
				</div>
			</div>
		);
	}

	render() {
		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.authentication.confirmAccount}</title>
					<meta name='description' content='Description of AcceptInvite' />
				</Helmet>

				{this.renderForm()}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({
	user: state.user,
});

export default connect(mapStateToProps)(AcceptInvite);
