const currencyFormatter = new Intl.NumberFormat('es-AR', {
	style: 'currency',
	currency: 'ARS',
	minimumFractionDigits: 2,
});

export const formatCurrency = (value: number | string): string => {
	const amount = typeof value === 'number' ? value : Number.parseFloat(value);
	if (!Number.isFinite(amount) || amount === 0) {
		return '';
	}
	return currencyFormatter.format(amount);
};

export const calculateTimeDifference = (dateToCompare: string | Date): string => {
	const parsed = dateToCompare instanceof Date ? dateToCompare.getTime() : Date.parse(dateToCompare);
	if (!Number.isFinite(parsed)) {
		return '';
	}

	const timeDifferenceInSeconds = Math.max(0, (Date.now() - parsed) / 1000);

	const inDays = Math.floor(timeDifferenceInSeconds / (60 * 60 * 24));
	const inHours = Math.floor(timeDifferenceInSeconds / (60 * 60));
	const inMinutes = Math.floor(timeDifferenceInSeconds / 60);
	const inSeconds = Math.floor(timeDifferenceInSeconds);

	if (inDays > 0) return inDays + chrome.i18n.getMessage('n_days');
	if (inHours > 0) return inHours + chrome.i18n.getMessage('n_hours');
	if (inMinutes > 0) return inMinutes + chrome.i18n.getMessage('n_mins');
	return inSeconds + chrome.i18n.getMessage('n_secs');
};

export const evaluateDarkMode = (mode: string): boolean => {
	const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.classList.toggle('dark', isDark);
	return isDark;
};
