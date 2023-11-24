/**
 *
 * Breadcrumb
 *
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Icon } from 'components';
import { DatePicker, Switch, Button, Select, Menu, Dropdown } from 'antd';
import { push } from 'connected-react-router';
import { setUpdater } from 'store/actions';
import { LANGUAGES } from 'utils/utils';
import Strings from 'utils/strings';
import moment from 'moment';
import './styles.scss';

import pt from 'antd/lib/date-picker/locale/pt_PT';
import en from 'antd/lib/date-picker/locale/en_GB';
import es from 'antd/lib/date-picker/locale/es_ES';

const { RangePicker } = DatePicker;
const { Option } = Select;

type SwitchType = {
	switch?: boolean;
	text?: boolean;
};

type OptionType = {
	value: any;
	text: string;
};

export type BreadcrumbType = () => {
	locations?: Array<{
		text: string;
		route?: string;
		icon?: string;
	}>;
	actions?: Array<{
		type: 'switch' | 'datePicker' | 'button' | 'select' | 'language';
		text?: string;
		value?: any;
		onClick?: Function;
		onChange?: Function;
		separator?: 'right' | 'left';
		margin?: 'right' | 'left';
		small?: SwitchType;
		dates?: Array<typeof moment>;
		disabled?: boolean;
		className?: string;
		options?: Array<OptionType>;
		placeholder?: string;
		showArrow?: boolean;
		showSearch?: boolean;
		optionWidth?: boolean | number;
		isSave?: boolean;
		minWidth?: number | string;
	}>;
	hideLocations?: number;
};

const Separator = () => <div className='BreadcrumbSeparator' />;

export class Breadcrumb extends React.Component<
	{ breadcrumb: BreadcrumbType | null } | any
> {
	constructor(props: any) {
		super(props);

		this.state = {
			isMobile: window.innerWidth <= 768,
			hideLocationsSection: false,
			initialLeftSize: null,
			visible: false,
			openKeys: [],
		};

		this.goHome = this.goHome.bind(this);
		props.dispatch(setUpdater(this.reRender.bind(this)));
		this.handleResize = this.handleResize.bind(this);
		window.addEventListener('resize', this.handleResize);
	}

	componentDidMount() {
		this.handleResize();
	}

	UNSAFE_componentWillReceiveProps(nextProps: any) {
		this.handleResize(nextProps);
	}

	/*
	 * TODO:
	 *
	 * Arranjar forma de forçar que a breadcrumb apenas mostre a location case exista espaço ao carregar a mesma.
	 * Ver função handleResize
	 *
	 */

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	goHome() {
		const { router, dispatch } = this.props;

		if (
			router?.pathname !== '/' &&
			router?.pathname !== '/dashboard' &&
			(router?.action !== 'POP' || router?.action !== 'REPLACE')
		) {
			dispatch(push('/'));
		}
	}

	handleResize(props: any = null) {
		let { sidebarOpen, breadcrumb } = this.props;
		if (!breadcrumb && props) breadcrumb = props.breadcrumb

		const { initialLeftSize } = this.state as any;
		const { mobileStyleAt } = typeof breadcrumb === 'function' && breadcrumb();

		const total = window.innerWidth;
		const left = document.getElementById('BreadcrumbLeftContent');
		const right = document.getElementById('BreadcrumbRightContent');
		const extraSpace = sidebarOpen ? 300 : total <= 768 ? 40 : 130;

		if (initialLeftSize == null && left) {
			this.setState({ initialLeftSize: left.offsetWidth });
		}

		let hideLocationsSection = false;
		if (right) {
			const leftSize = initialLeftSize;
			const rightSize = right.offsetWidth;
			const available = total - leftSize - extraSpace;

			if (available < rightSize) {
				hideLocationsSection = true;
			} else {
				hideLocationsSection = false;
			}
		}

		this.setState({ hideLocationsSection, isMobile: total <= 768 || total < mobileStyleAt });
	}

	reRender() {
		this.forceUpdate();
	}

	renderSwitch(action: any, isMobile?: boolean) {
		const {
			value,
			onClick,
			text,
			disabled,
			separator,
			small,
			margin,
		} = action as any;

		if (isMobile) {
			return (
				<div
					key={`switch_key_${text}`}
					className='BreadcrumbMobileAction'
				>
					<span className='BreadcrumbMobileActionText'>{text}</span>
					<Switch
						checked={value}
						size='default'
						onChange={onClick}
						disabled={disabled}
					/>
				</div>
			);
		}

		return (
			<React.Fragment key={`switch_key_${text}`}>
				{(separator === 'left' && <Separator />) || null}
				<div
					className={`BreadcrumbSwitch${margin === 'left'
						? ' m10l'
						: margin === 'right'
							? ' m10r'
							: ''
						}`}
				>
					<span
						className={`BreadcrumbSwitchText${small?.text ? ' __smaller' : ''
							}`}
					>
						{text}
					</span>
					<Switch
						checked={value}
						size={small?.switch ? 'small' : 'default'}
						onChange={onClick}
						disabled={disabled}
					/>
				</div>
				{(separator === 'right' && <Separator />) || null}
			</React.Fragment>
		);
	}

	renderButton(action: any, isMobile?: boolean) {
		const {
			className,
			onClick,
			text,
			disabled,
			margin,
			separator,
			isSave,
		} = action as any;

		if (isSave) {
			return (
				<React.Fragment key={`button_key_${text}`}>
					{(separator === 'left' && <Separator />) || null}
					<div
						className={`BreadcrumbButton${margin === 'left'
							? ' m10l'
							: margin === 'right'
								? ' m10r'
								: ''
							}`}
					>
						<Button
							className={`BreadcrumbSaveButton ${className}`}
							onClick={onClick}
							disabled={disabled}
						>
							<span>{text}</span>
							<Icon name="correct-symbol" />
						</Button>
					</div>
					{(separator === 'right' && <Separator />) || null}
				</React.Fragment>
			);
		}

		return (
			<React.Fragment key={`button_key_${text}`}>
				{(separator === 'left' && <Separator />) || null}
				<div
					className={`BreadcrumbButton${margin === 'left'
						? ' m10l'
						: margin === 'right'
							? ' m10r'
							: ''
						}`}
				>
					<Button
						className={className}
						onClick={onClick}
						disabled={disabled}
					>
						<span>{text}</span>
					</Button>
				</div>
				{(separator === 'right' && <Separator />) || null}
			</React.Fragment>
		);
	}

	renderPrint(action: any, isMobile?: boolean) {
		const { text, onClick, disabled, margin, separator } = action as any;

		if (isMobile) {
			return (
				<div
					key={`print_${text}`}
					className='BreadcrumbMobileAction'
					onClick={() => {
						if (!disabled) {
							onClick();
						}
					}}
				>
					{<span className='BreadcrumbMobileActionText'>{text || Strings.generic.print}</span>}
					<em className="moon-print" />
				</div>
			);
		}

		return (
			<React.Fragment key={`print_${text}`}>
				{(separator === 'left' && <Separator />) || null}
				<div
					onClick={() => {
						if (!disabled) {
							onClick();
						}
					}}
					className={`BreadcrumbPrint${margin === 'left'
						? ' m10l'
						: margin === 'right'
							? ' m10r'
							: ''
						}${disabled ? ' __disabled' : ''}`}
				>
					<em className={`moon-print${!text ? ' __bigger' : ''}`} />
					<span className='BreadcrumbPrintText'>{text}</span>
				</div>
				{(separator === 'right' && <Separator />) || null}
			</React.Fragment>
		);
	}

	renderSelect(action: any, isMobile?: boolean) {
		const {
			onChange,
			text,
			disabled,
			margin,
			separator,
			placeholder,
			value,
			options,
			showArrow,
			showSearch,
			className,
			optionWidth,
			minWidth,
		} = action as any;

		const style = {} as any;
		if (minWidth) {
			style.minWidth = minWidth;
		}

		if (isMobile) {
			return (
				<div key={`select_${text}`} className='BreadcrumbMobileAction'>
					<span className='BreadcrumbMobileActionText'>{text}</span>
					<Select
						className={className}
						disabled={disabled}
						placeholder={placeholder}
						optionFilterProp='children'
						onChange={onChange}
						filterOption={(input: any, option: any) =>
							option.children
								.toLowerCase()
								.indexOf(input.toLowerCase()) >= 0
						}
						defaultValue={value}
						showArrow={showArrow}
						showSearch={showSearch}
						style={style}
						dropdownMatchSelectWidth={
							optionWidth != null ? optionWidth : false
						}
					>
						{options.map((option: any, index: number) => {
							return (
								<Option
									key={`select_option_${option.text}_${index}`}
									value={option.value}
								>
									{option.text}
								</Option>
							);
						})}
					</Select>
				</div>
			);
		}

		return (
			<React.Fragment key={`select_${text}`}>
				{(separator === 'left' && <Separator />) || null}
				<div
					className={`BreadcrumbSelect${margin === 'left'
						? ' m10l'
						: margin === 'right'
							? ' m10r'
							: ''
						}`}
				>
					<span className='BreadcrumbSelectText'>{text}</span>
					<Select
						className={className}
						disabled={disabled}
						placeholder={placeholder}
						optionFilterProp='children'
						onChange={onChange}
						filterOption={(input: any, option: any) =>
							option.children
								.toLowerCase()
								.indexOf(input.toLowerCase()) >= 0
						}
						defaultValue={value}
						showArrow={showArrow}
						showSearch={showSearch}
						style={style}
						dropdownMatchSelectWidth={
							optionWidth != null ? optionWidth : false
						}
					>
						{options.map((option: any, index: number) => {
							return (
								<Option
									key={`select_option_${option.text}_${index}`}
									value={option.value}
								>
									{option.text}
								</Option>
							);
						})}
					</Select>
				</div>
				{(separator === 'right' && <Separator />) || null}
			</React.Fragment>
		);
	}

	renderDatePicker(action: object, isMobile?: boolean) {
		const {
			text,
			onChange,
			dates,
			margin,
			separator,
			className,
			allowClear,
		} = action as any;

		let locale;
		switch (Strings.getLanguage()) {
			case 'pt':
				locale = pt;
				break;
			case 'en':
				locale = en;
				break;
			case 'es':
				locale = es;
				break;
			default:
				locale = pt;
		}

		if (isMobile) {
			return (
				<div
					key={`range_picker_${text}`}
					className='BreadcrumbMobileAction'
				>
					<span className='BreadcrumbMobileActionText'>{text}</span>
					<RangePicker
						ranges={{
							[Strings.ranges.today]: [moment(), moment()],
							[Strings.ranges.thisMonth]: [
								moment().startOf('month'),
								moment().endOf('month'),
							],
							[Strings.ranges.lastMonth]: [
								moment().subtract(1, 'month').startOf('month'),
								moment().subtract(1, 'month').endOf('month'),
							],
							[Strings.ranges.thisYear]: [
								moment().startOf('year'),
								moment().endOf('month'),
							],
							[Strings.ranges.lastYear]: [
								moment().subtract(1, 'year').startOf('year'),
								moment().subtract(1, 'year').endOf('year'),
							],
						}}
						placeholder={[
							Strings.fields.startDate,
							Strings.fields.endDate,
						]}
						allowClear={allowClear || false}
						className='RangePickerMobile'
						defaultValue={dates}
						onChange={onChange}
					/>
				</div>
			);
		}

		return (
			<React.Fragment key={`range_picker_${text}`}>
				{(separator === 'left' && <Separator />) || null}
				<div
					className={`BreadcrumbRangeDatePicker${margin === 'left'
						? ' m10l'
						: margin === 'right'
							? ' m10r'
							: ''
						}`}
				>
					{Boolean(text) && (
						<span className='BreadcrumbPickerText'>{text}:</span>
					)}
					<RangePicker
						locale={locale}
						allowEmpty={[false, false]}
						ranges={{
							[Strings.ranges.today]: [moment(), moment()],
							[Strings.ranges.thisMonth]: [
								moment().startOf('month'),
								moment().endOf('month'),
							],
							[Strings.ranges.lastMonth]: [
								moment().subtract(1, 'month').startOf('month'),
								moment().subtract(1, 'month').endOf('month'),
							],
							[Strings.ranges.thisYear]: [
								moment().startOf('year'),
								moment().endOf('month'),
							],
							[Strings.ranges.lastYear]: [
								moment().subtract(1, 'year').startOf('year'),
								moment().subtract(1, 'year').endOf('year'),
							],
						}}
						placeholder={[
							Strings.fields.startDate,
							Strings.fields.endDate,
						]}
						allowClear={allowClear || false}
						separator={<Icon name="arrow-up" className="__turn90" />}
						className={className}
						defaultValue={dates}
						onChange={onChange}
					/>
				</div>
				{(separator === 'right' && <Separator />) || null}
			</React.Fragment>
		);
	}

	renderLanguage(action: object, isMobile?: boolean) {
		const {
			value,
			disabled,
			className,
			onChange,
			showArrow,
			showSearch,
			optionWidth,
			separator,
		} = action as any;

		if (isMobile) {
			return (
				<div
					key={`language_${value}`}
					className='BreadcrumbMobileAction'
				>
					<span className='BreadcrumbMobileActionText'>
						{Strings.language.header}
					</span>
					<Select
						className={className}
						disabled={disabled}
						optionFilterProp='children'
						onChange={onChange}
						filterOption={(input: any, option: any) =>
							option.children
								.toLowerCase()
								.indexOf(input.toLowerCase()) >= 0
						}
						defaultValue={value}
						showArrow={showArrow}
						showSearch={showSearch}
						dropdownMatchSelectWidth={
							optionWidth != null ? optionWidth : false
						}
					>
						{LANGUAGES.map((lang: any, index: number) => {
							return (
								<Option
									key={`select_option_${lang}_${index}`}
									value={lang.value}
								>
									{lang.label}
								</Option>
							);
						})}
					</Select>
				</div>
			);
		}

		return (
			<React.Fragment key={`language_${value}`}>
				{(separator === 'left' && <Separator />) || null}
				<Select
					className={className}
					disabled={disabled}
					optionFilterProp='children'
					onChange={onChange}
					filterOption={(input: any, option: any) =>
						option.children
							.toLowerCase()
							.indexOf(input.toLowerCase()) >= 0
					}
					defaultValue={value}
					showArrow={showArrow}
					showSearch={showSearch}
					dropdownMatchSelectWidth={
						optionWidth != null ? optionWidth : false
					}
				>
					{LANGUAGES.map((lang: any, index: number) => {
						return (
							<Option
								key={`select_option_${lang}_${index}`}
								value={lang.value}
							>
								{lang.label}
							</Option>
						);
					})}
				</Select>
				{(separator === 'right' && <Separator />) || null}
			</React.Fragment>
		);
	}

	renderLocations(locations: Array<any>) {
		if (!Array.isArray(locations) || !locations.length) return null;

		return locations.map(({ route, text, icon }, index) => (
			<React.Fragment key={`location_key_${text}`}>
				{(index === 0 && <div className='BreadcrumbSeparator' />) ||
					false}
				{Boolean(index) && (
					<div className='BreadcrumbLinkSeparator'>/</div>
				)}
				{route ? (
					<Link
						key={`location_${index}`}
						className={`BreadcrumbLink${!index ? ' __noMargin' : ''}`}
						to={route}
					>
						{(icon && <Icon name={icon} className='m10r' />) || null}
						<span>{text}</span>
					</Link>
				) : (
					<div
						key={`location_${index}`}
						className={`BreadcrumbLink${!index ? ' __noMargin' : ''}`}
					>
						{(icon && <Icon name={icon} className='m10r' />) || null}
						<span>{text}</span>
					</div>
				)}
			</React.Fragment>
		));
	}

	handleMenuClick = (e: any) => { };

	handleVisibleChange = (flag: any) => {
		this.setState({ visible: flag });
	};

	onOpenChange = (openKeys: any) => {
		this.setState({ openKeys });
	};

	renderActions(actions: any) {
		const { isMobile, openKeys, visible } = this.state as any;
		if (!Array.isArray(actions) || !actions.length) return null;

		if (isMobile) {
			const menu = (
				<Menu
					onClick={this.handleMenuClick}
					openKeys={openKeys}
					onOpenChange={this.onOpenChange}
				>
					{actions.map((action) => {
						switch (action.type) {
							case 'datePicker':
								return (
									<Menu.Item key='1'>
										{this.renderDatePicker(action, true)}
									</Menu.Item>
								);
							case 'switch':
								return (
									<Menu.Item key='2'>
										{this.renderSwitch(action, true)}
									</Menu.Item>
								);
							case 'select':
								return (
									<Menu.Item key='3'>
										{this.renderSelect(action, true)}
									</Menu.Item>
								);
							case 'language':
								return (
									<Menu.Item key='4'>
										{this.renderLanguage(action, true)}
									</Menu.Item>
								);
							case 'print':
								return (
									<Menu.Item key='5'>
										{this.renderPrint(action, true)}
									</Menu.Item>
								);
							default:
								return null;
						}
					})}
				</Menu>
			);

			const hasButton = actions.find((action) => action.isSave);

			return (
				<div className='BreadcrumbActions'>
					{(Boolean(actions.filter((action: any) => !action.isSave).length) && (
						<Dropdown
							trigger={['click']}
							overlay={menu}
							placement='bottomRight'
							onVisibleChange={this.handleVisibleChange}
							visible={visible}
						>
							<Button>
								<span className='BreadcrumbMoreActions'>
									<Icon name='dots-vertical' />
								</span>
							</Button>
						</Dropdown>
					)) || null}
					{(hasButton && this.renderButton(
						actions.find((action) => action.type === 'button')
					)) || null}
				</div>
			);
		}

		return (
			<div className='BreadcrumbActions'>
				{actions.map((action) => {
					switch (action.type) {
						case 'datePicker':
							return this.renderDatePicker(action);
						case 'switch':
							return this.renderSwitch(action);
						case 'button':
							return this.renderButton(action);
						case 'select':
							return this.renderSelect(action);
						case 'language':
							return this.renderLanguage(action);
						case 'print':
							return this.renderPrint(action);
						default:
							return null;
					}
				})}
			</div>
		);
	}

	render() {
		const { breadcrumb } = this.props;
		const { hideLocationsSection, isMobile } = this.state as any;

		if (!breadcrumb || typeof breadcrumb !== 'function') {
			return (
				<div className={`BreadcrumbContainer`}>
					<div className='Breadcrumb' />
				</div>
			);
		}

		const { actions, locations } = breadcrumb();

		return (
			<div
				className={`BreadcrumbContainer${Boolean(breadcrumb) ? ' __active' : ''
					}`}
			>
				<div id='BreadcrumbContent' className='Breadcrumb'>
					<div
						id='BreadcrumbLeftContent'
						className='BreadcrumbLeftSection'
					>
						<Link
							className='BreadcrumbLocation'
							style={{ lineHeight: 1.15 }}
							to='/'
						>
							<Icon
								name='house-outline'
								className='BreadcrumbHome'
							/>
						</Link>
						{(!hideLocationsSection &&
							!isMobile &&
							this.renderLocations(locations)) ||
							null}
					</div>
					<div
						id='BreadcrumbRightContent'
						className='BreadcrumbRightSection'
					>
						{this.renderActions(actions)}
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state: any) => ({
	router: state.router,
	breadcrumb: state.breadcrumb,
	updateCrumb: state.updateCrumb,
	language: state.language,
});

export default connect(mapStateToProps)(Breadcrumb);
