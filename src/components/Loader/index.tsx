/**
 *
 * Loader
 *
 */

import React from 'react';
import { connect } from "react-redux";
import { MagicSpinner } from 'react-spinners-kit';
// @ts-ignore
import variables from "styles/variables.scss";
import './styles.scss';

export class Loader extends React.Component<any, any> {
	render() {
		const { loader } = this.props;

		return (
			<div style={{ opacity: loader ? 1 : 0 }} className="Loader">
				<MagicSpinner color={variables.secondaryColor} size={120} />
			</div>
		);
	}
}

const mapStateToProps = (state: any) => ({
	loader: state.loader,
});

export default connect(mapStateToProps)(Loader);