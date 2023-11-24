/**
 *
 * ContentWrapper
 *
 */

import React from 'react';
import './styles.scss';

export class ContentWrapper extends React.Component<any, any> {
	render() {
		const { extraStyle, extraClass, children } = this.props;

		return (
			<div style={extraStyle} className={`ContentWrapper${extraClass ? ` ${extraClass}` : ''}`}>
				{children}
			</div>
		);
	}
}

export default ContentWrapper;
