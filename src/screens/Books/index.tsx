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

class Books extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			books: [],
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
				url: Endpoints.uriBooks(),
			});

			if (response.ok) {
				this.setState({ books: response.data.results.books || [] });
			}
		} catch (err) {
			notification.error({
				message: Strings.sidebar.books,
				description: response.data?.message || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});

			console.log('Error', err as string);
		}

		dispatch(setLoader(false));
	}

	async deleteBook(id: string) {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		let response: any;
		try {
			response = await API.delete({
				url: Endpoints.uriBooks(id),
			});

			if (response.ok) {
				await this.getData();

				notification.success({
					message: Strings.sidebar.books,
					description: Strings.books.deleted,
					placement: 'bottomRight',
					duration: 5,
				});
			}
		} catch (err) {
			notification.error({
				message: Strings.sidebar.books,
				description: response.data?.message || Strings.serverErrors.wentWrong,
				placement: 'bottomRight',
				duration: 5,
			});

			console.log('Error', err as string);
		}

		dispatch(setLoader(false));
	}

	async patchBook(album: any) {
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		let response: any;
		try {
			response = await API.patch({
				url: Endpoints.uriBooks(`${album._id}`),
				data: {
					_active: !album._active,
				},
			});

			if (response.ok) {
				await this.getData();

				notification.success({
					message: Strings.sidebar.books,
					description: Strings.books.edited,
					placement: "bottomRight",
					duration: 5,
				});
			}
		} catch (err) {
			notification.error({
				message: Strings.sidebar.books,
				description:
					response.data?.message || Strings.serverErrors.wentWrong,
				placement: "bottomRight",
				duration: 5,
			});

			console.log("Error", err as string);
		}

		dispatch(setLoader(false));
	}

	render() {
		const { books } = this.state;
		const { dispatch } = this.props;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.books}</title>
					<meta name="description" content="Description of Books" />
				</Helmet>
				<Table
					title={{
						icon: "partner",
						title: Strings.sidebar.books
					}}
					data={books}
					columns={[
						{
							Header: Strings.fields.logo,
							id: "photo",
							accessor: (row: any) => row.image,
							type: "image",
							maxWidth: 65,
						},
						{
							Header: Strings.fields.name,
							id: 'name',
							accessor: (row: any) => row.name,
						},
					]}
					filterable
					add={{
						onClick: () => dispatch(push('/books/new')),
					}}
					actions={{
						edit: (original: any) => ({
							onClick: () => dispatch(push(`/books/${original._id}`)),
						}),
						remove: (original: any) => ({
							onClick: () => this.deleteBook(original._id),
						}),
						toggle: (original: any) => ({
							value: original._active,
							onChange: () => this.patchBook(original),
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

export default connect(mapStateToProps)(Books);