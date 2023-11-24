/*
 *
 * Logs
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { setTitle, setBreadcrumb, setLogsFilters, setLoader } from 'store/actions';
import { Helmet } from 'react-helmet';
import ReactJson from 'react-json-view';
import { DateTime } from 'luxon';
import { Modal } from 'antd';
import { Table } from 'components';
import { EditSidebar } from 'components/EditSidebar';
import Strings from 'utils/strings';
import { API, Endpoints } from 'utils/api';
import moment from 'moment';
import './styles.scss';

import { CellProps, Row } from 'react-table';

export class Logs extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			logs: [],

			total: 0,
			page: 0,
			pageSize: 100,

			globalSearch: '',

			selectedLog: null,
			openSidebar: false,

			item: {
				userId: '',
				token: '',
				url: '',
				method: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD'],
				code: [200, 300, 400, 500],
				source: ['app', 'bo'],
				startDate: moment.utc(),
				endDate: moment.utc(),
			},

			appliedFilters: [],

			codes: [200, 300, 400, 500],

			methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD'],
			sources: ['app', 'bo'],
		};

		this.getData = this.getData.bind(this);
		this.onPress = this.onPress.bind(this);
		this.accessorDate = this.accessorDate.bind(this);
		this.renderStatus = this.renderStatus.bind(this);
	}

	componentDidMount() {
		const { dispatch, logsFilters } = this.props;

		dispatch(setTitle(''));
		dispatch(setBreadcrumb(null));

		if (logsFilters) {
			const item = logsFilters;

			item.startDate = !item.startDate ? moment.utc() : moment.utc(item.startDate)
			item.endDate = !item.endDate ? moment.utc() : moment.utc(item.endDate)

			this.setState({ item, page: logsFilters.skip, pageSize: logsFilters.limit }, () => this.getData())
		} else {
			this.getData();
		}
	}

	async getData() {
		const { dispatch, logsFilters } = this.props;
		const { page, pageSize, item } = this.state;

		dispatch(setLoader(true));

		const data = JSON.parse(JSON.stringify(logsFilters || item));
		if (data) {
			if (data.startDate) {
				const startDate = data.startDate;
				data.startDate = DateTime.fromISO(startDate).toFormat('dd/MM/yyyy');
			}

			if (data.endDate) {
				const endDate = data.endDate;
				data.endDate = DateTime.fromISO(endDate).toFormat('dd/MM/yyyy');
			}
			if (data.code) {
				data.code = data.code.map((elem: any) => elem.toString()[0]);
			}

			data.limit = pageSize
			data.skip = page
			data.source = ['bo', 'web']
		}

		const response = await API.post({ url: Endpoints.uriLogs(), data });

		if (response.ok) {
			const { logs, total } = response.data.results;
			this.setState({ logs, total });
		}

		dispatch(setLoader(false));
	}

	get pagination() {
		const { dispatch } = this.props;
		return {
			total: this.state.total,
			pageIndex: this.state.page,
			pageSize: this.state.pageSize,
			setPage: (page: number, size: number) => {
				this.setState({ page, pageSize: size }, () => {
					dispatch(setLogsFilters({ ...this.props.logsFilters, limit: size, skip: page }));
					this.getData();
				});
			},
		};
	}

	get filtration() {
		return {
			showGlobalSearch: false,
			showColumnSearch: false,
			onGlobalSearch: (globalSearch: string) =>
				this.setState({ globalSearch }),
		};
	}

	onPress({ original }: Row<object>) {
		this.setState({ selectedLog: original });
	}

	renderSummary() {
		const { selectedLog } = this.state;
		const { message, meta, source } = selectedLog;

		const date = message.split('[').pop().split(']')[0];
		let status = '500';

		if (meta.error) {
			status = meta.error.status;
		} else if (meta.res && meta.res.statusCode) {
			status = meta.res.statusCode;
		}

		const ipAddress =
			(meta.req.headers && meta.req.headers['x-real-ip']) || '-';
		const origin = (meta.req.headers && meta.req.headers.host) || '-';

		return (
			<div className='DetailsSummary'>
				<span className='Title'>Summary</span>
				<span className='InfoTitle'>Time</span>
				<span className='Info'>{date}</span>
				<span className='InfoTitle'>Method</span>
				<span className='Info'>{meta.req.method}</span>
				<span className='InfoTitle'>URL</span>
				<span className='Info'>{meta.req.originalUrl}</span>
				<span className='InfoTitle'>Status</span>
				<span className='Info'>{status}</span>
				<span className='InfoTitle'>IP Address</span>
				<span className='Info'>{ipAddress}</span>
				<span className='InfoTitle'>Source</span>
				<span className='Info'>{source}</span>
				<span className='InfoTitle'>Origin</span>
				<span className='Info'>{origin}</span>
			</div>
		);
	}

	renderQuery() {
		const { selectedLog } = this.state;
		const { meta } = selectedLog;

		const hasMeta = Boolean(
			meta.req && Object.keys(meta.req.query || {}).length
		);

		if (!hasMeta) {
			return (
				<div className='DetailsSummary'>
					<span className='Title'>Request query params</span>
					<span className='NoInfo'>No query parameters</span>
				</div>
			);
		}

		return (
			<div className='DetailsSummary'>
				<span className='Title'>Request query params</span>
				<ReactJson src={meta.req.query} enableClipboard />
			</div>
		);
	}

	renderBody() {
		const { selectedLog } = this.state;
		const { meta } = selectedLog;

		const hasReq = Boolean(meta && Object.keys(meta.req).length);

		if (!hasReq) {
			return (
				<div className='DetailsSummary'>
					<span className='Title'>Request body</span>
					<span className='NoInfo'>No request body</span>
				</div>
			);
		}

		return (
			<div className='DetailsSummary'>
				<span className='Title'>Request body</span>
				<ReactJson src={meta.req} enableClipboard />
			</div>
		);
	}

	renderResponse() {
		const { selectedLog } = this.state;
		const { meta } = selectedLog;

		const hasRes = Boolean(meta && Object.keys(meta.res).length);

		if (!hasRes) {
			return (
				<div className='DetailsSummary'>
					<span className='Title'>Response</span>
					<span className='NoInfo'>No response</span>
				</div>
			);
		}

		return (
			<div className='DetailsSummary'>
				<span className='Title'>Response</span>
				<ReactJson src={meta.res} enableClipboard />
			</div>
		);
	}

	renderDetails() {
		const { selectedLog } = this.state;
		const { message, description } = selectedLog;

		const date = message.split('[').pop().split(']')[0];

		return (
			<React.Fragment>
				<div className='DetailsHeader'>
					<span>{description}</span>
					<span>{date}</span>
				</div>
				<div className='DetailsBody'>
					{this.renderSummary()}
					{this.renderQuery()}
					{this.renderBody()}
					{this.renderResponse()}
				</div>
			</React.Fragment>
		);
	}

	renderModalDetails() {
		const { logs, selectedLog } = this.state;

		if (!logs.length) return null;

		const visible = Boolean(selectedLog);
		return (
			<Modal
				visible={visible}
				title={null}
				footer={null}
				centered
				width='80vw'
				className='LogDetailModal'
				onCancel={() => this.setState({ selectedLog: null })}
			>
				{visible && this.renderDetails()}
			</Modal>
		);
	}

	renderStatus({ value }: CellProps<object, any>) {
		return (
			<div className={`status __${String(value).charAt(0)}`}>
				<span>{value}</span>
			</div>
		);
	}

	accessorDate({ _created }: any) {
		const date = DateTime.fromISO(_created);
		return date.toFormat('dd/MM/yyyy HH:mm:ss');
	}

	onSubmit = async () => {
		const { item, page, pageSize } = this.state;
		const { dispatch } = this.props;

		const data = JSON.parse(JSON.stringify(item));
		if (data.startDate) {
			const startDate = data.startDate;
			data.startDate = DateTime.fromISO(startDate).toFormat('dd/MM/yyyy');
		}

		if (data.endDate) {
			const endDate = data.endDate;
			data.endDate = DateTime.fromISO(endDate).toFormat('dd/MM/yyyy');
		}

		if (data.code) {
			data.code = data.code.map((elem: any) => elem.toString()[0]);
		}

		data.limit = pageSize
		data.skip = page

		dispatch(setLogsFilters({ ...data, code: item.code, startDate: item.startDate, endDate: item.endDate }));

		const response = await API.post({ url: Endpoints.uriLogs(), data });

		if (response.ok) {
			const { logs, total } = response.data.results;
			this.setState({ logs, total, openSidebar: false });
		}
	}

	onChange = (field: string, value: any) => {
		const { item } = this.state;
		if (field === 'datePicker') {
			this.setState({
				item: {
					...item,
					startDate: value ? value[0] : undefined,
					endDate: value ? value[1] : undefined,
				},
			});
		} else
			this.setState({ item: { ...item, [field]: value } });
	}

	closeSidebar = () => {
		this.setState({ openSidebar: false });
	}

	openSidebar = (value: any = {}) => {
		this.setState((state: any) => ({ openSidebar: true, item: Object.keys(value).length ? JSON.parse(JSON.stringify(value)) : state.item }));
	}

	renderDrawer() {
		const { item, codes, sources, methods } = this.state;
		return (
			<EditSidebar
				title={Strings.fields.selectFilters}
				open={this.state.openSidebar}
				onClose={this.closeSidebar}
				onChange={this.onChange}
				onSubmit={this.onSubmit}
				defaultValue={this.state.item}
				fields={[
					{
						field: 'datePicker',
						value: [item?.startDate, item?.endDate],
						type: 'rangeDatePicker',
						name: Strings.logs.dateRange,
					},
					{
						field: 'user',
						value: item?.user,
						type: 'input',
						name: Strings.logs.userId,
					},
					{
						field: 'url',
						value: item?.url,
						type: 'input',
						name: Strings.logs.url,
					},
					{
						field: 'token',
						value: item?.token,
						type: 'input',
						name: Strings.logs.token,
					},
					{
						field: 'code',
						value: item?.code,
						options: codes,
						type: 'tagsSelector',
						name: Strings.logs.codes,
					},
					{
						field: 'method',
						value: item?.method,
						options: methods,
						type: 'tagsSelector',
						name: Strings.logs.methods,
					},
					{
						field: 'source',
						value: item?.source,
						options: sources,
						type: 'tagsSelector',
						name: Strings.logs.sources,
					}
				]}
			/>
		);
	}

	render() {
		const { logs } = this.state;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.logs}</title>
					<meta name='description' content='Description of Logs' />
				</Helmet>
				<Table
					title={{
						icon: 'duplicate',
						title: 'Logs',
					}}
					headerOptions={[
						{
							icon: 'filter',
							label: 'Filtros',
							onClick: () => this.openSidebar(),
						},
					]}
					data={logs}
					columns={[
						{
							Header: 'Status',
							id: 'code',
							accessor: 'code',
							Cell: this.renderStatus,
							maxWidth: 120,
							type: 'number',
						},
						{
							Header: 'Method',
							id: 'method',
							accessor: (row: any) => row.method,
							maxWidth: 120,
						},
						// {
						// 	Header: 'Version',
						// 	id: 'version',
						// 	accessor: (row: any) => row.method,
						// 	maxWidth: 120,
						// },
						{
							Header: 'Response',
							accessor: 'response',
							maxWidth: 150,
						},
						{ Header: 'Description', accessor: 'description' },
						{
							Header: 'Date',
							accessor: this.accessorDate,
							maxWidth: 150,
						},
					]}
					filterable
					paginationApi={this.pagination}
					filtrationApi={this.filtration}
					onRowPress={this.onPress}
				/>
				{this.renderModalDetails()}
				{this.renderDrawer()}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({
	logsFilters: state.logsFilters,
	language: state.language,
});

export default connect(mapStateToProps)(Logs);
