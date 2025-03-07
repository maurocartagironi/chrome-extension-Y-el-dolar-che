export const formatCurrency = (value: string): string => {
	if (Number.parseFloat(value) === 0 || Number.parseFloat(value) === Infinity) {
		return '';
	}
	const formatter = new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
	});

	const valueFormatted = value ? formatter.format(parseFloat(value)) : '';
	return valueFormatted;
};

export const calculateTimeDifference = (dateToCompare: any): string => {
	const timeDifferenceInSeconds = (Date.now() - Date.parse(dateToCompare)) / 1000;

	const inDays = Math.floor(timeDifferenceInSeconds / (60 * 60 * 24));
	const inHours = Math.floor(timeDifferenceInSeconds / (60 * 60));
	const inMinutes = Math.floor(timeDifferenceInSeconds / 60);
	const inSeconds = Math.floor(timeDifferenceInSeconds);

	return inDays > 0
		? inDays + chrome.i18n.getMessage('n_days')
		: inHours > 0
			? inHours + chrome.i18n.getMessage('n_hours')
			: inMinutes > 0
				? inMinutes + chrome.i18n.getMessage('n_mins')
				: inSeconds + chrome.i18n.getMessage('n_secs');
};
