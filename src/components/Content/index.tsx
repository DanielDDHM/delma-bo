/*
 * Content
 * 
 * Content wrapper for Header and content
 */

import React, { Component } from 'react';
import './styles.scss';

/* eslint-disable react/prefer-stateless-function */
export default class Content extends Component<any, any> {
	render() {
		return (
			<div className="Content" style={this.props.style || {}}>
				{this.props.children}
			</div>
		);
	}
}
