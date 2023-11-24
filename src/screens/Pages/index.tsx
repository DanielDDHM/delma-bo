/*
*
* Pages
*
*/

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { delayedDispatch, setBreadcrumb, setLoader, setTitle, updateCrumb } from 'store/actions';
import { Helmet } from 'react-helmet';
import { Table } from 'components';
import { API , Endpoints } from 'utils/api';
import { translate } from 'utils/utils';

import Strings from 'utils/strings';
import { Props } from './types';
import './styles.scss';

export class Pages extends React.Component<Props, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			pages: [],
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
							text: Strings.settings.pages,
							icon: "text-files",
						},
					],
                }
            })
		);

		this.getPages();
	}

    componentDidUpdate() {
		const { dispatch } = this.props;
        dispatch(updateCrumb());
	}

	getPages = async () => {
        const { dispatch } = this.props;

        dispatch(setLoader(true));

		const response = await API.get({
			url: Endpoints.uriPages(),
		});
		
		if (response.ok) {
			const { pages } = response.data.results;
			this.setState({ pages });
		}

        dispatch(setLoader(false));
	}

	render() {
		const { pages = [] } = this.state;
		const { dispatch } = this.props;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.settings.pages}</title>
					<meta name="description" content="Description of Pages" />
				</Helmet>
				<Table
                    title={{
						icon: "text-files",
						title: Strings.settings.pages
					}}
					data={pages}
					columns={[
						{
							Header: Strings.pages.single,
							id: 'name',
							accessor: (row: any) => translate(row.title) || '-',
						},
					]}
					filterable
					actions={{
						edit: (original: any, value: any) =>({
							onClick: () => dispatch(push(`/settings/pages/${original._id}`)),
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

export default connect(mapStateToProps)(Pages);