import { Button, Tooltip, Input, Switch } from 'antd';
import Icon from 'components/Icon';
import React from 'react';
import { FiltrationApi, HOptionsType } from '..';

interface TableMainHeader {
	title: string | { title: string; icon?: string };
	smallTitle?: boolean;
	headerOptions?: Array<HOptionsType>;
	filterable?: boolean;
	filtrationApi?: FiltrationApi;
}

export class MainHeader extends React.Component<TableMainHeader | any, any> {
	searchTimeout?: NodeJS.Timeout;

	constructor(props: any) {
		super(props);

		this.state = {
			search: '',
			size: window.innerWidth,
		};

		this.onSearch = this.onSearch.bind(this);
	}

	componentDidMount() {
		window.onresize = () => {
			const size = window.innerWidth;

			if (size !== this.state.size) {
				this.setState({ size });
				this.forceUpdate();
			}
		};
	}

	UNSAFE_componentWillReceiveProps() {
		const { filtrationApi } = this.props;

		if (filtrationApi?.defaultValues)
			this.setState({ search: filtrationApi.defaultValues.globalSearch || '' });
	}

	clearSearch() {
		const { setGlobalFilter, filtrationApi } = this.props;

		if (!filtrationApi) setGlobalFilter('');

		this.setState({ search: '' });
	}

	onSearch(e: React.ChangeEvent<HTMLInputElement>) {
		const { setGlobalFilter, filtrationApi } = this.props;
		const { value } = e.target;

		this.setState({ search: value });

		if (!filtrationApi) {
			setGlobalFilter(value);
			return;
		}

		if (typeof filtrationApi.onGlobalSearch !== 'function') return;

		if (this.searchTimeout) clearTimeout(this.searchTimeout);
		this.searchTimeout = setTimeout(() => {
			filtrationApi.onGlobalSearch(value);
		}, 500);
	}

	renderIcon() {
		const { title, smallTitle } = this.props;

		if (typeof title !== 'object' || !title.icon) return null;

		return <Icon name={title.icon} className={`MainHeaderIcon${smallTitle ? ' --smaller' : ''}`} />;
	}

	renderTitle() {
		const { title, smallTitle } = this.props;

		if (typeof title === 'string')
			return <span className={`MainHeaderTitle${smallTitle ? ' --smaller' : ''}`}>{title}</span>;

		if (typeof title === 'object')
			return <span className={`MainHeaderTitle${smallTitle ? ' --smaller' : ''}`}>{title.title}</span>;

		return <span className='MainHeaderTitle' />;
	}

	renderSearch() {
		const { filterable, filtrationApi } = this.props;
		if (!filterable || (filtrationApi && !filtrationApi.showGlobalSearch))
			return null;

		return (
			<Input
				value={this.state.search}
				className='MainHeaderSearch'
				placeholder='Search'
				onChange={this.onSearch}
			/>
		);
	}

	renderAdd() {
		const { add } = this.props;

		if (typeof add !== 'object' || typeof add.onClick !== 'function')
			return null;

		const { tooltip, onClick, label } = add;

		if (!tooltip) {
			return (
				<Button className='MainHeaderAddButton' onClick={onClick}>
					<Icon name='plus' />
					{Boolean(label) && this.state.size > 545 && <span>{label}</span>}
				</Button>
			);
		}

		return (
			<Tooltip title={tooltip}>
				<Button className='MainHeaderAddButton' onClick={onClick}>
					<Icon name='plus' />
					{Boolean(label) && this.state.size > 545 && <span>{label}</span>}
				</Button>
			</Tooltip>
		);
	}

	renderOptions() {
		const { headerOptions } = this.props;

		if (!Array.isArray(headerOptions)) return null;

		return headerOptions.map((value: HOptionsType) => {
			const { type, value: switchValue, icon, label, tooltip, onClick } = value;

			if (type === 'switch') {
				return (
					<div key={`switch_key_${label}`} className="TableSwitch">
						<span className="TableSwitchLabel">
							{label}
						</span>
						<Switch
							checked={switchValue}
							size="small"
							onChange={onClick}
						/>
					</div>
				);
			}

			if (tooltip) {
				return (
					<Tooltip
						key={`header_option_${JSON.stringify(value)}`}
						title={tooltip}
						overlayClassName='MainHeaderOptionTooltip'
					>
						<div
							className='MainHeaderOption'
							onClick={onClick}>
							<Icon name={icon} className='icon' />
							{Boolean(label) && <span>{label}</span>}
						</div>
					</Tooltip>
				);
			}

			return (
				<div
					key={`header_option_${JSON.stringify(value)}`}
					className='MainHeaderOption'
					onClick={onClick}
				>
					<Icon name={icon} className='icon' />
					{Boolean(label) && <span>{label}</span>}
				</div>
			);
		});
	}

	render() {
		const { headerOptions, title, add, filterable, setGlobalFilter } = this.props;

		if (!headerOptions && !title && !add && !filterable && !setGlobalFilter) return null;

		return (
			<div className='TableMainHeader'>
				{this.renderIcon()}
				{this.renderTitle()}
				{this.renderOptions()}
				{this.renderSearch()}
				{this.renderAdd()}
			</div>
		);
	}
}
