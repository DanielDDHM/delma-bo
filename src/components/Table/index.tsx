/**
 *
 * Table
 *
 */

import React from 'react';
import { Column, UseTableInstanceProps } from 'react-table';
import {
	TableComponent,
	MainHeader,
	Body,
	Pagination,
	Actions,
} from './components';
import update from 'immutability-helper';
import Icon from '../Icon';
import './styles.scss';
import strings from 'utils/strings';

export type HOptionsType = {
	type?: string;
	value?: boolean;
	icon: string;
	label?: string;
	tooltip?: string;
	onClick?: () => void;
};

export type ActionsType = {
	view?: (value: any, row: any) => { onClick?: Function; disabled?: boolean };
	edit?: (value: any, row: any) => { onClick?: Function; disabled?: boolean };
	remove?: (
		value: any,
		row: any
	) => { onClick?: Function; disabled?: boolean };
	toggle?: (
		value: any,
		row: any
	) => { onChange?: Function; disabled?: boolean; value?: boolean };
};

export type CustomColumn = {
	align?: 'right' | 'left' | 'center' | undefined;
	Filter?: React.ReactNode;
	filter?: Function;
	// Used to map the input for footer search
	type?: 'number' | 'text' | 'date' | 'image';
};

export type PaginationApi = {
	total: number;
	pageIndex: number;
	pageSize: number;
	setPage: (page: number, size: number) => void;
};

export type FiltrationApi = {
	showGlobalSearch?: boolean;
	showColumnSearch?: boolean;
	defaultValues?: {
		globalSearch?: string,
		columnSearch?: object,
		page?: object,
	};
	onGlobalSearch?: (search: string) => void;
	onColumnSearch?: (search: any) => void;
};

interface TableComponentProps {
	data: Array<any>;
	columns: Array<Column<object> & CustomColumn>;
	title?: string | { icon?: string; title: string };
	smallTitle?: boolean;
	add?: { tooltip?: string; label?: string; onClick: Function } | {};
	paginated?: boolean;
	paginationApi?: PaginationApi;
	filtrationApi?: FiltrationApi;
	expanded?: boolean;
	searchable?: boolean;
	resizable?: boolean;
	sortable?: boolean;
	filterable?: boolean;
	onRowPress?: Function;
	actions?: ActionsType | React.ReactNode;
	headerOptions?: Array<HOptionsType>;
	renderExpanded?: React.ReactNode;
	renderEmpty?: React.ReactNode;
	isSinglePage?: Boolean;
	isSimple?: Boolean;
	onDrag?: Function;
	draggable?: boolean;
	onDragEnd?: Function;
}

const actionsWidth = (actions: ActionsType | React.ReactNode) => {
	if (typeof actions === 'function') return null;

	const { view, edit, remove, toggle } = actions as ActionsType;
	let width = 0;

	if (typeof view === 'function') width += 27;
	if (typeof edit === 'function') width += 27;
	if (typeof remove === 'function') width += 27;
	if (typeof toggle === 'function') width += 50;

	return { minWidth: Math.max(width, 80), maxWidth: width };
};

const stopPropagation = (
	e: React.MouseEvent<HTMLElement, MouseEvent> | undefined
) => {
	e?.stopPropagation();
};

const MainHeaderRef = React.createRef<MainHeader>();

export default class Table extends React.Component<TableComponentProps, any> {
	constructor(props: TableComponentProps) {
		super(props);

		this.renderTable = this.renderTable.bind(this);
		this.renderActions = this.renderActions.bind(this);
		this.renderExpandArrow = this.renderExpandArrow.bind(this);
	}

	get columns() {
		const { columns, expanded, actions } = this.props;
		let cols = columns || [];
		if (expanded) {
			cols.unshift({
				id: 'row_expander',
				Header: () => null,
				width: '100px',
				Cell: this.renderExpandArrow,
			});
		}
		if (actions) {
			cols.push({
				id: 'row_actions',
				Header: strings.generic.actions,
				...actionsWidth(actions),
				align: 'right',
				Cell: this.renderActions,
			});
		}
		return cols;
	}

	get data() {
		// return makeData(5);
		const { data } = this.props;
		if (!Array.isArray(data)) return [];
		return data || [];
	}

	clearSearch() {
		MainHeaderRef.current?.clearSearch();
	}

	renderExpandArrow({ row }: any) {
		return (
			<div onClick={stopPropagation}>
				<span
					{...row.getToggleRowExpandedProps({
						style: {
							// We can even use the row.depth property
							// and paddingLeft to indicate the depth
							// of the row
							paddingLeft: `${row.depth * 2}rem`,
						},
					})}
				>
					<Icon
						name='back'
						className={`expand${row.isExpanded ? ' __expanded' : ''
							}`}
					/>
				</span>
			</div>
		);
	}

	renderActions({ row }: any) {
		const { actions } = this.props;

		// @ts-ignore
		if (typeof actions === 'function') return actions(row);

		return <Actions {...(actions as ActionsType)} value={row} />;
	}

	renderTable({ getTableProps, ...props }: UseTableInstanceProps<object>) {
		const {
			paginated,
			filterable,
			paginationApi,
			filtrationApi,
			expanded,
			onRowPress,
			headerOptions,
			renderExpanded,
			renderEmpty,
			isSinglePage,
			isSimple,
			onDrag,
			data,
			draggable,
			onDragEnd,
		} = this.props;
		// @ts-ignore
		const { headerGroups, setGlobalFilter } = props;
		let hasFiltration = Boolean(filterable);
		if (filtrationApi && !filtrationApi.showColumnSearch)
			hasFiltration = false;

		const dragRow = (dragIndex: number, hoverIndex: number) => {
			const dragRecord = data[dragIndex];
			if (typeof onDrag === 'function')
				onDrag(
					update(data, {
						$splice: [[dragIndex, 1], [hoverIndex, 0, dragRecord]],
					}),
					dragIndex,
					hoverIndex
				);
		};
		return (
			<>
				<div {...(getTableProps() as any)} className='Table' style={{ minWidth: 0 }}>
					<MainHeader
						ref={MainHeaderRef}
						{...this.props}
						headerOptions={headerOptions}
						filtrationApi={filtrationApi}
						setGlobalFilter={setGlobalFilter}
					/>
					<Body
						{...props}
						isSinglePage={isSinglePage}
						isSimple={isSimple}
						paginated={paginated}
						expanded={expanded}
						onRowPress={onRowPress}
						renderEmpty={renderEmpty}
						renderExpanded={renderExpanded}
						filtrationApi={filtrationApi}
						headerGroups={headerGroups}
						hasFiltration={hasFiltration}
						drag={draggable ? dragRow : undefined}
						onDragEnd={draggable ? onDragEnd : undefined}
					/>
					{/* {hasFiltration && (
						<Footer
							{...props}
							filtrationApi={filtrationApi}
							headerGroups={headerGroups}
						/>
					)} */}
					{paginated && (
						<Pagination
							{...props}
							total={this.data.length}
							{...paginationApi}
						/>
					)}
				</div>
			</>
		);
	}

	render() {
		const {
			paginated,
			searchable,
			resizable,
			sortable,
			expanded,
			filterable,
			paginationApi,
			isSinglePage,
			draggable,
			isSimple,
		} = this.props;

		const style = {} as any;
		if (isSinglePage && !isSimple) {
			style.height = 'calc(100% - 10px)';
			style.minHeight = '650px';
		}

		return (
			<div style={style} className={`TableComponent${isSimple ? ' __simpleTable' : ''}`}>
				<TableComponent
					columns={this.columns}
					data={this.data}
					paginated={paginated}
					searchable={searchable}
					resizable={resizable}
					sortable={sortable}
					expanded={expanded}
					filterable={filterable}
					draggable={draggable}
					paginationApi={paginationApi}
				>
					{this.renderTable}
				</TableComponent>
			</div>
		);
	}
}

// @ts-ignore
Table.defaultProps = {
	paginated: true,
};
