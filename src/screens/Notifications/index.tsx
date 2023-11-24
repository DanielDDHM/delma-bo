import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { setLoader, setTitle } from 'store/actions';
import { Props, State } from './types';
import { Helmet } from 'react-helmet';
import { Table } from 'components';
import { notification } from 'antd';
import Strings from 'utils/strings';
import { API, Endpoints } from 'utils/api';
import { translate } from 'utils/utils';
import { DateTime } from 'luxon';

class Notifications extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			notifications: [],
		}
	}

	componentDidMount() {
		const { dispatch } = this.props;

		dispatch(setTitle(''));

		this.getData();
	}

	async getData() {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		let response: any;
		try {
			response = await API.get({
				url: Endpoints.uriNotifications(),
			});

			if (response.ok) {
				this.setState({ notifications: response.data.results.scheduleNotification || [] });
			}
		} catch (err) {
			notification.error({
				message: Strings.sidebar.notifications,
				description: response.data?.message || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});

			console.log('Error', err as string);
		}

		dispatch(setLoader(false));
	}

	async deleteNotification(id: string) {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		let response: any;
		try {
			response = await API.delete({
				url: Endpoints.uriNotifications(id),
			});

			if (response.ok) {
				await this.getData();

				notification.success({
					message: Strings.sidebar.notifications,
					description: Strings.notifications.deleted,
					placement: 'bottomRight',
					duration: 5,
				});
			}
		} catch (err) {
			notification.error({
				message: Strings.sidebar.notifications,
				description: response.data?.message || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});

			console.log('Error', err as string);
		}

		dispatch(setLoader(false));
	}

	render() {
		const { notifications } = this.state;
		const { dispatch } = this.props;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.notifications}</title>
					<meta name="description" content="Description of Notifications" />
				</Helmet>
				<Table
					title={{
						icon: "bell1",
						title: Strings.sidebar.notifications
					}}
					data={notifications}
					columns={[
						{
							Header: Strings.fields.name,
							id: 'name',
							accessor: (row: any) => translate(row.title) || '-',
						},
						{
							Header: Strings.notifications.date,
							id: 'scheduleDate',
							accessor: (row: any) => {
								console.log('scheduleDate', row.scheduleDate);
								return (row.scheduleDate && DateTime.fromISO(row.scheduleDate).toFormat('dd/LL/yyyy HH:mm')) || '-';
							}
						},
					]}
					filterable
					add={{
						onClick: () => dispatch(push('/notifications/new')),
					}}
					actions={{
						edit: (original: any) => ({
							onClick: () => dispatch(push(`/notifications/${original._id}`)),
						}),
						remove: (original: any) => ({
							onClick: () => this.deleteNotification(original._id),
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

export default connect(mapStateToProps)(Notifications);