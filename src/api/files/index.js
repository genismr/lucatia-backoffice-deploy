import { API, authClient } from '../index'

export const uploadSingleFile = (file) => {
	if (!file)
		return Promise.reject(new Error('File must be provided'))	
		
	const formData = new FormData()
	formData.append('file', file)
	
	return authClient().post(`${API}/files`, formData)
}

export const uploadFilesGetLinks = async (files, folder) => {
	let tmp_filesURLs = {}

	for (const key in files) {
		if (files[key] !== null && files[key] !== undefined && files[key] !== '') {
			const res = await uploadSingleFile(files[key], folder)
			if (res && res.status === 200 && res.data?.fileURL)
				tmp_filesURLs[key] = res.data.fileURL
		}
	}

	return Object.values(tmp_filesURLs)
}