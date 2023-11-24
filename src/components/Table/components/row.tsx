/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { useDrag, useDrop } from 'react-dnd';
import { RowPropGetter, TableRowProps, Cell } from "react-table";
import Collapse from "../../Collapse";
import Modal from "react-modal";
import Icon from "../../Icon";
import { getStyles } from "../utils";
import imagePlaceholder from "assets/images/placeholders/image.jpg";
const DND_ITEM_TYPE = 'row';

const cellProps = (props: any, { cell }: any) =>
	getStyles(props, cell.column.align, cell.column.maxWidth);

export interface TableRow {
	id: string;
	getRowProps: (propGetter?: RowPropGetter<object>) => TableRowProps;
	cells: Cell<object>[];
	expandable?: boolean;
	isExpanded?: boolean;
	onPress?: Function;
	renderExpanded?: React.ReactNode;
	drag?: Function;
	onDragEnd?: Function;
	preventDrag?: object;
	index?: number;
}

const cellKey = (cell: Cell<object>) =>
	`table_cell_${cell.column.id}_${cell.row.id}_${JSON.stringify(cell.value)}`;

const RowItem = ({ children, ...props }: any) => {
	const { index, drag: moveRow } = props;
	const dropRef = React.useRef<any>(null);
	const dragRef = React.useRef(null);

	const [, drop] = useDrop({
		accept: DND_ITEM_TYPE,
		hover(item: any, monitor: any) {
			if (!dropRef.current) {
				return;
			}
			const dragIndex = item.index;
			const hoverIndex = index;
			// Don't replace items with themselves
			if (dragIndex === hoverIndex) {
				return;
			}
			// Determine rectangle on screen
			const hoverBoundingRect = dropRef.current?.getBoundingClientRect();
			// Get vertical middle
			const hoverMiddleY =
				(hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
			// Determine mouse position
			const clientOffset = monitor.getClientOffset();
			// Get pixels to the top
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;
			// Only perform the move when the mouse has crossed half of the items height
			// When dragging downwards, only move when the cursor is below 50%
			// When dragging upwards, only move when the cursor is above 50%
			// Dragging downwards
			if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
				return;
			}
			// Dragging upwards
			if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
				return;
			}
			// Time to actually perform the action
			moveRow(dragIndex, hoverIndex);
			// Note: we're mutating the monitor item here!
			// Generally it's better to avoid mutations,
			// but it's good here for the sake of performance
			// to avoid expensive index searches.
			item.index = hoverIndex;
		},
	});

	const [{ isDragging }, drag, preview] = useDrag({
		item: { type: DND_ITEM_TYPE, index },
		type: DND_ITEM_TYPE,
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const opacity = isDragging ? 0 : 1;
	const cursor = isDragging ? 'grabbing' : 'grab';
	preview(drop(dropRef));
	drag(dragRef);

	delete props.drag;

	return (
		<div ref={dropRef} {...props} style={{ ...props.style, opacity, position: 'relative', alignItems: 'center' }}>
			<div ref={dragRef} style={{ position: 'relative', cursor, zIndex: 30 }}>
				<Icon className="TableDrag" name="drag" />
			</div>
			{children}
		</div>
	);
};
export class Row extends React.Component<TableRow, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			imageOver: false,
			imageOpened: false,
			isDragging: false,
			pos: null,
		};
	}

	onPress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const { onPress, ...props } = this.props;
		if (typeof onPress === "function") onPress(props, e);
	};

	handleImageHover(e: any, value: any) {
		const { imageOver } = this.state;
		if (imageOver) {
			this.setState({ imageOver: null });
		} else {
			this.setState({
				imageOver: value,
				pos: { x: e.clientX + 15, y: e.clientY + 15 },
			});
		}
	}

	renderImagePopOver() {
		const { imageOver, pos } = this.state;
		if (!imageOver || !pos) return null;

		// const { borderRadius, productSize } = settings.design.overall;

		return (
			<div
				className="mouseOverImage"
				style={{
					backgroundImage: `url(${imageOver})`,
					backgroundRepeat: 'no-repeat',
					backgroundColor: '#fff',
					left: pos.x,
					top: pos.y,
					width: 200,
					height: 200,
					borderRadius: 1,
				}}
			/>
		);
	}

	renderImageModal() {
		const { imageOpened } = this.state;

		return (
			<Modal
				isOpen={imageOpened}
				onRequestClose={() => {
					this.setState({ imageOpened: false });
				}}
				style={{
					content: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						padding: 0,
						background: "transparent",
						border: "none",
						borderRadius: "10px",
					},
					overlay: {
						zIndex: 999,
						backgroundColor: "rgba(0,0,0,0.5)",
					},
				}}
			// contentLabel="Modal"
			>
				<div
					className="Modal"
					style={{
						backgroundImage: `url(${imageOpened})`,
						border: "10px solid transparent",
						backgroundSize: "contain",
						backgroundPosition: "center center",
						backgroundRepeat: "no-repeat",
					}}
				/>
			</Modal>
		);
	}

	renderCell = (cell: any) => {
		const { imageOver } = this.state;

		const imageStyles = {
			backgroundImage: `url(${cell.value || imagePlaceholder})`,
			height: "40px",
			width: "40px",
			borderRadius: "1",
		} as any;
		if (!cell.value) imageStyles.cursor = "auto";

		return (
			<div
				{...(cell.getCellProps(cellProps) as {})}
				key={cellKey(cell)}
				className={`TableData${(cell.column as any).type === "image" ? ' __image' : ''}`}
			>
				{cell.column.id !== "actions" && typeof cell.value === "boolean" ? (
					cell.value ? (
						<Icon name="correct-symbol" />
					) : (
						<Icon name="close" />
					)
				) : (cell.column as any).type === "image" ? (
					<div
						className="hasImage"
						style={imageStyles}
						onMouseOver={(e) => {
							if (!imageOver) this.handleImageHover(e, cell.value);
						}}
						onMouseLeave={(e) => {
							if (imageOver) this.handleImageHover(e, cell.value);
						}}
						onClick={() => {
							this.setState({ imageOpened: cell.value });
						}}
					/>
				) : cell.column?.id === "row_actions" ? (
					cell.render("Cell")
				) : (
					<span style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: cell.column.align || 'left' }}>{cell.render("Cell")}</span>
				)}
			</div>
		);
	};

	renderExpanded() {
		const { expandable, isExpanded, renderExpanded } = this.props;

		if (!expandable || typeof renderExpanded !== "function") return;

		return (
			<Collapse
				expandedChildren={renderExpanded(this.props)}
				expanded={isExpanded}
			/>
		);
	}

	render() {
		const { drag, onDragEnd, index, getRowProps, cells, onPress, isExpanded } = this.props;
		const hasOnPress = typeof onPress === "function";
		const hasDraggable = typeof drag === 'function';

		if (hasDraggable) {
			return (
				<>
					<RowItem {...getRowProps()} index={index} drag={drag} onDragEnd={onDragEnd} className="TableRow">
						{cells.map(this.renderCell)}
					</RowItem>
					{isExpanded && this.renderExpanded()}
					{this.renderImagePopOver()}
					{this.renderImageModal()}
				</>
			);
		}

		return (
			<React.Fragment>
				<div
					{...(getRowProps() as {})}
					className={`TableRow${hasOnPress ? " __clickable" : ""}${isExpanded ? " __expanded" : ""}`}
					onClick={this.onPress}
				>
					{cells.map(this.renderCell)}
				</div>
				{this.renderExpanded()}
				{this.renderImagePopOver()}
				{this.renderImageModal()}
			</React.Fragment>
		);
	}
}
