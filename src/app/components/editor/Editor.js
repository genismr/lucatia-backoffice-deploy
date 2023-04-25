import React from 'react'
import clsx from 'clsx'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import FullEditor from 'ckeditor5-build-full'

import { configuration } from './editorConfiguration'

// import { uploadSingleFile } from '../../../api/files'
// import { SERVER_URL } from '../../../api'

import './editor.css'

function Editor({ body, setBody, placeholder = '', /* folder = 'unclassified', */ disabled = false, className, lang = 'en' }) {
	// function uploadAdapter(loader) {
	// 	return {
	// 		upload: () => {
	// 			return new Promise((resolve, reject) => {
	// 				loader.file
	// 					.then((file) => {
	// 						uploadSingleFile(file/* , folder */)
	// 							.then((res) => {
	// 								resolve({
	// 									default: `${SERVER_URL}/${res.data.fileURL}`
	// 								})
	// 							})
	// 					})
	// 					.catch(error => reject(new Error(error || 'Could not upload image')))
	// 			})
	// 		}
	// 	}
	// }
	// function uploadPlugin(editor) {
	// 	editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
	// 		return uploadAdapter(loader)
	// 	}
	// }

	return (
		<div className={clsx('custom-editor', className)}>
			<CKEditor
				editor={ FullEditor }
				config={{ placeholder, ...configuration, language: lang }}
				// config = {{ extraPlugins: [uploadPlugin], ...configuration }}
				data={body}
				onChange={ ( event, editor ) => {
					const data = editor.getData()
					setBody(data)
				} }
				disabled={disabled}
			/>
		</div>
	)

}

export default Editor
