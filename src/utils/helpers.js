export function getKeyByValue(object, value) {
	return Object.keys(object).find((key) => object[key] === value);
}

export const delay = (n) => new Promise((r) => setTimeout(r, n * 1000));

export const getNonEmpty = (field) => {
	const defaultLanguage = "es";
	if (!field || !Object.keys(field)?.length) return "----";
	if (field[defaultLanguage] && field[defaultLanguage] !== "")
		return field[defaultLanguage];
	for (const lang of Object.keys(field)) {
		if (field[lang] && field[lang] !== "") return field[lang];
	}
	return "----";
};

export const checkIsEmpty = (field) => {
	return Object.values(field).every(
		(x) => x === null || x === "" || x === " "
	);
};

export const storeToSession = (key, value) => {
	window.sessionStorage.setItem(key, JSON.stringify(value));
};

export const removeFromSession = (key) => {
	window.sessionStorage.removeItem(key);
};

export const getFromSession = (key) => {
	let item = window.sessionStorage.getItem(key);
	if (item == "undefined" || item == null) return null;
	return JSON.parse(item);
};

export const getFileType = (fileName) => {
	if (!fileName) return "unknown";
	const ext = fileName.split(".").pop();
	switch (ext) {
		case "pdf":
			return "file";
		case "m4a":
			return "audio";
		case "mp3":
			return "audio";
		case "mpa":
			return "audio";
		case "wma":
			return "audio";
		case "aif":
			return "audio";
		case "cda":
			return "audio";
		case "mid":
			return "audio";
		case "midi":
			return "audio";
		case "ogg":
			return "audio";
		case "wav":
			return "audio";
		case "wpl":
			return "audio";
		case "jpg":
			return "image";
		case "jpeg":
			return "image";
		case "png":
			return "image";
		case "svg":
			return "image";
		case "gif":
			return "image";
		case "avi":
			return "video";
		case "m4v":
			return "video";
		case "mkw":
			return "video";
		case "mp4":
			return "video";
		case "wmv":
			return "video";
		case "mov":
			return "video";
		default:
			return "unknown";
	}
};

export const userRoles = {
	SUPER_ADMIN: 0,
	ADMIN_ENTIDAD: 10,
	MEDICO: 20,
	HELD_DESK: 20,
	USER: 30,
	DESIGNER: 100,
	GAME_CONSTRUCTOR: 100,
};
