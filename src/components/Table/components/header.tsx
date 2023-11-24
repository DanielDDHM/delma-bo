import React from 'react';
import { HeaderGroup } from 'react-table';
import { Icon } from 'components';
import { getStyles } from '../utils';

const headerProps = (props: any, { column }: any) =>
	getStyles(props, column.align, column.maxWidth);

interface TableHeader {
	resizable?: boolean;
	sortable?: boolean;
	headerGroups: HeaderGroup<object>[];
	drag?: boolean;
}

export class Header extends React.Component<TableHeader> {
	getHeaderProps = (column: HeaderGroup<object>) => {
		const { sortable } = this.props;
		// @ts-ignore
		const { getSortByToggleProps } = column;

		if (sortable) return getSortByToggleProps(headerProps);
		return headerProps;
	};

	renderSort = (sorting: boolean, sortingDesc: boolean) => {
		// TODO: Validation to show everytime
		const { sortable } = this.props;
		if (!sortable) return null;

		if (!sorting)
			return <Icon name='arrow-up' className='__arrow disabled' />;
		if (sortingDesc)
			return <Icon name='arrow-up' className='__arrow desc' />;

		return <Icon name='arrow-up' className='__arrow' />;
	};

	renderCol = (column: HeaderGroup<object>) => {
		const { resizable, sortable } = this.props;
		// @ts-ignore
		const { getResizerProps, isResizing, id } = column;
		// @ts-ignore
		const { isSorted: sorting, isSortedDesc } = column;

		const resizing = isResizing ? ' isResizing' : '';
		const HProps = this.getHeaderProps(column);

		let alignText = 'left';
		if (column.getHeaderProps(HProps)?.style?.justifyContent === 'center') {
			alignText = 'center';
		} else if (column.getHeaderProps(HProps)?.style?.justifyContent === 'flex-end') {
			alignText = 'right';
		}

		return (
			<div
				{...(column.getHeaderProps(HProps) as {})}
				className='TableHeader'
			>
				<span
					style={{ textAlign: alignText as any, justifyContent: column.getHeaderProps(HProps)?.style?.justifyContent || 'flex-start' }}
					className='TableHeaderTitle'
				>
					{column.render('Header')}
				</span>
				{sortable &&
					id !== 'expander' &&
					this.renderSort(sorting, isSortedDesc)}
				{/* Use column.getResizerProps to hook up the events correctly */}
				{resizable && id !== 'expander' && (
					<div
						{...getResizerProps()}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						className={`resizer${resizing}`}
					>
						<em className='caret __left' />
						<div className='line' />
						<em className='caret __right' />
					</div>
				)}
				{/* {resizable && (
					<div
						// @ts-ignore
						{...getResizerProps()}
						className={`resizer${resizing}`}
					/>
				)} */}
			</div>
		);
	};

	render() {
		const { headerGroups, drag } = this.props;

		const headerStyles: any = { position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 2 };

		if (drag) headerStyles.marginLeft = 13;

		return (
			<div style={headerStyles}>
				{headerGroups.map((group: HeaderGroup<object>) => (
					<div {...(group.getHeaderGroupProps({}) as {})} >
						{group.headers.map(this.renderCol)}
					</div>
				))}
			</div>
		);
	}
}
