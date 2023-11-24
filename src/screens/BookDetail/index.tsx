import React from "react";
import { connect } from "react-redux";
import {
	delayedDispatch,
	setBreadcrumb,
	setLoader,
	setTitle,
	updateCrumb,
} from "store/actions";
import { Props } from "./types";
import { push } from "connected-react-router";
import { Helmet } from "react-helmet";
import { ContentWrapper, Editor, Icon, Table } from "components";
import {
	Col,
	ConfigProvider,
	Drawer,
	Input,
	InputNumber,
	notification as Notification,
	Row,
	Select,
	Switch,
} from "antd";
import Dropzone from "react-dropzone";
import Compressor from "compressorjs";
import { LANGUAGES, translate } from "utils/utils";
import { API, Endpoints } from "utils/api";
import Strings from "utils/strings";
import "./styles.scss";

class BookDetail extends React.Component<Props, any> {
	constructor(props: Props) {
		super(props);

		this.state = {
			item: null,
			filesToDelete: [],
			language: "pt",
			_active: false,
			drawerLoading: false,
			hasUnsavedFields: false,
			sidebarLanguage: 'pt',
		};
	}

	componentDidMount() {
		const { item, language } = this.state;
		const { dispatch, match } = this.props;

		dispatch(
			setTitle(
				`${Strings.sidebar.books} - ${item?.name || Strings.books.newItem}`
			)
		);

		delayedDispatch(
			setBreadcrumb(() => {
				return {
					locations: [
						{
							text: Strings.sidebar.books,
							route: "/books",
							icon: "frame",
						},
						{
							text:
								match.params.id === "new"
									? Strings.books.newItem
									: this.state.item?.name,
							icon:
								match.params.id === "new"
									? "plus"
									: "pencil-outline",
						},
					],
					actions: [
						{
							type: "switch",
							text: Strings.books.published,
							value: this.state._active,
							onClick: () =>
								this.setState((prevState: any) => ({
									_active: !prevState._active,
								})),
							small: {
								text: true,
								switch: true,
							},
						},
						{
							type: "language",
							value: language,
							separator: "left",
							onChange: (lang: any) =>
								this.setState({ language: lang }),
						},
						{
							type: "button",
							text: Strings.generic.save,
							onClick: () => this.submitItem(),
							disabled: !this.state.hasUnsavedFields,
							className: this.state.hasUnsavedFields
								? "BreadcrumbButtonSuccess"
								: "",
							separator: "left",
							isSave: true,
						},
					],
				};
			})
		);

		this.getData();
	}

	componentDidUpdate() {
		const { item } = this.state;
		const { dispatch } = this.props;

		dispatch(updateCrumb());
		dispatch(
			setTitle(
				`${Strings.sidebar.books} - ${translate(item?.name) || Strings.books.newItem
				}`
			)
		);
	}

	async getData() {
		const { dispatch, match } = this.props;

		dispatch(setLoader(true));
		this.setState({ drawerLoading: true });

		try {
			// new item
			if (match?.params?.id !== "new") {
				const [response] = await Promise.all([
					API.get({
						url: Endpoints.uriBooks(match.params.id),
					}),
				]);

				const item = response.data.results.books || {};

				this.setState({
					item,
					...item,
				});
			}
		} catch (err) {
			Notification.error({
				message: Strings.books.item,
				description: (err as string) || Strings.serverErrors.wentWrong,
				placement: "bottomRight",
				duration: 5,
			});
		}

		this.setState({ drawerLoading: false });
		dispatch(setLoader(false));
	}

	async submitItem() {
		const {
			name,
			value,
			notificationTitle,
			notificationDescription,
			notifyUsers,
			_active,
			image,
			bookFile,
			bookFilePreview,
		} = this.state;
		const { dispatch, match } = this.props;

		if (!this.validItem()) return;

		dispatch(setLoader(true));

		let response: any;
		try {
			const body = new FormData();
			body.append("name", JSON.stringify(name));
			body.append("value", JSON.stringify(value));

			if (image && typeof image === "string") {
				body.append("image", image);
			} else if (image && typeof image === "object") {
				body.append("image", image.file);
			}
			
			if (bookFile && typeof bookFile === "string") {
				body.append("bookFile", bookFile);
			} else if (bookFile && typeof bookFile === "object") {
				body.append("bookFile", bookFile.file);
			}
			
			if (bookFilePreview && typeof bookFilePreview === "string") {
				body.append("bookFilePreview", bookFilePreview);
			} else if (bookFilePreview && typeof bookFilePreview === "object") {
				body.append("bookFilePreview", bookFilePreview.file);
			}

			body.append("notifyUsers", notifyUsers || false);
			if (translate(notificationTitle)) {
				body.append("notificationTitle", JSON.stringify(notificationTitle));
			}
			if (translate(notificationDescription)) {
				body.append("notificationDescription", JSON.stringify(notificationDescription));
			}

			body.append("_active", _active);

			const request = match?.params?.id === "new" ? API.post : API.put;
			response = await request({
				url: Endpoints.uriBooks(match?.params?.id !== 'new' ? match?.params?.id : ""),
				data: body,
			});

			if (response.ok) {
				Notification.success({
					message: Strings.books.item,
					description: match?.params?.id === "new" ? Strings.books.created : Strings.books.edited,
					placement: "bottomRight",
					duration: 5,
				});

				if (match?.params?.id === "new") {
					dispatch(push('/books'));
					dispatch(push(`/books/${response.data.results.books?._id}`));
				}
			} else {
				Notification.error({
					message: Strings.books.item,
					description:
						response?.data?.message || Strings.serverErrors.wentWrong,
					placement: "bottomRight",
					duration: 5,
				});
			}
		} catch (err) {
			Notification.error({
				message: Strings.books.item,
				description:
					response?.data?.message || Strings.serverErrors.wentWrong,
				placement: "bottomRight",
				duration: 5,
			});
			console.log("Error", err);
		}

		dispatch(setLoader(false));
	}

	validItem() {
		const {
			name,
			notificationTitle,
			notificationDescription,
			notifyUsers,
		} = this.state;

		if (!name) {
			Notification.warn({
				message: Strings.books.item,
				description: Strings.books.nameMandatory,
				placement: 'bottomRight',
				duration: 5,
			});

			return false;
		}

		if (
			notifyUsers &&
			(!translate(notificationTitle) ||
				!translate(notificationDescription))
		) {
			Notification.warn({
				message: Strings.books.item,
				description: Strings.books.notificationMandatory,
				placement: 'bottomRight',
				duration: 5,
			});

			return false;
		}

		return true;
	}

	getBase64(file: any) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	}

	onDrop(files: any, type?: any) {
		try {
			const file = files[files.length - 1];

			new Compressor(file, {
				quality: 0.9,
				maxWidth: 400,
				mimeType: "image/jpeg",
				success: (result: any) => {
					this.getBase64(result).then((res) => {	
						this.setState((prevState: any) => ({
							filesToDelete:
								prevState[type] === "string"
									? prevState.filesToDelete.concat(
										prevState[type]
									)
									: prevState.filesToDelete,
							[type]: { file: result, preview: res },
							hasUnsavedFields: true,
						}));
					});
				},
			});
		} catch (err) {
			Notification.warn({
				message: Strings.errors.unsupportedFile,
				description: Strings.errors.fileNotSupported,
				placement: "bottomRight",
				duration: 5,
			});
		}
	}

	renderBook() {
		const { image, bookFile, bookFilePreview, name, value } = this.state;

		return (
			<ContentWrapper extraStyle={{ padding: 20 }}>
				<Row gutter={[20, 20]}>
					<Col xs={24} md={8}>
						<div className="BookDetail">
							<Dropzone
								accept="image/jpg, image/jpeg, image/png"
								className="GenericImageUpload"
								onDrop={(files: any) => this.onDrop(files, 'image')}
							>
								{image ? (
									<div
										className="BookDetailImage"
										style={{
											backgroundImage:
												`url('${image.preview || image
												}')` || "none",
										}}
									/>
								) : (
									<div
										className={`GenericImageUploadOverlay${!image ? " --visible" : ""
											}`}
									>
										<Icon name="frame" />
										<span>
											{Strings.books.changeImage}
										</span>
									</div>
								)}
								{image && (
									<button
										onClick={(
											e: React.MouseEvent<HTMLElement>
										) => {
											e.stopPropagation();

											this.setState({
												image: null,
												hasUnsavedFields: true,
											});
										}}
										className="GenericImageDelete"
									>
										<Icon name="close" />
									</button>
								)}
							</Dropzone>
						</div>
					</Col>
					<Col xs={24} md={8}>
						<div className="BookDetail">
							<Dropzone
								accept="image/jpg, image/jpeg, image/png"
								className="GenericImageUpload"
								onDrop={(files: any) => this.onDrop(files, 'bookFile')}
							>
								{bookFile ? (
									<div
										className="BookDetailImage"
										style={{
											backgroundImage:
												`url('${bookFile.preview || bookFile
												}')` || "none",
										}}
									/>
								) : (
									<div
										className={`GenericImageUploadOverlay${!bookFile ? " --visible" : ""
											}`}
									>
										<Icon name="frame" />
										<span>
											{Strings.books.changeFile}
										</span>
									</div>
								)}
								{bookFile && (
									<button
										onClick={(
											e: React.MouseEvent<HTMLElement>
										) => {
											e.stopPropagation();

											this.setState({
												bookFile: null,
												hasUnsavedFields: true,
											});
										}}
										className="GenericImageDelete"
									>
										<Icon name="close" />
									</button>
								)}
							</Dropzone>
						</div>
					</Col>
					<Col xs={24} md={8}>
						<div className="BookDetail">
							<Dropzone
								accept="image/jpg, image/jpeg, image/png"
								className="GenericImageUpload"
								onDrop={(files: any) => this.onDrop(files, 'bookFilePreview')}
							>
								{bookFilePreview ? (
									<div
										className="BookDetailImage"
										style={{
											backgroundImage:
												`url('${bookFilePreview.preview || bookFilePreview
												}')` || "none",
										}}
									/>
								) : (
									<div
										className={`GenericImageUploadOverlay${!bookFilePreview ? " --visible" : ""
											}`}
									>
										<Icon name="frame" />
										<span>
											{Strings.books.changeFilePreview}
										</span>
									</div>
								)}
								{bookFilePreview && (
									<button
										onClick={(
											e: React.MouseEvent<HTMLElement>
										) => {
											e.stopPropagation();

											this.setState({
												bookFilePreview: null,
												hasUnsavedFields: true,
											});
										}}
										className="GenericImageDelete"
									>
										<Icon name="close" />
									</button>
								)}
							</Dropzone>
						</div>
					</Col>
					<Col xs={24} md={18}>
						<label
							htmlFor="image_name"
							className="InputLabel --label-required"
						>
							{Strings.fields.name}
						</label>
						<Input
							id="image_name"
							value={name || ""}
							placeholder={Strings.fields.name}
							onChange={(event: any) => {
								const value = event.target.value;
								this.setState((prevState: any) => ({
									name: value,
									hasUnsavedFields: true,
								}));
							}}
						/>
					</Col>
					<Col xs={24} md={6}>
						<label
							htmlFor="image_name"
							className="InputLabel --label-required"
						>
							{Strings.books.value}
						</label>
						<Input
							id="image_name"
							value={value || 0}
							placeholder={Strings.books.value}
							type="number"
							onChange={(event: any) => {
								const value = event.target.value;
								this.setState((prevState: any) => ({
									value: value,
									hasUnsavedFields: true,
								}));
							}}
						/>
					</Col>
				</Row>
			</ContentWrapper>
		);
	}

	renderNotification() {
		const {
			language,
			notifyUsers,
			notificationTitle,
			notificationDescription,
			sent
		} = this.state;

		return (
			<ContentWrapper extraStyle={{ padding: 20 }}>
				<div className="GenericHeader">
					<div className="GenericTitle">
						<Icon name="bell1" />
						<p>{Strings.books.notificationText}</p>
					</div>
					<div className="NotificationSendEmail">
						<p>{Strings.notifications.sendNotification}</p>
						<Switch
							checked={notifyUsers}
							size="small"
							onClick={() =>
								this.setState((prevState: any) => ({
									notifyUsers:
										!prevState.notifyUsers,
									hasUnsavedFields: true,
								}))
							}
						/>
					</div>
				</div>
				<Row gutter={[0, 20]}>
					<Col xs={24}>
						<label
							htmlFor="notification_title"
							className="InputLabel --label-required"
						>
							{Strings.pages.title}
						</label>
						<Input
							id="notification_title"
							value={
								notificationTitle?.[language] ||
								""
							}
							disabled={!notifyUsers || sent}
							placeholder={Strings.pages.title}
							onChange={(event: any) => {
								const value =
									event.target.value;
								this.setState(
									(prevState: any) => ({
										notificationTitle: {
											...prevState.notificationTitle,
											[language]: value,
										},
										hasUnsavedFields: true,
									})
								);
							}}
						/>
					</Col>
					<Col xs={24}>
						<label
							htmlFor="notification_text"
							className="InputLabel --label-required"
						>
							{Strings.books.notificationText}
						</label>
						<Input.TextArea
							id="notification_text"
							value={
								notificationDescription?.[
								language
								] || ""
							}
							rows={4}
							disabled={!notifyUsers || sent}
							placeholder={
								Strings.books.notificationText
							}
							onChange={(event: any) => {
								const value =
									event.target.value;
								this.setState(
									(prevState: any) => ({
										notificationDescription:
										{
											...prevState.notificationDescription,
											[language]:
												value,
										},
										hasUnsavedFields: true,
									})
								);
							}}
						/>
					</Col>
				</Row>
			</ContentWrapper>
		);
	}

	render() {
		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.books}</title>
					<meta name="description" content="Description of Books" />
				</Helmet>
				<div className="BookDetailScreen">
					{this.renderBook()}
					{this.renderNotification()}
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({
	language: state.language,
});

export default connect(mapStateToProps)(BookDetail);
