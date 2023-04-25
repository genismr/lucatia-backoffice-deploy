import { authClient, API } from '../index'

//Post asset
export const postAsset = (asset) => {
  delete asset.id
  console.log(asset)
  return authClient().post(`${API}/asset`, asset)
}

//Assign tag to asset
export const assignTags = (assetId, tags) => {
  return authClient().post(`${API}/asset/${assetId}/assignTags`, tags)
}

//Unassign tag from asset
export const unassignTags = (assetId, tags) => {
  return authClient().post(`${API}/asset/${assetId}/unassignTags`, tags)
}

//Get assets
export const getAssets = () => {
  return authClient().get(`${API}/asset`)
}

//Get asset by id
export const getAssetById = (id) => {
  return authClient().get(`${API}/asset/${id}`)
}

//Get types
export const getTypes = () => {
  return authClient().get(`${API}/type`)
}

//Get categories
export const getCategories = () => {
  return authClient().get(`${API}/category`)
}
//Get formats
export const getFormats = () => {
  return authClient().get(`${API}/format`)
}
//Get extensions
export const getExtensions = () => {
  return authClient().get(`${API}/extension`)
}

//Get tags
export const getTags = () => {
  return authClient().get(`${API}/tag`)
}

//Get tags
export const updateAsset = (id, asset) => {
  return authClient().put(`${API}/asset/${id}`, asset)
}

// Delete user
export const deleteAsset = (id) => {
  return authClient().delete(`${API}/asset/${id}`)
}

