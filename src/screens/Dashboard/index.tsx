/*
 *
 * Dashboard
 *
 */

import React from "react";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { ContentWrapper, Icon } from "components";
import { Row, Col, Card, Tabs, notification } from "antd";
import { Line } from '@ant-design/charts';
import moment from "moment";
import {
	setTitle,
	setLoader,
	setBreadcrumb,
	delayedDispatch,
	updateCrumb,
} from "store/actions";
import { API, Endpoints } from "utils/api";
import Strings from "utils/strings";
import "./styles.scss";

const { TabPane } = Tabs;

export class Dashboard extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			active: false,
			hasUnsavedFields: true,
			inStock: true,
			startDate: moment().startOf('month'),
			endDate: moment().endOf('day'),
			language: "pt",
			data: {
				userStatistics: [],
				uses: [],
			},
			graphTab: '1',
			cards: {
				newUsers: {
					title: Strings.dashboard.newUsers,
					icon: 'users',
					type: 'userStatistics',
					value: 0,
					isMonetary: false,
				},
				androidUse: {
					title: Strings.dashboard.androidUse,
					icon: 'mobile-app',
					type: 'userAndroid',
					value: 0,
					isMonetary: false,
				},
				iOSUse: {
					title: Strings.dashboard.iOSUse,
					icon: 'mobile-app',
					type: 'userIOS',
					value: 0,
					isMonetary: false,
				},
			}
		};

		this.handleSelect = this.handleSelect.bind(this);
	}

	componentDidMount() {
		const { dispatch } = this.props;

		dispatch(setTitle(Strings.sidebar.dashboard));
		delayedDispatch(
			setBreadcrumb(() => {
				const { startDate, endDate } = this.state;
				return {
					actions: [
						{
							type: "datePicker",
							text: Strings.dashboard.period,
							dates: [startDate, endDate],
							onChange: this.handleSelect,
							className: "fixedPicker",
						},
					],
				};
			})
		);

		this.getData();
	}

	componentDidUpdate() {
		const { dispatch } = this.props;
		dispatch(updateCrumb());
	}

	handleSelect(dates: any) {
		const newDates = [];
		if (dates && dates[0]) {
			newDates.push(moment(dates[0]).startOf('day'));
		}

		if (dates && dates[1]) {
			newDates.push(moment(dates[1]).endOf('day'));
		}

		this.setState({
			startDate: newDates[0],
			endDate: newDates[1],
		}, () => this.getData());
	}

	async getData() {
		const { startDate, endDate, cards } = this.state;
		const { dispatch } = this.props;

		dispatch(setLoader(true));

		try {
			const response = await API.get({
				url: Endpoints.uriAnalytics(`?startDate=${startDate.format('DD/MM/yyyy')}&endDate=${endDate.format('DD/MM/yyyy')}`),
			});
	
			if (response.ok) {
				const { analytics } = response.data.results;
	
				let diff = endDate.diff(startDate, "days") + 1;
	
				const format = diff > 90 ? 'MM/yyyy' : 'DD/MM/yyyy';
	
				const userStatistics = analytics.userStatistics.byDate
					.map((elem: number, index: number) => ({
						day: moment(startDate).add(index, diff > 90 ? 'months' : 'days').format(format),
						name: Strings.dashboard.newUsers,
						value: elem,
					}))
	
				const uses = analytics.userIOS.byDate
					.map((elem: number, index: number) => ({
						day: moment(startDate).add(index, diff > 90 ? 'months' : 'days').format(format),
						name: Strings.dashboard.iOSUse,
						value: elem,
					}))
	
				uses.push(...analytics.userAndroid.byDate
					.map((elem: number, index: number) => ({
						day: moment(startDate).add(index, diff > 90 ? 'months' : 'days').format(format),
						name: Strings.dashboard.androidUse,
						value: elem,
					}))
				);
	
				const newCards = JSON.parse(JSON.stringify(cards));
	
				newCards.newUsers.value = analytics.userStatistics.value;
				newCards.androidUse.value = analytics.userAndroid.value;
				newCards.iOSUse.value = analytics.userIOS.value;
	
				this.setState({
					data: { userStatistics, uses },
					cards: newCards,
					userStatistics: analytics.userStatistics.value,
					userIOS: analytics.userIOS.value,
					userAndroid: analytics.userAndroid.value,
					userWeb: analytics.userWeb.value,
				});
			} else {
				return notification.error({
					message: Strings.serverErrors.title,
					description: response.data?.message || Strings.serverErrors.wentWrong,
					placement: 'bottomRight',
					duration: 5,
				})
			}
		} catch (err) {
			// console.log('Error', err)
		}

		dispatch(setLoader(false));
	}

	render() {
		const { data, cards, graphTab } = this.state;

		const config = (duration: string) => {
			const graphData = duration === "userStatistics" ? data.userStatistics : data.uses;

			return {
				data: graphData,
				xField: "day",
				yField: "value",
				seriesField: "name",
				yAxis: {
					label: {
						formatter: function formatter(v: string) {
							return ""
								.concat(v)
								.replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
									return "".concat(s, ",");
								});
						},
					},
					visible: true,
					min: 0
				},
				// height: 450,
				// autoFit: false,
				appendPadding: 10,
				// legend: { position: "top" },
				// renderer: "svg",
				smooth: true,
				animation: {
					appear: {
						animation: "path-in",
						duration: 2500,
					},
				},
			};
		};

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.dashboard}</title>
					<meta name="description" content="Description of Dashboard" />
				</Helmet>
				<Row gutter={[24, 24]}>
					{Object.keys(cards).map((elem: any) => {
						const card = cards[elem];
						return <Col key={`card_${card.title}`} xs={12} sm={8} md={8}>
							<ContentWrapper extraClass={`DashboardCard`}>
								<Card
									title={card.title}
									hoverable={true}
									extra={<Icon name={card.icon} className="DashboardCardIcon" />}
								>
									<p className="CardValue">{card.value}</p>
								</Card>
							</ContentWrapper>
						</Col>
					})}
				</Row>
				<ContentWrapper extraStyle={{ marginBottom: 20 }}>
					<div className="DashboardMainChart">
						<div className="DashboardMainChartTitle">
							<Icon name={graphTab === '1' ? "users" : "mobile-app"} />
							<span>{graphTab === '1' ? Strings.dashboard.newUsers : Strings.dashboard.uses}</span>
						</div>
						<Tabs onChange={(key: string) => this.setState({ graphTab: key })} defaultActiveKey="1">
							<TabPane tab={Strings.dashboard.newUsers} key="1" />
							<TabPane tab={Strings.dashboard.uses} key="2" />
						</Tabs>
						<div className="Dashboard_Data_Charts">
							<div id="data1" className={`Dashboard_Generic_Chart${graphTab === '1' ? ' __active' : ''}`}>
								<Line {...config("userStatistics")} />
							</div>
							<div id="data2" className={`Dashboard_Generic_Chart${graphTab === '2' ? ' __active' : ''}`}>
								<Line {...config("uses")} />
							</div>
						</div>
					</div>
				</ContentWrapper>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({});

export default connect(mapStateToProps)(Dashboard);
