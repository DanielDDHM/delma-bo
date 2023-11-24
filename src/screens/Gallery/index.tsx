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

class Gallery extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			library: [],
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
				url: Endpoints.uriLibrary(),
			});

			if (response.ok) {
				this.setState({ library: response.data.results.library || [] });
			}
		} catch (err) {
			notification.error({
				message: Strings.sidebar.gallery,
				description: response.data?.message || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});

			console.log('Error', err as string);
		}

		dispatch(setLoader(false));
	}

	async deleteLibrary(id: string) {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		let response: any;
		try {
			response = await API.delete({
				url: Endpoints.uriLibrary(id),
			});

			if (response.ok) {
				await this.getData();

				notification.success({
					message: Strings.sidebar.gallery,
					description: Strings.gallery.deleted,
					placement: 'bottomRight',
					duration: 5,
				});
			}
		} catch (err) {
			notification.error({
				message: Strings.sidebar.gallery,
				description: response.data?.message || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});

			console.log('Error', err as string);
		}

		dispatch(setLoader(false));
	}

	render() {
		const { library } = this.state;
		const { dispatch } = this.props;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.gallery}</title>
					<meta name="description" content="Description of Gallery" />
				</Helmet>
				<Table
					title={{
						icon: "partner",
						title: Strings.sidebar.gallery
					}}
					data={library}
					columns={[
						{
							Header: Strings.fields.name,
							id: 'name',
							accessor: (row: any) => translate(row.name),
						},
					]}
					filterable
					add={{
						onClick: () => dispatch(push('/library/new')),
					}}
					actions={{
						edit: (original: any) => ({
							onClick: () => dispatch(push(`/library/${original._id}`)),
						}),
						remove: (original: any) => ({
							onClick: () => this.deleteLibrary(original._id),
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

export default connect(mapStateToProps)(Gallery);