/**
 *
 * EditSidebar
 *
 */

import React from 'react';
import './styles.scss';
import Strings from 'utils/strings';
import { Row, Col, DatePicker, Switch, Form, Input, Button, Drawer, Select, AutoComplete, TimePicker, notification } from 'antd';
import PhoneInput from 'components/PhoneInput';
import Dropzone from "react-dropzone";
import { Icon } from "components";
import Compressor from "compressorjs";
import moment from 'moment';
import userPlaceholder from "assets/images/placeholders/user.jpg";
import placeholder from "assets/images/placeholders/image.jpg";

import en from 'antd/lib/date-picker/locale/en_GB';

const { RangePicker } = DatePicker;
const { Option } = Select;

export class EditSidebar extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			originalCopy: null,
			language: 'en',
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps: any) {
		const { open, fields } = nextProps;

		if (open && !this.props.open) {
			this.setState({ originalCopy: JSON.stringify(fields) });
		}
	}

	getBase64 = (file: any) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	}

	onDrop = (files: any, field: any) => {
		try {
			const file = files[files.length - 1];

			new Compressor(file, {
				quality: 0.9,
				maxWidth: 400,
				mimeType: "image/jpeg",
				success: (result: any) => {
					this.getBase64(result).then((res) => {
						this.props.onChange(field.field, { file: result, preview: res });
					});
				},
			});
		} catch (err) {
			notification.warn({
				message: Strings.errors.unsupportedFile,
				description: Strings.errors.notSupportedFile,
				placement: 'bottomRight',
				duration: 5,
			});
		}
	}

	hoverOnFile = (index: any) => {
		this.setState({ fileToDelete: index });
	}

	hoverOffFile = () => {
		this.setState({ fileToDelete: null });
	}

	removeFile = (field: any, index: any) => {
		const { onChange, defaultValue } = this.props;

		const auxFiles = defaultValue[field];
		auxFiles.splice(index, 1);

		onChange(field, auxFiles);
	}

	onDropFile = async (files: any, field: any) => {
		try {
			const { onChange, defaultValue } = this.props;

			if (field.multiple) {
				const auxFiles: any = defaultValue[field.field] || [];

				for (const file of files) {
					let reader = new FileReader();

					reader.onload = function (e: any) {
						let blob = new Blob([new Uint8Array(e.target.result)], { type: file.type });
						auxFiles.push({ file: blob, fileName: file.name });
						onChange(field.field, auxFiles);
					};
					reader.readAsArrayBuffer(file);
				}
			} else {
				const file = files[files.length - 1]
				let reader = new FileReader();
				reader.onload = function (e: any) {
					let blob = new Blob([new Uint8Array(e.target.result)], { type: file.type });
					onChange(field.field, [{ file: blob, fileName: file.name }]);
				};
				reader.readAsArrayBuffer(file);
			}

			this.setState({ fileToDelete: null });
		} catch (err) {
			notification.warn({
				message: Strings.errors.unsupportedFile,
				description: Strings.errors.notSupportedFile,
				placement: 'bottomRight',
				duration: 5,
			});
		}
	}

	deletePhoto() {
		this.setState((state: any) => ({
			photo: null,
			hasUnsavedFields: { ...state.hasUnsavedFields, profile: true },
		}));
	}

	renderFields() {
		const { fields = [], doubleColumn, reduceMarginBottom } = this.props;

		return (
			<React.Fragment>
				<Row gutter={[24, 0]} className={reduceMarginBottom && 'reduceMarginBottom'}>
					{fields.map((field: any, index: any) => {
						if (!field.name || !field.field) return null;
						if (doubleColumn) {
							return <Col xs={12} key={`field-${field.name}-${index}`}>
								{this.renderField(field)}
							</Col>
						} else {
							return <Col xs={24} key={`field-${field.name}-${index}`}>
								{this.renderField(field)}
							</Col>
						}
					})}
				</Row>
			</React.Fragment>
		);
	}

	renderField(field: any) {
		switch (field.type) {
			case 'input':
			case 'password':
				return this.renderInput(field);
			case 'numericInput':
				return this.renderNumericInput(field)
			case 'TextArea':
				return this.renderTextArea(field);
			case 'phoneInput':
				return this.renderPhoneInput(field);
			case 'toggle':
			case 'check':
				return this.renderToggle(field);
			case 'photo':
				return this.renderDropzone(field);
			case 'image':
				return this.renderImageDropzone(field);
			case 'tagsSelector':
				return this.renderTagsSelector(field);
			case 'selector':
				return this.renderSelector(field);
			case 'inputSelector':
				return this.renderInputSelector(field);
			case 'rangeDatePicker':
				return this.renderRangeDatePicker(field);
			case 'datePicker':
				return this.renderDatePicker(field);
			case 'timePicker':
				return this.renderHourPicker(field);
			case 'filePicker':
				return this.renderFilePicker(field);
			default:
				return null;
		}
	}

	renderDropzone = (field: any) => {
		const { onChange, defaultValue } = this.props;
		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<div className="ProfilePictureContainer">
					<div className="ProfilePicture">
						<img
							alt={Strings.profile.profilePicture}
							src={
								(defaultValue && (defaultValue[field.field]?.preview ? defaultValue[field.field].preview : defaultValue[field.field])) || userPlaceholder
							}
						/>
						<div className="ProfilePictureOverlay">
							<Dropzone
								accept="image/jpg, image/jpeg, image/png"
								className="ProfilePictureOverlayOption"
								onDrop={file => this.onDrop(file, field)}
							>
								<Icon name="pencil-outline" />
							</Dropzone>
							<div
								className={`ProfilePictureOverlayOption${Boolean(defaultValue[field.field]) ? "" : " __disabled"
									}`}
								onClick={() => onChange(field.field, null)}
							>
								<Icon name="trash" />
							</div>
						</div>
					</div>
				</div>
			</Form.Item>
		);
	}

	renderImageDropzone = (field: any) => {
		const { onChange, defaultValue } = this.props;
		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<div className="ImageContainer">
					<div className="Image">
						<img
							alt={Strings.profile.profilePicture}
							src={
								(defaultValue && (defaultValue[field.field]?.preview ? defaultValue[field.field].preview : defaultValue[field.field])) || placeholder
							}
						/>
						<div className="ImageOverlay">
							<Dropzone
								accept="image/jpg, image/jpeg, image/png"
								className="ImageOverlayOption"
								onDrop={file => this.onDrop(file, field)}
							>
								<Icon name="pencil-outline" />
							</Dropzone>
							<div
								className={`ImageOverlayOption${Boolean(defaultValue[field.field]) ? "" : " __disabled"
									}`}
								onClick={() => onChange(field.field, null)}
							>
								<Icon name="trash" />
							</div>
						</div>
					</div>
				</div>
			</Form.Item>
		);
	}

	renderInput = (field: any) => {
		const { onChange, defaultValue, language } = this.props;

		return (
			<Form.Item
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
				initialValue={field.value ||
					(defaultValue && (typeof defaultValue[field.field] === 'object' ?
						defaultValue[field.field]?.[language] :
						defaultValue[field.field]))}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				{field.type === 'password' ?
					<Input.Password
						type="password"
						value={field.value}
						onChange={(e: any) => {
							e.preventDefault();

							if (onChange) {
								onChange(field.field, e.target.value);
							}
						}}
						className="ProfileInputClass"
						placeholder={field.name}
						required={field.required}
					/> : <Input
						type={field.type}
						placeholder={field.name}
						value={field.value}
						defaultValue={field.defaultValue}
						onChange={e => {
							e.preventDefault();

							if (onChange) {
								onChange(field.field, e.target.value);
							}
						}}>
					</Input>}
			</Form.Item>
		)
	}

	renderNumericInput = (field: any) => {
		const { language } = this.state;
		const { onChange, defaultValue } = this.props;

		return (
			<Form.Item
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
				initialValue={field.value ||
					(defaultValue && (typeof defaultValue[field.field] === 'object' ?
						defaultValue[field.field][language] :
						defaultValue[field.field]))}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				<Input
					type="number"
					min={0}
					placeholder={field.name}
					defaultValue={field.value}
					onChange={e => {
						e.preventDefault();

						if (onChange) {
							onChange(field.field, e.target.value);
						}
					}}>
				</Input>
			</Form.Item>
		)
	}

	renderTextArea = (field: any) => {
		const { language } = this.state;
		const { onChange, defaultValue } = this.props;

		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				<Input.TextArea
					placeholder={field.name}
					defaultValue={field.value ||
						((defaultValue && (typeof defaultValue[field.field] === 'object' ?
							defaultValue[field.field][language] :
							defaultValue[field.field])))}
					onChange={e => {
						e.preventDefault();

						if (onChange) {
							onChange(field.field, e.target.value);
						}
					}}>
				</Input.TextArea>
			</Form.Item>
		)
	}

	renderPhoneInput = (field: any) => {
		const { onChange, defaultValue } = this.props;
		const defaultCountry = 'pt';
		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				<PhoneInput
					key={`phone_${field.disabled}_${JSON.stringify(defaultCountry)}`}
					defaultCountry={defaultCountry && defaultCountry.toLowerCase()}
					value={(defaultValue && defaultValue[field.field]) || ''}
					disabled={field.disabled}
					inputClass={`input-phone ${field.disabled ? 'phone-disabled' : ''}`}
					onChange={(value: any) => {
						if (onChange) {
							onChange(field.field, value);
						}
					}}
				/>
			</Form.Item>
		)
	}

	renderToggle = (field: any) => {
		const { onChange, defaultValue } = this.props;
		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<div className="General_ColorFul_Switch">
					<span>{field.name}</span>
					<Switch
						checked={(defaultValue && defaultValue[field.field]) || false}
						size='small'
						onChange={(value) => onChange(field.field, value)}
					/>
				</div>
			</Form.Item>
		);
	}

	renderTagsSelector = (field: any) => {
		const { defaultValue } = this.props;
		const children = [];
		for (let val of field.options)
			children.push(<Option key={val} value={val}>{val}</Option>);

		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				<Select
					mode="multiple"
					allowClear
					className="tagsSelector"
					style={{ width: '100%' }}
					placeholder={Strings.generic.code}
					defaultValue={defaultValue && defaultValue[field.field]}
					onChange={(elem: any) => this.props.onChange(field.field, elem)}
				>
					{children}
				</Select>
			</Form.Item>
		);
	}

	renderSelector = (field: any) => {
		const { defaultValue } = this.props;
		const children = [];
		if (!field.populated) {
			for (let val of field.options)
				children.push(<Option key={val} value={val}>{val}</Option>);
		}
		else {
			for (let val of field.options)
				children.push(val);
		}

		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				<Select
					key={defaultValue && defaultValue[field.field]}
					className="tagsSelector"
					style={{ width: '100%' }}
					placeholder={field.name}
					disabled={field.disabled}
					showSearch
					defaultValue={defaultValue ?
						typeof defaultValue[field.field] === 'string' ?
							defaultValue[field.field] :
							field.value :
						undefined}
					onChange={(elem: any) => this.props.onChange(field.field, elem)}
				>
					{children}
				</Select>
			</Form.Item>
		);
	}

	renderInputSelector = (field: any) => {
		const { defaultValue } = this.props;
		const children = [];
		if (!field.populated) {
			for (let val of field.options)
				children.push({ key: val, value: val });
		}
		else {
			for (let val of field.options)
				children.push(val);
		}

		const value = defaultValue ?
			typeof defaultValue[field.field] === 'string' ?
				defaultValue[field.field] :
				field.value :
			undefined;

		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.name}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				<AutoComplete
					style={{ width: '100%' }}
					options={children}
					placeholder={field.name}
					defaultValue={value}
					disabled={field.disabled}
					onChange={(elem: any) => this.props.onChange(field.field, elem)}
					filterOption={(inputValue, option) =>
						option?.props?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
					}
				/>
			</Form.Item>
		);
	}

	renderRangeDatePicker = (field: any) => {
		const { onChange } = this.props;
		const {
			value,
			name,
		} = field as any;

		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<React.Fragment key={`range_picker_${name}`}>
					<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{name}</label>
					<div
						className="BreadcrumbRangeDatePicker"
					>
						<RangePicker
							style={{ width: '100%' }}
							locale={en}
							allowEmpty={[false, false]}
							ranges={{
								[Strings.ranges.today]: [moment(), moment()],
								[Strings.ranges.thisMonth]: [
									moment().startOf('month'),
									moment().endOf('month'),
								],
								[Strings.ranges.lastMonth]: [
									moment().subtract(1, 'month').startOf('month'),
									moment().subtract(1, 'month').endOf('month'),
								],
								[Strings.ranges.thisYear]: [
									moment().startOf('year'),
									moment().endOf('month'),
								],
								[Strings.ranges.lastYear]: [
									moment().subtract(1, 'year').startOf('year'),
									moment().subtract(1, 'year').endOf('year'),
								],
							}}
							placeholder={[
								Strings.fields.startDate,
								Strings.fields.endDate,
							]}
							separator={<Icon name="arrow-up" className="__turn90" />}
							defaultValue={value}
							onChange={(value: any) => onChange(field.field, value)}
						/>
					</div>
				</React.Fragment>
			</Form.Item>
		);
	}

	renderDatePicker = (field: any) => {
		const { onChange, defaultValue } = this.props;
		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				<DatePicker
					style={{
						display: 'flex',
						flexDirection: 'column',
					}}
					placeholder={field.name}
					defaultValue={defaultValue ?
						typeof defaultValue[field.field] === 'string' ?
							moment(defaultValue[field.field]) :
							defaultValue[field.field] :
						undefined}
					onChange={value => {
						if (onChange) {
							onChange(field.field, value);
						}
					}}>
				</DatePicker>
			</Form.Item>
		)
	}


	renderHourPicker = (field: any) => {
		const { onChange, defaultValue } = this.props;

		return (
			<Form.Item
				key={`field_${field.field}`}
				name={field.name}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				<TimePicker
					style={{
						display: 'flex',
						flexDirection: 'column',
					}}
					format={'HH:mm'}
					placeholder={field.name}
					defaultValue={defaultValue ?
						typeof defaultValue[field.field] !== 'object' ?
							moment(defaultValue[field.field]) :
							defaultValue[field.field] :
						undefined}
					onChange={value => {
						if (onChange) {
							onChange(field.field, value);
						}
					}} />
			</Form.Item>
		)
	}

	renderFilePicker = (field: any) => {
		const { fileToDelete } = this.state;
		const { defaultValue } = this.props;

		return (
			<Form.Item
				name={field.field}
				rules={[
					{
						required: field.required ? field.required : false,
						message: field.message ? field.message : '',
					},
				]}
			>
				<label className={`SingleLabel${field.required ? ' __required' : ''}`}>{field.name}</label>
				<Dropzone
					accept=".pdf"
					multiple={field.multiple || false}
					className="ant-input"
					onDrop={files => this.onDropFile(files, field)}>
					<Icon name="file" style={{ marginRight: '10px' }} /><span style={{ color: '#bfbfbf' }}>{Strings.fields.clickToUpload}</span>
				</Dropzone>
				<div className="filesList"
					key={defaultValue && defaultValue[field.field] && defaultValue[field.field].value}>
					{defaultValue && defaultValue[field.field] && defaultValue[field.field].map((file: any, index: any) =>
						<div
							key={`file-${index}-${file?.fileName}`}
							className="fileItem"
							onMouseEnter={() => this.hoverOnFile(index)}
							onMouseLeave={this.hoverOffFile}>

							<Icon name={fileToDelete === index ? "close" : "file"} onClick={() => this.removeFile(field.field, index)} className="fileIcon" style={{ marginRight: '10px' }} />
							{typeof file === 'string' ?
								<a href={file} className="fileName">{file}</a> :
								<span className="fileName">{file.fileName}</span>
							}
						</div>
					)}
				</div>
			</Form.Item>
		);
	}

	renderForm() {
		const { open } = this.props;

		return (
			<Form key={`form_${JSON.parse(JSON.stringify(this.state.originalCopy || 'new_')) + open}`} style={{ paddingTop: '10px' }}>
				{this.renderFields()}
			</Form>
		);
	}


	render() {
		const { onClose, open, onSubmit, title, doubleColumn, hideFooter } = this.props;

		return (
			<Drawer
				className={`drawer ${doubleColumn ? '__doubleColumn' : '__singleColumn'}`}
				title={title}
				placement="right"
				style={{
					position: 'absolute',
					overflow: 'hidden',
				}}
				onClose={onClose}
				visible={open}
				footer={!hideFooter && (
					<div className="footer">
						<Button className="cancelButton" onClick={onClose} style={{ marginRight: 8 }}>
							{Strings.generic.cancel}
						</Button>
						<Button className="submitButton" onClick={onSubmit} type="primary">
							{Strings.generic.submit}
						</Button>
					</div>
				)}
			>
				{this.renderForm()}
			</Drawer>
		);
	}
}

export default EditSidebar;
