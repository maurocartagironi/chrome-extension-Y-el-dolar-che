export const formatError = (message: string): string => {
	if(message) {
		return message + '\r' + chrome.i18n.getMessage("error_general_title") + '\r' + chrome.i18n.getMessage("error_general_description");
	}

	return chrome.i18n.getMessage("error_general_title") + '\r' + chrome.i18n.getMessage("error_general_description");
}