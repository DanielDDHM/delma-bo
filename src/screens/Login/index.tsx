/*
 *
 * Login
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Helmet } from 'react-helmet';
import { Icon } from 'components';
import Strings from 'utils/strings';
import { Input, Button, Form, notification } from 'antd';
import { setLoader, setUser, setToken } from 'store/actions';
import { API, Endpoints } from 'utils/api';
import logo from 'assets/images/logo.png';
import './styles.scss';

export class Login extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			isMobile: window.innerWidth <= 768,
		};

		this.goToRegister = this.goToRegister.bind(this);
		this.login = this.login.bind(this);
		this.failedLogin = this.failedLogin.bind(this);
		this.handleResize = this.handleResize.bind(this);
		window.addEventListener('resize', this.handleResize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize() {
		this.setState({ isMobile: window.innerWidth <= 768 });
	}

	goToRegister(e: any) {
		const { dispatch } = this.props;

		e.preventDefault();
		dispatch(push('/recover-password'));
	}

	async login() {
		const { dispatch } = this.props;
		const { email, password } = this.state;
		const body = {
			email,
			password,
		};

		dispatch(setLoader(true));

		try {
			const response = await API.post({ url: Endpoints.uriLogin(), data: body });
			if (response.ok) {
				const { user, token } = response.data.results;
				dispatch(setUser({ ...user }));
				dispatch(setToken(token));
			}
		} catch (err) {
			console.log('API Request Error', err);
		}

		dispatch(setLoader(false));
	}

	failedLogin() {
		notification.error({
			message: Strings.errors.invalidFields,
			description: Strings.errors.pleaseFillFormCorrectly,
			placement: 'bottomRight',
			duration: 5,
		});
	}

	renderForm() {
		const { isMobile } = this.state;

		return (
			<div className={`LoginWrapper${isMobile ? ' __isMobile' : ''}`}>
				<div className='LoginLogo'>
					<img style={{ width: 300 }} src={logo} alt="Login Logo" />
				</div>
				<div className='LoginContent'>
					<span className="LoginWelcome">{Strings.authentication.welcome}</span>
					<Form name="login" onFinish={this.login} onFinishFailed={this.failedLogin}>
						<Form.Item
							name="email"
							rules={[
								{ required: true, message: Strings.errors.fillEmail },
								{ type: 'email', message: Strings.errors.emailIsInvalid },
							]}
						>
							<Input
								placeholder='your@email.com'
								prefix={<Icon name="user2 m10r" />}
								onChange={e => this.setState({ email: e.target.value })}
							/>
						</Form.Item>
						<Form.Item
							name="password"
							rules={[{ required: true, message: Strings.errors.fillPassword }]}
						>
							<Input.Password
								placeholder='password'
								prefix={<Icon name="lock m10r" />}
								visibilityToggle
								onChange={e => this.setState({ password: e.target.value })}
							/>
						</Form.Item>
						<a href="/register" onClick={this.goToRegister} className="LoginForgotPassword">{Strings.authentication.forgotPassword}</a>
						<Button
							type="primary"
							htmlType="submit"
							className="LoginButton">
							{Strings.authentication.login}
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
					<title>{Strings.authentication.login}</title>
					<meta name='description' content='Description of Login' />
				</Helmet>
				{this.renderForm()}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({});

export default connect(mapStateToProps)(Login);
