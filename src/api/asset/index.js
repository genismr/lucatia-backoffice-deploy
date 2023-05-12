import { authClient, API } from '../index'
import { uploadSingleFile } from '../files';

export const postAsset = async (asset, file) => {
  if (file) {
		const response = await uploadSingleFile(file);
		asset.url = response.data;
	}

  return authClient().post(`${API}/asset`, asset)
}

export const assignTags = (assetId, tags) => {
  return authClient().post(`${API}/asset/${assetId}/assign-tags`, tags)
}

export const unassignTags = (assetId, tags) => {
  return authClient().post(`${API}/asset/${assetId}/unassign-tags`, tags)
}

export const getAssets = () => {
  return authClient().get(`${API}/asset`)
}

export const getAssetById = (id) => {
  return authClient().get(`${API}/asset/${id}`)
}

export const getTypes = () => {
  return authClient().get(`${API}/type`)
}

export const getCategories = () => {
  return authClient().get(`${API}/category`)
}

export const getFormats = () => {
  return authClient().get(`${API}/format`)
}
export const getExtensions = () => {
  return authClient().get(`${API}/extension`)
}

export const getTags = () => {
  return authClient().get(`${API}/tag`)
}

export const updateAsset = async (id, asset, file) => {
  if (file) {
		const response = await uploadSingleFile(file);
		asset.url = response.data;
	}
  return authClient().put(`${API}/asset/${id}`, asset)
}


export const deleteAsset = (id) => {
  return authClient().delete(`${API}/asset/${id}`)
}

