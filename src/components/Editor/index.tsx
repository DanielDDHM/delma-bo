/**
 *
 * Editor
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Editor as TinyEditor } from '@tinymce/tinymce-react';
// import Strings from 'utils/strings';
import './styles.scss';

const EditorRef = React.createRef<TinyEditor>();

export class Editor extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			id: `textarea_${(Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()}`,
		};
	}

	render() {
		const { init, onChange, required, label, disabled, language, ...editorProps } = this.props;
		const { hasNoContent } = this.state;

		if (language === 'pt') {
			init.language = 'pt_PT';
		}

		return (
			<div className={`EditorContainer${(required && hasNoContent) ? ' __hasErrors' : ''}`}>
				{label && (
					<label className={`SingleLabel${required ? ' __required' : ''}`}>
						{label}
					</label>
				)}
				<TinyEditor
					ref={EditorRef}
					disabled={disabled}
					init={{
						plugins: [
							'advlist autolink lists link charmap print preview anchor',
							'searchreplace visualblocks code fullscreen',
							'insertdatetime media table paste help wordcount'
						],
						content_style: '.mce-content-body { font-size: 14px }',
						image_uploadtab: true,
						paste_data_images: true,
						mobile: {
							menubar: true,
						},
						min_height: 300,
						// language: language === 'pt' ? 'pt_PT' : '',
						font_formats: 'Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats; Nunito=Nunito',
						toolbar: 'undo redo | styleselect | bold italic underline | fontsizeselect | alignleft aligncenter alignright alignjustify | outdent indent | link | numlist bullist',
						menubar: 'file edit insert view format table tools help',
						fontsize_formats: '10px 12px 13px 14px 15px 16px 18px 24px 36px 48px',
						theme: 'silver',
						convert_urls: false,
						...init,
					}}
					onEditorChange={(content: any, editor: any) => {
						onChange(content, editor);
					}}
					onBlur={() => {
						//
					}}
					{...editorProps}
				/>
				{/* <div className="ErrorContainer">
					<div className={`EditorError${hasNoContent ? ' __open' : ' __closed'}`}>
						{Strings.errors.fillField}
					</div>
				</div> */}
			</div>
		);
	}
}

const mapStateToProps = (state: any) => ({
	language: state.language,
});

export default connect(mapStateToProps)(Editor);
