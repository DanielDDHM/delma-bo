/*
*
* EmailTemplates
*
*/

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { setTitle, delayedDispatch, setBreadcrumb, updateCrumb, setLoader } from 'store/actions';
import { Helmet } from 'react-helmet';
import { Table } from 'components';
import { notification } from 'antd';
import { API, Endpoints } from 'utils/api';
import Strings from 'utils/strings';
import { Props } from './types';
import './styles.scss';

export class EmailTemplates extends React.Component<Props, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			templates: [],
		};
	}

	componentDidMount() {
		const { dispatch } = this.props;

		dispatch(setTitle(''));

		dispatch(setBreadcrumb(null));
		delayedDispatch(
			setBreadcrumb(() => {
				return {
					locations: [
						{
							text: Strings.sidebar.settings,
							route: '/settings',
							icon: "preferences",
						},
						{
							text: Strings.settings.emailTemplates,
							icon: "email",
						},
					],
				}
			})
		);

		this.getEmails();
	}

	componentDidUpdate() {
		const { dispatch } = this.props;
		dispatch(updateCrumb());
	}

	async getEmails() {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		const response = await API.get({
			url: Endpoints.uriEmailTemplate(),
		});

		if (response.ok) {
			this.setState({ templates: response.data.results.emailTemplate });
		} else {
			notification.error({
				message: Strings.serverErrors.title,
				description: response.data?.message || Strings.serverErrors.wentWrong,
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

	render() {
		const { templates = [] } = this.state;
		const { dispatch } = this.props;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.settings.emailTemplates}</title>
					<meta name="description" content="Description of Email Templates" />
				</Helmet>
				<Table
					title={{
						icon: "email",
						title: Strings.emails.templates
					}}
					data={templates}
					columns={[
						{
							Header: Strings.templates.single,
							id: 'name',
							accessor: (row: any) => this.getName(row.key) || '-',
						},
					]}
					filterable
					actions={{
						edit: (original, value) => ({
							onClick: () => dispatch(push('email-templates/' + original._id)),
						}),
					}}
				/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({
	language: state.language,
});

export default connect(mapStateToProps)(EmailTemplates);