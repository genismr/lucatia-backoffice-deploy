import Swal from 'sweetalert2'

// Error messages from api returned as {message: 'error message text'}
export const logError = ({ error, customMessage = 'No custom message from backoffice' }) => {
  error?.response?.status
  	? console.log (
  		'ERROR\n' +
        `Status: ${error.response.status}.\n` +
        `Status error: ${error.response.statusText}.\n` +
        `API Message: ${error.response.data?.message}\n` +
        `Backoffice Message: ${customMessage}`
  	)
  	: console.log (
  		'ERROR\n' +
        `Backoffice message: ${customMessage}\n` +
        `${error}`
  	)
}

export const logFormData = (formData) => {
	console.group('FormData')
	for (let pair of formData.entries())
		console.log('key:', pair[0]+ ', value: '+ pair[1])

	console.groupEnd('FormData')
}

export const alertError = ({ error, customMessage }) => {
	console.log('alertError called')
	const message =
    error?.response?.data?.message ||
    error?.response?.statusText ||
    error ||
    customMessage ||
    'Error has no message'

	const params = {
		icon: 'error',
		title: (customMessage?.length < 30 && customMessage) || 'Ooops...',
		text: message
	}

	Swal.fire(params)
}

export const alertSuccess = ({ customMessage } = {}) => {
	console.log('alertSuccess called')
	const message =
    customMessage ||
    'Successfull operation!'

	const params = {
		icon: 'success',
		title: 'Ok!',
		text: message
	}

	Swal.fire(params)
}