import React from "react";
import { connect } from "react-redux";
import {
	delayedDispatch,
	setBreadcrumb,
	setLoader,
	setTitle,
	updateCrumb,
} from "store/actions";
import { push } from "connected-react-router";
import { Props } from "./types";
import { Helmet } from "react-helmet";
import { ContentWrapper, Editor, Icon, Table } from "components";
import {
	Col,
	DatePicker,
	Drawer,
	Input,
	notification as Notification,
	Row,
	Switch,
} from "antd";
import { translate } from "utils/utils";
import moment from "moment";
import Strings from "utils/strings";
import { API, Endpoints } from "utils/api";
import "./styles.scss";

class NotificationDetail extends React.Component<Props, any> {
	constructor(props: Props) {
		super(props);

		this.state = {
			notification: null,
			title: null,
			description: null,
			scheduleDate: null,
			language: "pt",
			hasUnsavedFields: false,
			sent: false,
		};
	}

	componentDidMount() {
		const { language } = this.state;
		const { dispatch, match } = this.props;

		dispatch(
			setTitle(
				`${Strings.sidebar.notifications} - ${translate(this.state.notification?.title) || Strings.notifications.new}`
			)
		);

		delayedDispatch(
			setBreadcrumb(() => {
				return {
					locations: [
						{
							text: Strings.sidebar.notifications,
							route: "/notifications",
							icon: "bell1",
						},
						{
							text:
								match.params.id === "new"
									? Strings.notifications.new
									: translate(this.state.notification?.title),
							icon:
								match.params.id === "new"
									? "plus"
									: "pencil-outline",
						},
					],
					actions: [
						{
							type: "language",
							value: language,
							onChange: (lang: any) =>
								this.setState({ language: lang }),
						},
						{
							type: "button",
							text: Strings.generic.save,
							onClick: () => this.submitNotification(),
							separator: "left",
							disabled: !this.state.hasUnsavedFields,
							className: this.state.hasUnsavedFields
								? "BreadcrumbButtonSuccess"
								: "",
							isSave: true,
						},
					],
				};
			})
		);

		this.getData();
	}

	componentDidUpdate() {
		const { dispatch } = this.props;
		const { notification } = this.state;

		console.log('NOTIF', notification);
		
		dispatch(updateCrumb());
		setTitle(
			`${Strings.sidebar.notifications} - ${translate(notification?.title) || Strings.notifications.new}`
		)
	}

	async getData() {
		const { dispatch, match } = this.props;

		dispatch(setLoader(true));
		if (match?.params?.id !== "new") {
			const [response] = await Promise.all([
				API.get({
					url: Endpoints.uriNotifications(match?.params?.id),
				}),
			]);
			
			if (response.ok) {
				const notification = response.data.results.scheduleNotification;
				this.setState({ notification, ...notification });
			}
		}

		dispatch(setLoader(false));
	}

	async submitNotification() {
		const {
			title,
			description,
			scheduleDate,
		} = this.state;
		const { dispatch, match } = this.props;

		if (!this.validNotification()) return;

		dispatch(setLoader(true));

		let response: any;
		try {
			const body = {
				title,
				description,
				scheduleDate,
			} as any;

			const request = match?.params?.id === "new" ? API.post : API.put;
			response = await request({
				url: Endpoints.uriNotifications(
					match?.params?.id === "new" ? "" : match?.params?.id
				),
				data: body,
			});

			const newNotification = response.data.results.scheduleNotification;
			this.setState({
				notification: newNotification,
				...newNotification,
				hasUnsavedFields: false,
			});

			Notification.success({
				message: Strings.sidebar.notifications,
				description:
					match?.params?.id === "new"
						? Strings.notifications.created
						: Strings.notifications.edited,
				placement: "bottomRight",
				duration: 5,
			});

			if (match?.params?.id === "new") {
				dispatch(push('/notifications'));
				dispatch(push(`/notifications/${newNotification._id}`));
			}
		} catch (err) {
			Notification.error({
				message: Strings.sidebar.notifications,
				description:
					response.data?.message || Strings.serverErrors.wentWrong,
				placement: "bottomRight",
				duration: 5,
			});

			console.log("Error", err as string);
		}

		dispatch(setLoader(false));
	}

	validNotification() {
		const { title, description, scheduleDate } =
			this.state;

		if (!translate(title)) {
			Notification.warn({
				message: Strings.sidebar.notifications,
				description: Strings.notifications.missingTitle,
				placement: "bottomRight",
				duration: 5,
			});

			return false;
		}

		if (!translate(description)) {
			Notification.warn({
				message: Strings.sidebar.notifications,
				description: Strings.notifications.missingDescription,
				placement: "bottomRight",
				duration: 5,
			});

			return false;
		}

		if (!scheduleDate) {
			Notification.warn({
				message: Strings.sidebar.notifications,
				description: Strings.notifications.missingDate,
				placement: "bottomRight",
				duration: 5,
			});

			return false;
		}

		return true;
	}

	render() {
		const { language, title, description, scheduleDate, sent } = this.state;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.notifications}</title>
					<meta
						name="description"
						content="Description of Notification Details"
					/>
				</Helmet>
				<div className="NotificationDetailScreen">
					<ContentWrapper extraStyle={{ padding: 20 }}>
						<Row gutter={[20, 20]}>
							<Col xs={24} md={12}>
								<label
									htmlFor="notification_title"
									className="InputLabel --label-required"
								>
									{Strings.notifications.title}
								</label>
								<Input
									id="notification_title"
									value={title?.[language] || ""}
									placeholder={Strings.fields.name}
									disabled={sent}
									onChange={(event: any) => {
										const value = event.target.value;
										this.setState((prevState: any) => ({
											title: {
												...prevState.title,
												[language]: value,
											},
											hasUnsavedFields: true,
										}));
									}}
								/>
							</Col>
							<Col xs={24} md={12}>
								<label
									htmlFor="notification_date"
									className="GenericLabel --label-required"
								>
									{Strings.notifications.date}
								</label>
								<DatePicker
									id="notification_date"
									style={{ width: "100%" }}
									showTime
									disabled={sent}
									placeholder={Strings.notifications.date}
									value={
										scheduleDate
											? moment(scheduleDate)
											: undefined
									}
									disabledDate={(d) =>
										!d ||
										d.isBefore(
											moment.utc().add(-1, "day")
										) ||
										d.isAfter(moment.utc().add(1, "year"))
									}
									onChange={(value) => {
										this.setState({
											scheduleDate: value?.toISOString(),
											hasUnsavedFields: true,
										});
									}}
								/>
							</Col>
							<Col xs={24}>
								<label
									htmlFor="notification_text"
									className="InputLabel --label-required"
								>
									{Strings.gallery.notificationText}
								</label>
								<Input.TextArea
									id="notification_text"
									value={description?.[language] || ""}
									rows={4}
									placeholder={
										Strings.gallery.notificationText
									}
									disabled={sent}
									onChange={(event: any) => {
										const value = event.target.value;
										this.setState((prevState: any) => ({
											description: {
												...prevState.description,
												[language]: value,
											},
											hasUnsavedFields: true,
										}));
									}}
								/>
							</Col>
						</Row>
					</ContentWrapper>

				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({
	language: state.language,
});

export default connect(mapStateToProps)(NotificationDetail);
