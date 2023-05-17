import { authClient, API } from '../index'
import { uploadSingleFile } from '../files';

export const postAsset = async (asset, file, accessToken) => {
  if (file) {
		const response = await uploadSingleFile(file);
		asset.url = response.data;
	}

  return authClient(accessToken).post(`${API}/asset`, asset)
}

export const assignTags = (assetId, tags, accessToken) => {
  return authClient(accessToken).post(`${API}/asset/${assetId}/assign-tags`, tags)
}

export const unassignTags = (assetId, tags, accessToken) => {
  return authClient(accessToken).post(`${API}/asset/${assetId}/unassign-tags`, tags)
}

export const getAssets = (accessToken) => {
  return authClient(accessToken).get(`${API}/asset`)
}

export const getAssetById = (id, accessToken) => {
  return authClient(accessToken).get(`${API}/asset/${id}`)
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

export const updateAsset = async (id, asset, file, accessToken) => {
  if (file) {
		const response = await uploadSingleFile(file);
		asset.url = response.data;
	}
  return authClient(accessToken).put(`${API}/asset/${id}`, asset)
}


export const deleteAsset = (id, accessToken) => {
  return authClient(accessToken).delete(`${API}/asset/${id}`)
}

