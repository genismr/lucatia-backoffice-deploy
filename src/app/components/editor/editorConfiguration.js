export const configuration = {
	toolbar: {
		items: [
			// 'removeFormat',
			// '|',
			'heading',
			'|',
			'fontSize',
			// 'fontFamily',
			'fontColor',
			'fontBackgroundColor',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			// 'code',
			// 'subscript',
			// 'superscript',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'alignment',
			'indent',
			'outdent',
			'|',
			'link',
			// 'insertTable',
			// 'specialCharacters',
			// 'imageUpload',
			// 'mediaEmbed',
			// 'htmlEmbed',
			'|',
			'highlight',
			'blockQuote',
			// 'horizontalLine',
			// 'pageBreak',
			// '|',
			// 'restrictedEditingException',
			'|',
			'undo',
			'redo'
		]
	},
	blockToolbar: [
		'heading',
		'fontSize',
		'fontColor',
		'fontBackgroundColor',
		'alignment',
		'|',
		'bulletedList',
		'numberedList',
		'|',
		'blockQuote',
		'imageUpload'
	],
	fontSize: {
		options: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28]
	},
	image: {
		toolbar: [
			'imageStyle:alignLeft',
			'imageStyle:full',
			'imageStyle:alignRight',
			'|',
			'imageTextAlternative'
		],
		styles: ['full', 'side', 'alignLeft', 'alignCenter', 'alignRight']
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableProperties',
			'tableCellProperties'
		]
	}
}