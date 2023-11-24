import React from 'react';
import {
	useTable,
	useFlexLayout,
	usePagination,
	useGlobalFilter,
	useResizeColumns,
	useExpanded,
	useSortBy,
	useFilters,
	TableOptions,
	TableInstance,
} from 'react-table';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PaginationApi } from '../index';

interface Table extends TableOptions<object> {
	children: (props: TableInstance<object>) => React.ReactNode;
	expanded?: boolean;
	searchable?: boolean;
	paginated?: boolean;
	resizable?: boolean;
	sortable?: boolean;
	filterable?: boolean;
	draggable?: boolean;
	paginationApi?: PaginationApi;
}

export const TableComponent = (props: Table) => {
	const {
		children,
		expanded,
		paginated,
		paginationApi,
		searchable,
		resizable,
		sortable,
		filterable,
		draggable,
		...tableProps
	} = props;
	const plugins = [];
	if (searchable) plugins.push(useGlobalFilter);
	if (filterable) plugins.push(useFilters);
	if (filterable) plugins.push(useGlobalFilter);
	if (sortable) plugins.push(useSortBy);
	if (expanded) plugins.push(useExpanded);
	if (paginated) plugins.push(usePagination);
	if (resizable) plugins.push(useResizeColumns);

	const defaultColumn = React.useMemo(
		() => ({
			// When using the useFlexLayout:
			minWidth: 30, // minWidth is only used as a limit for resizing
			width: 100, // width is used for both the flex-basis and flex-grow
			// maxWidth: 250, // maxWidth is only used as a limit for resizing
		}),
		[]
	);

	const initialState = {
		...paginationApi,
	} as any;

	const childrenProps = useTable(
		{
			...tableProps,
			defaultColumn,
			initialState,
			// @ts-ignore
			manualPagination: Boolean(paginationApi),
		},
		useFlexLayout,
		...plugins
	);

	if (!draggable) return <>{children(childrenProps)}</>;

	//@ts-ignore
	return <DndProvider backend={HTML5Backend}>{children(childrenProps)}</DndProvider>;
};
