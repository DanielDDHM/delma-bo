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

import pt from "antd/es/locale/pt_PT";
import en from "antd/es/locale/en_GB";
import es from "antd/es/locale/es_ES";

class GalleryItem extends React.Component<Props, any> {
	constructor(props: Props) {
		super(props);

		this.state = {
			item: null,
			type: "article",
			types: [
				{
					value: "article",
					text: Strings.fields.article,
				},
				{
					value: "video",
					text: Strings.gallery.video,
				},
				{
					value: "audio",
					text: Strings.gallery.audio,
				},
				{
					value: "survey",
					text: Strings.gallery.surveys,
				},
			],
			filesToDelete: [],
			language: "pt",
			published: false,
			drawerLoading: false,
			hasUnsavedFields: false,
			categories: [],
			surveyQuestions: [],
			surveyResults: [
				{
					minValue: null,
					maxValue: null,
					description: null,
					result: null,
				},
			],
			sidebarLanguage: 'pt',
		};
	}

	componentDidMount() {
		const { item, types, language } = this.state;
		const { dispatch, match } = this.props;

		dispatch(
			setTitle(
				`${Strings.sidebar.gallery} - ${translate(item?.name) || Strings.gallery.newItem
				}`
			)
		);

		delayedDispatch(
			setBreadcrumb(() => {
				return {
					locations: [
						{
							text: Strings.sidebar.gallery,
							route: "/library",
							icon: "frame",
						},
						{
							text:
								match.params.id === "new"
									? Strings.gallery.newItem
									: translate(this.state.item?.name),
							icon:
								match.params.id === "new"
									? "plus"
									: "pencil-outline",
						},
					],
					actions: [
						{
							type: "switch",
							text: Strings.gallery.published,
							value: this.state.published,
							onClick: () =>
								this.setState((prevState: any) => ({
									published: !prevState.published,
								})),
							small: {
								text: true,
								switch: true,
							},
						},
						{
							type: "select",
							text: Strings.gallery.type,
							value: this.state.type,
							options: types,
							onChange: (type: any) => {
								if (type !== this.state.type) {
									this.setState({
										type,
										image: null,
										video: null,
										article: null,
										audio: null,
									});
								}
							},
							minWidth: 160,
							separator: "left",
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
				`${Strings.sidebar.gallery} - ${translate(item?.name) || Strings.gallery.newItem
				}`
			)
		);
	}

	async getData() {
		const { dispatch, match } = this.props;

		dispatch(setLoader(true));
		this.setState({ drawerLoading: true, selectedClients: [] });

		try {
			// new item
			if (match?.params?.id !== "new") {
				const [response] = await Promise.all([
					API.get({
						url: Endpoints.uriLibrary(match.params.id),
					}),
				]);

				const item = response.data.results.library || {};

				if (Array.isArray(item.surveyResults) && !item.surveyResults.length) {
					item.surveyResults.push({
						minValue: null,
						maxValue: null,
						description: null,
						result: null,
					})
				}

				this.setState({
					item,
					...item,
				});
			}
		} catch (err) {
			Notification.error({
				message: Strings.gallery.item,
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
			type,
			name,
			category,
			description,
			notificationTitle,
			notificationDescription,
			notifyUsers,
			sendEmail,
			emailContent,
			published,
			image,
			video,
			audio,
			businesses,
			surveyQuestions,
			surveyResults,
		} = this.state;
		const { dispatch, match } = this.props;

		if (!this.validItem()) return;

		dispatch(setLoader(true));

		let response: any;
		try {
			const body = new FormData();
			body.append("name", JSON.stringify(name));
			body.append("category", category || null);
			body.append("type", type);

			if ((type === "article" || type === "survey" || type === "audio") && image && typeof image === "string") {
				body.append("image", image);
			} else if ((type === "article" || type === "survey" || type === "audio") && image && typeof image === "object") {
				body.append("image", image.file);
			}
			if (type === "article") body.append("description", JSON.stringify(description));


			if (type === "video" && video && typeof video === "string") {
				body.append("video", video);
			} else if (type === "video" && video && typeof video === "object") {
				body.append("video", video.file);
			}

			if (type === "audio" && audio && typeof audio === "string") {
				body.append("audio", audio);
			} else if (type === "audio" && audio && typeof audio === "object") {
				body.append("audio", audio.file);
			}

			body.append("notifyUsers", notifyUsers || false);
			if (translate(notificationTitle)) {
				body.append("notificationTitle", JSON.stringify(notificationTitle));
			}
			if (translate(notificationDescription)) {
				body.append("notificationDescription", JSON.stringify(notificationDescription));
			}

			body.append("sendEmail", sendEmail || false);
			if (translate(emailContent)) {
				body.append("emailContent", JSON.stringify(emailContent));
			}

			body.append("surveyQuestions", JSON.stringify(surveyQuestions));
			body.append("surveyResults", JSON.stringify(surveyResults));

			body.append("published", published);

			if (businesses.length) {
				// const businessToSubmit = businesses.map(business => business._id);
				// console.log('BUSINESSES', businessToSubmit);
				body.append("businesses", JSON.stringify(businesses) || JSON.stringify([]));
			}

			const request = match?.params?.id === "new" ? API.post : API.put;
			response = await request({
				url: Endpoints.uriLibrary(match?.params?.id !== 'new' ? match?.params?.id : ""),
				data: body,
			});

			if (response.ok) {
				Notification.success({
					message: Strings.gallery.item,
					description: match?.params?.id === "new" ? Strings.gallery.created : Strings.gallery.edited,
					placement: "bottomRight",
					duration: 5,
				});

				if (match?.params?.id === "new") {
					dispatch(push('/library'));
					dispatch(push(`/library/${response.data.results.library?._id}`));
				}
			} else {
				Notification.error({
					message: Strings.gallery.item,
					description:
						response?.data?.message || Strings.serverErrors.wentWrong,
					placement: "bottomRight",
					duration: 5,
				});
			}
		} catch (err) {
			Notification.error({
				message: Strings.gallery.item,
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
			type,
			name,
			category,
			description,
			notificationTitle,
			notificationDescription,
			notifyUsers,
			surveyResults,
		} = this.state;

		if (!translate(name)) {
			Notification.warn({
				message: Strings.gallery.item,
				description: Strings.gallery.nameMandatory,
				placement: 'bottomRight',
				duration: 5,
			});

			return false;
		}

		if (!category) {
			Notification.warn({
				message: Strings.gallery.item,
				description: Strings.gallery.categoryMandatory,
				placement: 'bottomRight',
				duration: 5,
			});

			return false;
		}

		if (type === "article" && !translate(description)) {
			Notification.warn({
				message: Strings.gallery.item,
				description: Strings.gallery.descriptionMandatory,
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
				message: Strings.gallery.item,
				description: Strings.gallery.notificationMandatory,
				placement: 'bottomRight',
				duration: 5,
			});

			return false;
		}

		if (Array.isArray(surveyResults) && surveyResults.length > 0) {
			const last = surveyResults[surveyResults.length - 1];
			const oneEntry = surveyResults.length === 1;

			if (!oneEntry && (last?.minValue == null || last?.maxValue == null || !translate(last?.result))) {
				Notification.warn({
					message: Strings.gallery.answers,
					description: Strings.gallery.invalidAnswer,
					placement: 'bottomRight',
					duration: 5,
				});

				return false;
			}

			if (oneEntry && (last?.minValue != null || last?.maxValue != null || translate(last?.result)) && !(last?.minValue != null && last?.maxValue != null && translate(last?.result))) {
				Notification.warn({
					message: Strings.gallery.answers,
					description: Strings.gallery.invalidAnswer,
					placement: 'bottomRight',
					duration: 5,
				});

				return false;
			}
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

	onDrop(files: any, article?: boolean) {
		try {
			const file = files[files.length - 1];

			new Compressor(file, {
				quality: 0.9,
				maxWidth: 400,
				mimeType: "image/jpeg",
				success: (result: any) => {
					this.getBase64(result).then((res) => {
						if (article) {
							this.setState((prevState: any) => ({
								filesToDelete:
									prevState.article?.image === "string"
										? prevState.filesToDelete.concat(
											prevState.article?.image
										)
										: prevState.filesToDelete,
								article: {
									...prevState.article,
									image: { file: result, preview: res },
								},
								hasUnsavedFields: true,
							}));
						} else {
							this.setState((prevState: any) => ({
								filesToDelete:
									prevState.image === "string"
										? prevState.filesToDelete.concat(
											prevState.image
										)
										: prevState.filesToDelete,
								image: { file: result, preview: res },
								hasUnsavedFields: true,
							}));
						}
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

	onDropVideo = (files: any) => {
		try {
			const file = files[files.length - 1];

			this.getBase64(file)
				.then((preview) => {
					this.setState({
						video: { preview, file },
						hasUnsavedFields: true,
					});
				})
				.catch((err) => console.log(err));
		} catch (err) {
			Notification.warn({
				message: Strings.errors.unsupportedFile,
				description: Strings.errors.fileNotSupported,
				placement: "bottomRight",
				duration: 5,
			});
		}
	};

	onAudioDrop = (files: any) => {
		try {
			const file = files[files.length - 1];

			this.getBase64(file).then((preview) => {
				this.setState({
					audio: { preview, file },
					hasUnsavedFields: true,
				});
			});
		} catch (err) {
			console.log("err", err);
			Notification.warn({
				message: Strings.errors.unsupportedFile,
				description: Strings.errors.fileNotSupported,
				placement: "bottomRight",
				duration: 5,
			});
		}
	};

	addUser() {
		const { selectedClients, businesses } = this.state;

		if (!selectedClients.length) return;

		const newUsers = businesses.concat(
			JSON.parse(JSON.stringify(selectedClients))
		);
		this.setState({ businesses: newUsers, openSidebar: false, searchText: '', possibleClients: [], selectedClients: [], hasUnsavedFields: true });
	}

	renderArticle() {
		const { language, image, name, category, categories } = this.state;

		return (
			<ContentWrapper extraStyle={{ padding: 20 }}>
				<Row gutter={[20, 20]}>
				<Col xs={24} md={12}>
						<div className="GalleryItem">
							<Dropzone
								accept="image/jpg, image/jpeg, image/png"
								className="GenericImageUpload"
								onDrop={(files: any) => this.onDrop(files)}
							>
								{image ? (
									<div
										className="GalleryItemImage"
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
											{Strings.generic.changeImage}
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
					<Col xs={24} md={12}>
						<Row gutter={[0, 20]}>
							<Col xs={24}>
								<label
									htmlFor="image_name"
									className="InputLabel --label-required"
								>
									{Strings.fields.name}
								</label>
								<Input
									id="image_name"
									value={name?.[language] || ""}
									placeholder={Strings.fields.name}
									onChange={(event: any) => {
										const value = event.target.value;
										this.setState((prevState: any) => ({
											name: {
												...prevState.name,
												[language]: value,
											},
											hasUnsavedFields: true,
										}));
									}}
								/>
							</Col>
							<Col xs={24}>
								<label
									htmlFor="image_category"
									className="GenericLabel --label-required"
								>
									{Strings.gallery.category}
								</label>
								<Select
									id="image_category"
									style={{ width: "100%" }}
									disabled={!categories.length}
									placeholder={Strings.gallery.category}
									showSearch
									filterOption={(input: any, option: any) =>
										option.children
											.toLowerCase()
											.indexOf(input.toLowerCase()) >= 0
									}
									value={category || null}
									onChange={(category: any) =>
										this.setState({ category, hasUnsavedFields: true })
									}
								>
									{categories.map((category: any) => (
										<Select.Option
											key={`category_${category?._id}`}
											value={category._id}
										>
											{translate(category.name)}
										</Select.Option>
									))}
								</Select>
							</Col>
						</Row>
					</Col>
				</Row>
			</ContentWrapper>
		);
	}

	renderImage() {
		const { name, category, categories, image, language } = this.state;

		return (
			<ContentWrapper extraStyle={{ padding: 20 }}>
				<Row gutter={[20, 20]}>
					<Col xs={24} md={12}>
						<div className="GalleryItem">
							<Dropzone
								accept="image/jpg, image/jpeg, image/png"
								className="GenericImageUpload"
								onDrop={(files: any) => this.onDrop(files)}
							>
								{image ? (
									<div
										className="GalleryItemImage"
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
											{Strings.generic.changeImage}
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
					<Col xs={24} md={12}>
						<Row gutter={[0, 20]}>
							<Col xs={24}>
								<label
									htmlFor="image_name"
									className="InputLabel --label-required"
								>
									{Strings.fields.name}
								</label>
								<Input
									id="image_name"
									value={name?.[language] || ""}
									placeholder={Strings.fields.name}
									onChange={(event: any) => {
										const value = event.target.value;
										this.setState((prevState: any) => ({
											name: {
												...prevState.name,
												[language]: value,
											},
											hasUnsavedFields: true,
										}));
									}}
								/>
							</Col>
							<Col xs={24}>
								<label
									htmlFor="image_category"
									className="GenericLabel --label-required"
								>
									{Strings.gallery.category}
								</label>
								<Select
									id="image_category"
									style={{ width: "100%" }}
									placeholder={Strings.gallery.category}
									showSearch
									filterOption={(input: any, option: any) =>
										option.children
											.toLowerCase()
											.indexOf(input.toLowerCase()) >= 0
									}
									value={category || null}
									onChange={(category: any) =>
										this.setState({ category })
									}
								>
									{categories.map((category: any) => (
										<Select.Option
											key={`category_${category?.name}`}
											value={category._id}
										>
											{translate(category.name)}
										</Select.Option>
									))}
								</Select>
							</Col>
						</Row>
					</Col>
				</Row>
			</ContentWrapper>
		);
	}

	renderVideo() {
		const { name, category, categories, video, language } = this.state;

		return (
			<React.Fragment>
				<ContentWrapper extraStyle={{ padding: 20 }}>
					<Row gutter={[20, 20]}>
						<Col xs={24} md={12}>
							<div className="GalleryItem">
								<Dropzone
									accept=".mp4, .mov"
									className="GenericImageUpload"
									style={{ height: 300 }}
									onDrop={(files: any) =>
										this.onDropVideo(files)
									}
									disableClick={Boolean(
										video?.preview || video
									)}
								>
									{video?.preview || video ? (
										<video
											width="100%"
											height="100%"
											preload="none"
											controls
											style={{
												border: 0,
												maxHeight: 300,
											}}
										>
											<source
												src={video?.preview ?? video}
											/>
										</video>
									) : (
										<div className="GenericImageUploadOverlay --visible">
											<Icon name="video" />
											<span>
												{Strings.generic.changeVideo}
											</span>
										</div>
									)}
									{(video?.preview || video) && (
										<button
											onClick={(
												e: React.MouseEvent<HTMLElement>
											) => {
												e.stopPropagation();

												this.setState({
													video: null,
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
						<Col xs={24} md={12}>
							<Row gutter={[0, 20]}>
								<Col xs={24}>
									<label
										htmlFor="image_name"
										className="InputLabel --label-required"
									>
										{Strings.fields.name}
									</label>
									<Input
										id="image_name"
										value={name?.[language] || ""}
										placeholder={Strings.fields.name}
										onChange={(event: any) => {
											const value = event.target.value;
											this.setState((prevState: any) => ({
												name: {
													...prevState.name,
													[language]: value,
												},
												hasUnsavedFields: true,
											}));
										}}
									/>
								</Col>
								<Col xs={24}>
									<label
										htmlFor="image_category"
										className="GenericLabel --label-required"
									>
										{Strings.gallery.category}
									</label>
									<Select
										id="image_category"
										style={{ width: "100%" }}
										placeholder={Strings.gallery.category}
										showSearch
										filterOption={(
											input: any,
											option: any
										) =>
											option.children
												.toLowerCase()
												.indexOf(input.toLowerCase()) >=
											0
										}
										value={category || null}
										onChange={(category: any) =>
											this.setState({ category })
										}
									>
										{categories.map((category: any) => (
											<Select.Option
												key={`category_${category?.name}`}
												value={category._id}
											>
												{translate(category.name)}
											</Select.Option>
										))}
									</Select>
								</Col>
							</Row>
						</Col>
					</Row>
				</ContentWrapper>
			</React.Fragment>
		);
	}

	renderAudio() {
		const { image, audio, name, category, categories, language } = this.state;

		return (
			<ContentWrapper extraStyle={{ padding: 20 }}>
				<Row gutter={[20, 20]}>
					<Col xs={24} md={6}>
						<div className="GalleryItem">
							<Dropzone
								accept="image/jpg, image/jpeg, image/png"
								className="GenericImageUpload"
								onDrop={(files: any) => this.onDrop(files)}
							>
								{image ? (
									<div
										className="GalleryItemImage"
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
											{Strings.generic.changeImage}
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
					<Col xs={24} md={6}>
						{audio ? (
							<div className="AudioElement">
								<audio controls src={audio?.preview || audio}>
									Your browser does not support the
									<code>audio</code> element.
								</audio>
							</div>
						) : (
							<div className="GalleryItem">
								<Dropzone
									accept="audio/mpeg, audio/mp3, audio/mp4, audio/ogg"
									className="GenericImageUpload"
									onDrop={(files: any) => {
										if (files?.length) {
											this.onAudioDrop(files);
										}
									}}
								>
									<div className="GenericImageUploadOverlay --visible">
										<Icon name="volume" />
										<span>
											{Strings.generic.changeAudio}
										</span>
									</div>
								</Dropzone>
							</div>
						)}
					</Col>
					<Col xs={24} md={12}>
						<Row gutter={[0, 20]}>
							<Col xs={24}>
								<label
									htmlFor="image_name"
									className="InputLabel --label-required"
								>
									{Strings.fields.name}
								</label>
								<Input
									id="image_name"
									value={name?.[language] || ""}
									placeholder={Strings.fields.name}
									onChange={(event: any) => {
										const value = event.target.value;
										this.setState((prevState: any) => ({
											name: {
												...prevState.name,
												[language]: value,
											},
											hasUnsavedFields: true,
										}));
									}}
								/>
							</Col>
							<Col xs={24}>
								<label
									htmlFor="image_category"
									className="GenericLabel --label-required"
								>
									{Strings.gallery.category}
								</label>
								<Select
									id="image_category"
									style={{ width: "100%" }}
									placeholder={Strings.gallery.category}
									showSearch
									filterOption={(input: any, option: any) =>
										option.children
											.toLowerCase()
											.indexOf(input.toLowerCase()) >= 0
									}
									value={category || null}
									onChange={(category: any) =>
										this.setState({ category })
									}
								>
									{categories.map((category: any) => (
										<Select.Option
											key={`category_${category?.name}`}
											value={category._id}
										>
											{translate(category.name)}
										</Select.Option>
									))}
								</Select>
							</Col>
						</Row>
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
						<p>{Strings.gallery.notificationText}</p>
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
							{Strings.gallery.notificationText}
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
								Strings.gallery.notificationText
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

	renderContent() {
		const { description, language } = this.state;

		return (
			<ContentWrapper extraStyle={{ padding: 20 }}>
				<div className="GenericHeader">
					<div className="GenericTitle">
						<Icon name="text-files" />
						<p>{Strings.gallery.content}</p>
					</div>
				</div>
				<Editor
					key={`editor_${language}`}
					required
					init={{ height: 500 }}
					value={description?.[language]}
					onChange={(value: any) =>
						this.setState((prevState: any) => ({
							description: {
								...prevState.description,
								[language]: value,
							},
							hasUnsavedFields: true,
						}))
					}
				/>
			</ContentWrapper>
		);
	}

	arrayMove(arr: any, oldIndex: any, newIndex: any) {
		if (newIndex >= arr.length) {
			var k = newIndex - arr.length + 1;
			while (k--) {
				arr.push(undefined);
			}
		}
		arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
	};

	renderSurveys() {
		const { surveyQuestions = [], surveyResults = [], language: lang } = this.state;
		const { language } = this.props;

		let locale = pt;
		if (language === 'es') {
			locale = es;
		} else if (language === 'en') {
			locale = en;
		}

		return (
			<React.Fragment>
				<ConfigProvider locale={locale}>
					<Table
						title={{
							icon: "text-files",
							title: Strings.gallery.questions,
						}}
						smallTitle
						data={surveyQuestions}
						columns={[
							{
								Header: Strings.gallery.question,
								id: "question",
								accessor: (row: any) => translate(row.question) || "-",
							},
						]}
						filterable
						draggable
						onDrag={async (list: any, dragIndex: any, hoverIndex: any) => {
							this.setState({ dragIndex, hoverIndex });
						}}
						onDragEnd={() => {
							const { dragIndex, hoverIndex } = this.state;

							this.arrayMove(surveyQuestions, dragIndex, hoverIndex);
							this.setState({ surveyQuestions });
						}}
						add={{
							onClick: () => {
								this.setState({
									openQuestionDrawer: true,
									tempQuestion: {
										type: 'add',
										question: null,
										answers: [
											{
												answer: null,
												value: null,
											},
										],
									},
								});
							}
						}}
						actions={{
							remove: (original: any) => ({
								onClick: () => {
									const index = surveyQuestions.findIndex((question: any) => JSON.stringify(question) === JSON.stringify(original));
									if (index !== -1) {
										surveyQuestions.splice(index, 1);
										this.setState({ surveyQuestions });
									}
								},
							}),
							edit: (original: any) => ({
								onClick: () => {
									const index = surveyQuestions.findIndex((survey: any) => JSON.stringify(survey) === JSON.stringify(original));

									if (index !== -1) {
										this.setState({
											tempQuestion: {
												type: 'edit',
												index,
												...JSON.parse(JSON.stringify(surveyQuestions[index])),
											},
											openQuestionDrawer: true,
										});
									}
								},
							}),
						}}
					/>
				</ConfigProvider>
				<ContentWrapper extraStyle={{ padding: 20, marginTop: 10 }}>
					<div className="GenericHeader">
						<div className="GenericTitle">
							<Icon name="text-files" />
							<p>{Strings.gallery.results}</p>
						</div>
						<button
							className="SurverResultsAdd"
							onClick={() => {
								const item = surveyResults[surveyResults.length - 1];

								if (item.minValue == null || item.maxValue == null || !translate(item.result)) {
									return Notification.warn({
										message: Strings.gallery.results,
										description: Strings.errors.invalidFields,
										placement: 'bottomRight',
										duration: 5,
									});
								}

								if (item.minValue > item.maxValue) {
									return Notification.warn({
										message: Strings.gallery.results,
										description: Strings.errors.invalidFields,
										placement: 'bottomRight',
										duration: 5,
									});
								}

								surveyResults.push({
									minValue: +item.maxValue + 1,
									maxValue: null,
									result: null,
									description: null,
								});

								this.setState({ surveyResults });
							}}
						>
							<Icon name="plus" />
						</button>
					</div>
					<div className="SurveyResultsList">
						{surveyResults.map((result: any, index: number) => {
							return (
								<React.Fragment key={`result_${index}`}>
									{index > 0 && (
										<div className="SurveyResultSeparator">
											<div className="SurveySeparator" />
											{index === (surveyResults.length - 1) && (
												<button
													onClick={() => {
														surveyResults.splice(index, 1);
														this.setState({ surveyResults, hasUnsavedFields: true });
													}}
												>
													<Icon name="trash" />
												</button>
											)}
										</div>
									)}
									<Row gutter={[10, 10]}>
										<Col xs={6}>
											<label
												htmlFor={`result_min_value_${index}`}
												className="GenericLabel --label-required"
											>
												{Strings.gallery.minValue}
											</label>
											<InputNumber
												id={`result_min_value_${index}`}
												value={result?.minValue}
												min={index === 0 ? 0 : (+surveyResults[index - 1].maxValue + 1)}
												disabled={index > 0 || (index === 0 && surveyResults.length > 1)}
												step={1}
												style={{ width: '100%' }}
												placeholder={Strings.gallery.minValue}
												onChange={(value: any) => {
													result.minValue = value;

													this.setState({ surveyResults, hasUnsavedFields: true });
												}}
											/>
										</Col>
										<Col xs={6}>
											<label
												htmlFor={`result_max_value_${index}`}
												className="GenericLabel --label-required"
											>
												{Strings.gallery.maxValue}
											</label>
											<InputNumber
												id={`result_max_value_${index}`}
												value={result?.maxValue}
												step={1}
												min={result.minValue != null ? +result.minValue : 1}
												disabled={index !== surveyResults.length - 1}
												style={{ width: '100%' }}
												placeholder={Strings.gallery.maxValue}
												onChange={(value: any) => {
													result.maxValue = value;

													this.setState({ surveyResults, hasUnsavedFields: true });
												}}
											/>
										</Col>
										<Col xs={12}>
											<label
												htmlFor={`result_result_${index}`}
												className="InputLabel --label-required"
											>
												{Strings.gallery.result}
											</label>
											<Input
												id={`result_result_${index}`}
												value={result?.result?.[lang] || ""}
												placeholder={Strings.gallery.result}
												style={{ height: 40 }}
												onChange={(event: any) => {
													if (!result.result) {
														result.result = {};
													}

													result.result[lang] = event.target.value;

													this.setState({ surveyResults, hasUnsavedFields: true });
												}}
											/>
										</Col>
										<Col xs={24}>
											<label
												htmlFor={`result_description_${index}`}
												className="InputLabel"
											>
												{Strings.fields.description}
											</label>
											<Input.TextArea
												id={`result_description_${index}`}
												value={result?.description?.[lang] || ""}
												rows={3}
												placeholder={Strings.fields.description}
												onChange={(event: any) => {
													if (!result.description) {
														result.description = {};
													}

													result.description[lang] = event.target.value;

													this.setState({ surveyResults, hasUnsavedFields: true });
												}}
											/>
										</Col>
									</Row>
								</React.Fragment>
							)
						})}
					</div>
				</ContentWrapper>
			</React.Fragment>
		);
	}

	saveQuestion() {
		const { tempQuestion, surveyQuestions } = this.state;

		if (!translate(tempQuestion?.question)) {
			return Notification.warn({
				message: Strings.gallery.questions,
				description: Strings.errors.invalidFields,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		if (tempQuestion?.answers?.length < 2) {
			return Notification.warn({
				message: Strings.gallery.questions,
				description: Strings.gallery.needAtLeastTwo,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		if (!translate(tempQuestion?.answers?.[tempQuestion?.answers.length - 1]?.answer)) {
			return Notification.warn({
				message: Strings.gallery.questions,
				description: Strings.gallery.invalidAnswer,
				placement: 'bottomRight',
				duration: 5,
			});
		}

		if (tempQuestion?.type === 'add') {
			delete tempQuestion.type;
			surveyQuestions.push(tempQuestion);
		} else {
			const index = tempQuestion.index;
			delete tempQuestion.index;

			surveyQuestions[index] = tempQuestion;
		}

		this.setState({ surveyQuestions, tempQuestion: {}, openQuestionDrawer: false, hasUnsavedFields: true });
	}

	render() {
		const { type } = this.state;

		return (
			<React.Fragment>
				<Helmet>
					<title>{Strings.sidebar.gallery}</title>
					<meta name="description" content="Description of Gallery" />
				</Helmet>
				<div className="GalleryItemScreen">
					{type === "article" && (
						<React.Fragment>
							{this.renderArticle()}
							{this.renderContent()}
						</React.Fragment>
					)}
					{type === "survey" && (
						<React.Fragment>
							{this.renderImage()}
							{this.renderSurveys()}
						</React.Fragment>
					)}
					{type === "video" && this.renderVideo()}
					{type === "audio" && this.renderAudio()}
					{this.renderNotification()}
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state: any) => ({
	language: state.language,
});

export default connect(mapStateToProps)(GalleryItem);
