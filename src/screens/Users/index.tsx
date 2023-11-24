/*
*
* Users
*
*/

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Props, State } from './types';
import { Helmet } from 'react-helmet';
import { setBreadcrumb, setLoader, setTitle } from 'store/actions';
import { Table } from 'components';
import { notification } from 'antd';

import Strings from 'utils/strings';
import { API, Endpoints } from 'utils/api';
import './styles.scss';

export class Users extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			users: [],
			page: 0,
			pageSize: 100,
			total: 0,
			columnSearch: null,
			globalSearch: '',
		};
	}

	componentDidMount() {
		const { dispatch } = this.props;

		dispatch(setTitle(''));
		dispatch(setBreadcrumb(null));

		this.getData();
	}

	async getData(pause?: boolean) {
		const { page, pageSize, columnSearch, globalSearch } = this.state;
		const { dispatch } = this.props;

		setTimeout(async () => {
			if (columnSearch !== this.state.columnSearch || globalSearch !== this.state.globalSearch) return;
			dispatch(setLoader(true));

			const body = {
				filters: columnSearch ? Object.keys(columnSearch).map(elem => (
					columnSearch[elem] !== '' ? {
						field: elem,
						query: columnSearch[elem],
					} : {}
				)) : [],
				page: page,
				perPage: pageSize,
				search: globalSearch,
			};

			try {
				const response = await API.post({
					url: Endpoints.uriUsers('search'),
					data: body,
				});

				if (response.ok) {
					const { users = [], total = 0 } = response.data.results;
					this.setState({ users, total });
				}
			} catch (err) {
				notification.error({
					message: Strings.serverErrors.title,
					description: err as string,
					placement: 'bottomRight',
					duration: 5,
				});
			}

			dispatch(setLoader(false));
		}, pause ? 1000 : 0)
	}

	get pagination() {
		return {
			total: this.state.total,
			pageIndex: this.state.page,
			pageSize: this.state.pageSize,
			setPage: (page: number, size: number) => {
				this.setState({ page, pageSize: size }, () => this.getData());
			},
		};
	}

	get filtration() {
		const { globalSearch, columnSearch } = this.state;
		return {
			showGlobalSearch: true,
			showColumnSearch: true,
			defaultValues: { globalSearch, columnSearch },
			onGlobalSearch: (globalSearch: string) => {
				this.setState({ globalSearch, page: 0 }, () => this.getData(true));
			},
			onColumnSearch: (columnSearch: string) => {
				this.setState({ columnSearch, page: 0 }, () => this.getData(true));
			},
		};
	}

	render() {
		const { users } = this.state;
		const { dispatch } = this.props;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.users}</title>
					<meta name="description" content="Description of Users" />
				</Helmet>
				<Table
					title={{
						icon: "user2",
						title: Strings.sidebar.users
					}}
					data={users}
					columns={[
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
					]}
					filterable
					paginationApi={this.pagination}
					filtrationApi={this.filtration}
					actions={{
						view: (obj: any) => ({
							onClick: () => dispatch(push(`/users/${obj._id}`)),
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

export default connect(mapStateToProps)(Users);
