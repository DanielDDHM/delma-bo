/* eslint-disable no-restricted-globals */
/*
 *
 * PageDetail
 *
 */

import React from "react";
import { connect } from "react-redux";
import {
	delayedDispatch,
	setBreadcrumb,
	setLoader,
	setTitle,
	updateCrumb,
} from "store/actions";
import { Col, Row, Input, notification } from "antd";
import { Helmet } from "react-helmet";
import { ContentWrapper } from "components";
import AceEditor from 'react-ace';
import { API, Endpoints } from "utils/api";
import Strings from "utils/strings";
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-min-noconflict/ext-searchbox';

import "./styles.scss";
import { translate } from "utils/utils";

export class EmailDetail extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			email: null,
			language: "pt",
			hasUnsavedFields: false,
		};

		this.handleSave = this.handleSave.bind(this);
		this.handleLanguageChange = this.handleLanguageChange.bind(this);
	}

	async componentDidMount() {
		const { dispatch } = this.props;

		const pageName = Boolean(this.state.email?.key) ? ` - ${this.getName(this.state.email?.key)}` : '';
		dispatch(setTitle(Strings.emails.templates + pageName));

		this.getData();

		dispatch(setBreadcrumb(null));
		delayedDispatch(
			setBreadcrumb(() => {
				const { hasUnsavedFields, language } = this.state;

				return {
					locations: [
						{
							text: Strings.sidebar.settings,
							route: "/settings",
							icon: "preferences",
						},
						{
							text: Strings.settings.emailTemplates,
							route: "/settings/email-templates",
							icon: "testimonial",
						},
						{
							text: this.getName(this.state.email?.key),
							icon: "email",
						},
					],
					actions: [
						{
							type: "language",
							value: language,
							onChange: this.handleLanguageChange,
							className: "BreadcrumbLanguage",
							margin: "left",
						},
						{
							type: "button",
							text: Strings.generic.save,
							onClick: this.handleSave,
							disabled: !hasUnsavedFields,
							className: hasUnsavedFields ? "BreadcrumbButtonSuccess" : "",
							separator: "left",
							isSave: true,
						},
					],
				};
			})
		);

		dispatch(setLoader(false));
	}

	componentDidUpdate() {
		const { dispatch } = this.props;

		const pageName = Boolean(this.state.email?.key) ? ` - ${this.getName(this.state.email?.key)}` : '';
		dispatch(setTitle(Strings.emails.templates + pageName));
		dispatch(updateCrumb());
	}

	async getData() {
		const { dispatch, match } = this.props;

		dispatch(setLoader(true));

		try {
			const response = await API.get({
				url: Endpoints.uriEmailTemplate(match?.params?.id),
			});

			if (response.ok) {
				const email = response.data.results.emailTemplate;
				this.setState({ email });
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

	getName = (key: string) => {
		switch (key) {
			case 'GENERAL_EMAIL':
				return Strings.emailTemplates.generalEmail;
			case 'RECOVER_PASSWORD_LINK':
				return Strings.emailTemplates.recoverPasswordLink;
			case 'CONFIRM_ACCOUNT_CODE':
				return Strings.emailTemplates.accountConfirmationCode;
			case 'RECOVER_PASSWORD_CODE':
				return Strings.emailTemplates.recoverPasswordCode;
			case 'CONFIRM_ACCOUNT_LINK':
				return Strings.emailTemplates.accountConfirmationLink;
			case 'RESERVATION_EMAIL':
				return Strings.emailTemplates.reservationEmail;
			case 'CONFIRM_ACCOUNT_STAFF':
				return Strings.emailTemplates.staffAccountConfirmation;
			case 'RECOVER_PASSWORD_STAFF':
				return Strings.emailTemplates.staffRecoverPassword;
			default:
				return key;
		}
	};

	async handleSave(event: any) {
		const { match } = this.props;
		const { email } = this.state;

		if (!translate(email?.subject) || !translate(email?.values)) {
			return notification.warn({
				message: Strings.emails.templates,
				description: Strings.errors.invalidFields,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		const response = await API.put({
			url: Endpoints.uriEmailTemplate(match?.params?.id),
			data: {
				key: email.key,
				subject: email.subject,
				values: email.values,
			},
		});

		if (response.ok) {
			notification.success({
				message: Strings.emails.templates,
				description: Strings.emails.edited,
				placement: 'bottomRight',
				duration: 5,
			});

			this.setState({ hasUnsavedFields: false });
		}
	}

	handleLanguageChange(value: any, options?: any) {
		this.setState({ language: value });
	}

	render() {
		const { email, language, isMobile } = this.state;

		return (
			<ContentWrapper extraStyle={{ padding: 20 }}>
				<Helmet>
					<title>{email?.name}</title>
					<meta name="description" content="Description of Email Detail" />
				</Helmet>
				<Row gutter={[12, 10]}>
					<Col md={24}>
						<label className="InputLabel __marginTop">{Strings.emails.subject}</label>
						<Input
							value={email?.subject?.[language]}
							placeholder={Strings.emails.subject}
							onChange={e => this.setState(({ email: { ...email, subject: { ...this.state.email.subject, [language]: e.target.value } } }))}
						/>
					</Col>
					<Col xs={24} xl={12}>
						<span className="InputLabel --label-required" style={{ height: '40px' }}>
							{Strings.pages.content}
						</span>
						<AceEditor
							key={`html_${language}`}
							mode="html"
							theme="monokai"
							name="email_content"
							onChange={(newValue: any) => {
								this.setState({
									email: {
										...email,
										values: { ...email?.values, [language]: newValue },
									},
									hasUnsavedFields: true,
								})
							}}
							fontSize={14}
							showPrintMargin
							showGutter
							highlightActiveLine
							value={(email?.values && email?.values?.[language]) || ''}
							setOptions={{
								enableBasicAutocompletion: true,
								enableLiveAutocompletion: true,
								enableSnippets: false,
								showLineNumbers: true,
								tabSize: 2,
								useWorker: false,
							}}
						/>
					</Col>
					<Col xs={24} xl={12}>
						<div className="email_preview_options" style={{ height: '40px' }}>
							<span className="InputLabel">
								{Strings.emails.preview}
							</span>
							<div onClick={() => this.setState((state: any) => ({ isMobile: !state.isMobile }))} className={`email_preview_devices${isMobile ? ' active' : ''}`}>
								<em className="moon-responsive" />
							</div>
						</div>
						<div className="email_preview_block">
							<div className={`email_preview${isMobile ? ' preview_mobile' : ''}`}>
								<iframe srcDoc={email?.values?.[language]} title="Email Preview" />
							</div>
						</div>
					</Col>
				</Row>
			</ContentWrapper>
		);
	}
}

const mapStateToProps = (state: any) => ({
	language: state.language,
});

export default connect(mapStateToProps)(EmailDetail);
