/**
 *
 * Collapse
 *
 */

import React, { Component } from 'react';
import './styles.scss';

/* eslint-disable react/prefer-stateless-function */
class Collapse extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			expandedStyle: {
				height: 0,
				padding: 0,
				margin: 0,
			},
		};
	}

	componentDidMount() {
		if (this.props.expanded) {
			this.setState({
				expandedStyle: {

					// @ts-ignore
					height: this.expandableContent.scrollHeight,
					padding: null,
					margin: null,
				},
			});
		} else {
			this.setState({
				expandedStyle: {
					height: 0,
					padding: 0,
					margin: 0,
				},
			});
		}
	}

	UNSAFE_componentWillReceiveProps(props: any) {
		if (props.expanded) {
			this.setState({
				expandedStyle: {
					// @ts-ignore
					height: this.expandableContent.scrollHeight,
					padding: null,
					margin: null,
				},
			});
		} else {
			this.setState({
				expandedStyle: {
					height: 0,
					padding: 0,
					margin: 0,
				},
			});
		}
	}

	render() {
		const { children, expandedChildren, style, expandedStyle: extraStyle } = this.props;
		const { expandedStyle } = this.state;
		return (
			<div style={{ position: 'relative' }}>
				<div className="CollapseContainer" style={style}>
					{children}
				</div>
				<div className="CollapsedBlock" style={{ ...extraStyle, ...expandedStyle }}>
					<div
						// @ts-ignore
						ref={ref => this.expandableContent = ref}
					>
						{expandedChildren}
					</div>
				</div>
			</div>
		);
	}
}

export default Collapse;
