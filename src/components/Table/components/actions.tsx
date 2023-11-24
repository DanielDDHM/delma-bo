import React from 'react';
import { Switch, Popconfirm } from 'antd';
import Icon from '../../Icon';

import { ActionsType } from '..';

const stopPropagation = (
	e: React.MouseEvent<HTMLElement, MouseEvent> | undefined
) => {
	e?.stopPropagation();
};

const stopPropagationOnClick = (onClick: Function, disabled?: boolean) => (
	e: React.MouseEvent<HTMLElement, MouseEvent> | undefined
) => {
	e?.stopPropagation();
	if (typeof onClick === 'function' && !disabled) onClick();
};

const disabledStyle = {
	opacity: 0.5,
	cursor: 'not-allowed',
};

export const View = ({ onClick, disabled }: any) => (
	<div
		className='ActionOption'
		onClick={stopPropagationOnClick(onClick, disabled)}
		style={disabled ? disabledStyle : {}}
	>
		<Icon name='eye' />
	</div>
);

export const Edit = ({ onClick, disabled }: any) => (
	<div
		className='ActionOption'
		onClick={stopPropagationOnClick(onClick, disabled)}
		style={disabled ? disabledStyle : {}}
	>
		<Icon name='pencil-outline' />
	</div>
);

export const Remove = ({ onClick, disabled }: any) => {
	if (disabled) {
		return (
			<div
				className='ActionOption'
				onClick={stopPropagation}
				style={disabledStyle}
			>
				<Icon name='trash' />
			</div>
		);
	}

	return (
		<Popconfirm
			title='Are you sure?'
			okText='Delete'
			cancelText='Cancel'
			okType='danger'
			onConfirm={onClick}
			onCancel={stopPropagation}
		>
			<div className='ActionOption' onClick={stopPropagation}>
				<Icon name='trash' />
			</div>
		</Popconfirm>
	);
};

export const Toggle = ({ value, onChange, disabled }: any) => (
	<div className="ActionSwitch" onClick={stopPropagation} style={disabled ? disabledStyle : {}}>
		<Switch size="small" checked={Boolean(value)} disabled={disabled} onChange={onChange} />
	</div>
);

export class Actions extends React.PureComponent<ActionsType & { value: any }> {
	get hasView() {
		const { view } = this.props;
		return typeof view === 'function';
	}

	get hasEdit() {
		const { edit } = this.props;
		return typeof edit === 'function';
	}

	get hasDelete() {
		const { remove } = this.props;
		return typeof remove === 'function';
	}

	get hasToggle() {
		const { toggle } = this.props;
		return typeof toggle === 'function';
	}

	getEditProps() {
		const { edit, value } = this.props;
		// @ts-ignore
		return edit(value.original, value);
	}

	getViewProps() {
		const { view, value } = this.props;
		// @ts-ignore
		return view(value.original, value);
	}

	getRemoveProps() {
		const { remove, value } = this.props;
		// @ts-ignore
		return remove(value.original, value);
	}

	getToggleProps() {
		const { toggle, value } = this.props;
		// @ts-ignore
		return toggle(value.original, value);
	}

	render() {
		return (
			<React.Fragment>
				{this.hasView && <View {...this.getViewProps()} />}
				{this.hasEdit && <Edit {...this.getEditProps()} />}
				{this.hasDelete && <Remove {...this.getRemoveProps()} />}
				{this.hasToggle && <Toggle {...this.getToggleProps()} />}
			</React.Fragment>
		);
	}
}
