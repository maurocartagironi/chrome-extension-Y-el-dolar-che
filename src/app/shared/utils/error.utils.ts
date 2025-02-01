export const formatError = (message: string): string => {
	if (message) {
		return (
			'<p>' +
			message +
			'</p><p>' +
			chrome.i18n.getMessage('error_general_title') +
			'</p><p>' +
			chrome.i18n.getMessage('error_general_description') +
			'</p>'
		);
	}

	return (
		'<p>' +
		chrome.i18n.getMessage('error_general_title') +
		'</p><p>' +
		chrome.i18n.getMessage('error_general_description') +
		'</p>'
	);
};
