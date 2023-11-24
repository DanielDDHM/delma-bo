import React from 'react';
import { Pagination as PaginationComponent } from 'antd';
import { UsePaginationInstanceProps, UsePaginationState } from 'react-table';
import { PaginationApi } from '..';

interface TablePagination extends UsePaginationInstanceProps<object> {
	api?: PaginationApi;
	state: UsePaginationState<object>;
}

export class Pagination extends React.Component<TablePagination | any> {
	get pageSizeOptions() {
		return ['10', '20', '50', '100'];
	}

	get pageIndex() {
		const { pageIndex, state } = this.props;
		if (!isNaN(pageIndex)) return 1 + pageIndex;
		return 1 + state.pageIndex;
	}

	get pageSize() {
		const { pageSize, state } = this.props;
		if (!isNaN(pageSize)) return pageSize;
		return state.pageSize;
	}

	onChange = (page: number, pageSize?: number) => {
		const { gotoPage, setPageSize, setPage } = this.props;
		gotoPage(page - 1);
		if (pageSize) setPageSize(pageSize);

		if (typeof setPage === 'function') setPage(page - 1, pageSize);
	};

	render() {
		const { total } = this.props;

		return (
			<PaginationComponent
				total={total}
				current={this.pageIndex}
				pageSize={this.pageSize}
				showSizeChanger
				showQuickJumper
				onChange={this.onChange}
				pageSizeOptions={this.pageSizeOptions}
				className='TablePagination'
			/>
		);
	}
}
