/*
 *
 * Recover Password
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Helmet } from 'react-helmet';
import { Icon } from 'components';
import { Input, Button, Form, notification } from 'antd';
import { setLoader } from 'store/actions';
import { API, Endpoints } from 'utils/api';
import logo from 'assets/images/logo.png';
import Strings from 'utils/strings';
import './styles.scss';

export class RecoverPassword extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			isMobile: window.innerWidth <= 768,
			isDefiningPassword: (props.match.params.id && props.match.params.code) || false,
		};

		this.goToLogin = this.goToLogin.bind(this);
		this.recover = this.recover.bind(this);
		this.failedRecover = this.failedRecover.bind(this);
		this.handleResize = this.handleResize.bind(this);
		window.addEventListener('resize', this.handleResize);
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

	get passwordIsValid() {
		const { password, confirmPassword } = this.state;

		if (password !== confirmPassword) {
			notification.warn({
				message: Strings.authentication.header,
				description: Strings.authentication.noMatchPassword,
				placement: 'bottomRight',
				duration: 5,
			});
			
			return false;
		}

		return true;
	}

	async recover() {
		const { isDefiningPassword, password, email } = this.state;
		const { match, dispatch } = this.props;
		const { params } = match;
		const { id, code } = params;

		let body = {} as any;

		let recoverCode = '';
		if (isDefiningPassword) {
			if (this.passwordIsValid) {
				recoverCode = code;
				body = { _id: id, password }
			}
		} else {
			body = { email }
		}

		dispatch(setLoader(true));

		let response: any;
		try {
			response = await API.post({ url: Endpoints.uriRecoverPassword(recoverCode), data: body });
			if (response.ok) {
				notification.success({
					message: Strings.authentication.header,
					description: Strings.authentication.emailSent,
					placement: 'bottomRight',
					duration: 5,
				});

				dispatch(push('/'));
			}
		} catch (err) {
			console.log('API Request Error', err);
			notification.error({
				message: Strings.authentication.header,
				description: response?.data?.message || err as string,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		dispatch(setLoader(false));
	}

	failedRecover() {
		notification.warn({
			message: Strings.authentication.header,
			description: Strings.errors.pleaseFillFormCorrectly,
			placement: 'bottomRight',
			duration: 5,
		});
	}

	renderForm() {
		const { isMobile, isDefiningPassword } = this.state;

		return (
			<div className={`LoginWrapper${isMobile ? ' __isMobile' : ''}`}>
				<div className='LoginLogo'>
					<img className="Logo" style={{ width: 300 }} alt="Logo" src={logo} />
				</div>
				<div className='LoginContent'>
					<span className="LoginWelcome">{Strings.authentication.recoverPassword}</span>
					<Form name="recover" onFinish={this.recover} onFinishFailed={this.failedRecover}>
						{isDefiningPassword ? (
							<React.Fragment>
								<Form.Item
									name="password"
									rules={[{ required: true, message: Strings.errors.fillPassword }]}
								>
									<Input.Password
										placeholder={Strings.authentication.newPassword}
										prefix={<Icon name="lock m10r" />}
										visibilityToggle
										onChange={e => { this.setState({ password: e.target.value }) }}
									/>
								</Form.Item>
								<Form.Item
									name="confirmPassword"
									rules={[{ required: true, message: Strings.errors.fillPassword }]}
								>
									<Input.Password
										placeholder={Strings.authentication.confirmPassword}
										prefix={<Icon name="lock m10r" />}
										visibilityToggle
										onChange={e => { this.setState({ confirmPassword: e.target.value }) }}
									/>
								</Form.Item>
							</React.Fragment>
						) : (
							<Form.Item
								name="email"
								rules={[
									{ required: true, message: Strings.errors.fillEmail },
								]}
							>
								<Input
									placeholder='your@email.com / username'
									prefix={<Icon name="user2 m10r" />}
									onChange={e => { this.setState({ email: e.target.value }) }}
								/>
							</Form.Item>
						)}
						<a href="/login" onClick={this.goToLogin} className="LoginForgotPassword">{Strings.authentication.rememberedPassword}</a>
						<Button
							type="primary"
							htmlType="submit"
							className="LoginButton">
							{isDefiningPassword ? Strings.authentication.changePassword : Strings.authentication.sendEmail}
						</Button>
					</Form>
				</div>
			</div>
		);
	}

	render() {
		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.authentication.recoverPassword}</title>
					<meta name='description' content='Description of RecoverPassword' />
				</Helmet>
				{this.renderForm()}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({});

export default connect(mapStateToProps)(RecoverPassword);
