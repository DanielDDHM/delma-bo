/*
 * Content
 * 
 * Content wrapper
 */

import React, { Component } from 'react';
import './styles.scss';

/* eslint-disable react/prefer-stateless-function */
export default class RouteContent extends Component<any, any> {
	render() {
		return (
			<div id="app_content" className="RouteWrapper" style={this.props.style || {}}>
				{this.props.children}
			</div>
		);
	}
}
