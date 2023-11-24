/*
*
* Settings
*
*/

import React from 'react';
import { connect } from 'react-redux';
import { setTitle, setBreadcrumb } from 'store/actions';
import { push } from 'connected-react-router';
import { Helmet } from 'react-helmet';
import { Row, Col } from 'antd';
import { Icon, ContentWrapper } from 'components';

import Strings from 'utils/strings';
import './styles.scss';

export class Settings extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		const { dispatch } = this.props;

		dispatch(setTitle(Strings.sidebar.settings));
		dispatch(setBreadcrumb(null));
	}

	componentDidUpdate() {
		const { dispatch } = this.props;

		dispatch(setTitle(Strings.sidebar.settings));
	}

	goTo(url: string) {
		const { dispatch } = this.props;

		dispatch(push(url));
	}

	renderOptions() {
		const options = [
			{
				icon: 'text-files',
				url: 'settings/pages',
				title: Strings.settings.pages,
				subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac vulputate velit, ac consequat risus. In id ultricies libero. Quisque quis purus sit amet nunc mollis mattis.',
			},
			{
				icon: 'email',
				url: 'settings/email-templates',
				title: Strings.settings.emailTemplates,
				subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac vulputate velit, ac consequat risus. In id ultricies libero. Quisque quis purus sit amet nunc mollis mattis.',
			},
		];

		return options.map(option => (
			<Col key={option.title} xs={24} lg={12} xl={8}>
				<ContentWrapper extraClass="SettingsCards">
					<div className="SettingsOptionBlock" onClick={() => this.goTo(option.url)}>
						<div className="SettingsIcon">
							<Icon name={option.icon} />
						</div>
						<div className="SettingsOptionText">
							<div className="SettingsOptionTitles">
								<span className="SettingsOptionTitle">
									{option.title}
								</span>
								<span className="SettingsOptionSubTitle">
									{option.subtitle}
								</span>
							</div>
							<div className="SettingsOptionNavigate">
								<span>
									{Strings.formatString(Strings.generic.clickHereTo, Strings.generic.edit.toLowerCase())}
								</span>
							</div>
						</div>
					</div>
				</ContentWrapper>
			</Col>
		));
	}

	renderIcon() {
		const { clicked } = this.state;

		return (
			<div onClick={() => this.setState((state: any) => ({ clicked: !state.clicked }))} className={`__animated${clicked ? ' __animation' : ''}`}>
				<em className="moon-shapes" />
				<div className={`hearts ${clicked ? '__clicked anim1' : ''}`}>
					<em className="moon-shapes" />
				</div>
				<div className={`hearts ${clicked ? '__clicked anim2' : ''}`}>
					<em className="moon-shapes" />
				</div>
				<div className={`hearts ${clicked ? '__clicked anim3' : ''}`}>
					<em className="moon-shapes" />
				</div>
				<div className={`hearts ${clicked ? '__clicked anim4' : ''}`}>
					<em className="moon-shapes" />
				</div>
				<div className={`hearts ${clicked ? '__clicked anim5' : ''}`}>
					<em className="moon-shapes" />
				</div>
				<div className={`hearts ${clicked ? '__clicked anim6' : ''}`}>
					<em className="moon-shapes" />
				</div>
				<div className={`hearts ${clicked ? '__clicked anim7' : ''}`}>
					<em className="moon-shapes" />
				</div>
				<div className={`hearts ${clicked ? '__clicked anim8' : ''}`}>
					<em className="moon-shapes" />
				</div>
			</div>
		);
	}

	render() {
		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.settings}</title>
					<meta name="description" content="Description of Settings" />
				</Helmet>
				<Row gutter={[25, 25]}>
					{this.renderOptions()}
				</Row>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({});

export default connect(mapStateToProps)(Settings);