/* eslint-disable no-restricted-globals */
/*
 *
 * PageDetail
 *
 */

import React from "react";
import { connect } from "react-redux";
import { delayedDispatch, setBreadcrumb, setLoader, setTitle, updateCrumb } from "store/actions";
import { Col, Row, Input, notification } from "antd";
import { Helmet } from "react-helmet";
import { ContentWrapper, Editor } from "components";
import { API, Endpoints } from "utils/api";
import { translate } from 'utils/utils';
import Strings from "utils/strings";
import "./styles.scss";

export class PageDetail extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			_active: true,
			title: null,
			content: null,
			language: "pt",
			hasUnsavedFields: false,
		};

		this.handleSwitch = this.handleSwitch.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleLanguageChange = this.handleLanguageChange.bind(this);
	}

	async componentDidMount() {
		const { dispatch, match } = this.props;

		dispatch(setLoader(true));

		let page;
		if (match?.params?.id === 'new') {
			dispatch(setTitle(`${Strings.pages.single} - ${Strings.pages.new}`))
		} else {
			const response = await API.get({
				url: Endpoints.uriPages(match?.params?.id),
			});

			if (response.ok) {
				page = response.data.results.pages;
				dispatch(setTitle(`${Strings.pages.single} - ${translate(page.title)}`))
			}
		}

		this.setState({ page, ...page });

		dispatch(setBreadcrumb(null));
		delayedDispatch(
			setBreadcrumb(() => {
				const { hasUnsavedFields, language, _active } = this.state;

				return {
					locations: [
						{
							text: Strings.sidebar.settings,
							route: "/settings",
							icon: "preferences",
						},
						{
							text: Strings.settings.pages,
							route: "/settings/pages",
							icon: "text-files",
						},
						{
							text: this.state.title?.[this.state.language],
							icon: "file",
						},
					],
					actions: [
						{
							type: 'switch',
							text: Strings.generic.active,
							value: _active,
							onClick: this.handleSwitch,
							separator: 'right',
							small: {
								switch: true,
								text: true,
							},
						},
						{
							type: "language",
							value: language,
							onChange: this.handleLanguageChange,
							className: "BreadcrumbLanguage",
							margin: "left",
						},
						{
							type: "button",
							text: Strings.generic.save,
							onClick: this.handleSave,
							disabled: !hasUnsavedFields,
							className: hasUnsavedFields ? "BreadcrumbButtonSuccess" : "",
							separator: "left",
							isSave: true,
						},
					],
				};
			})
		);

		dispatch(setLoader(false));
	}

	componentDidUpdate() {
		const { dispatch } = this.props;
		const { page } = this.state;

		dispatch(setTitle(`${Strings.pages.single} - ${translate(page.title)}`))
		dispatch(updateCrumb());
	}

	isValid() {
		const { title, content } = this.state;
		return title && content;
	}

	async handleSave(event: any) {
		const { match, dispatch } = this.props;
		const { title, content, isActive } = this.state;

		if (!this.isValid()) {
			return notification.warn({
				message: Strings.settings.pages,
				description: Strings.errors.invalidFields,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		dispatch(setLoader(true))

		const response = await API.put({
			url: Endpoints.uriPages(match?.params?.id),
			data: { title, content, isActive },
		});

		if (response.ok) {
			this.setState({ ...response.data.results.pages, hasUnsavedFields: false });
		}

		dispatch(setLoader(false))
	}

	handleLanguageChange(value: any, options?: any) {
		this.setState({ language: value });
	}

	handleSwitch(value: any) {
		this.setState({ _active: value, hasUnsavedFields: true });
	}

	render() {
		const { title, content, language } = this.state;
		const { match } = this.props;

		return (
			<ContentWrapper extraStyle={{ padding: 20 }}>
				<Helmet>
					<title>{match?.params?.id === 'new' ? Strings.pages.new : translate(title)}</title>
					<meta name="description" content="Description of Page Detail" />
				</Helmet>
				<Row gutter={[0, 20]}>
					<Col xs={24}>
						<label htmlFor="title" className="SingleLabel __required">{Strings.pages.title}</label>
						<Input
							placeholder={Strings.placeholders.titlePage}
							value={title?.[language] || ''}
							onChange={(e: any) => {
								const { value } = e.target;
								this.setState({
									title: { ...title, [language]: value },
									hasUnsavedFields: true,
								});
							}}
						/>
					</Col>
					<Col xs={24}>
						<span className="InputLabel --label-required">{Strings.pages.content}</span>
						<Editor
							key={`editor_${language}`}
							required
							init={{ height: 500 }}
							value={content?.[language]}
							onChange={(value: any) =>
								this.setState({ content: { ...content, [language]: value }, hasUnsavedFields: true })
							}
						/>
					</Col>
				</Row>
			</ContentWrapper>
		);
	}
}

const mapStateToProps = (state: any) => ({
	language: state.language,
});

export default connect(mapStateToProps)(PageDetail);
