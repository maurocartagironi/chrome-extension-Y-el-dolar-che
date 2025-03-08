import { BackgroundHelper } from '@shared/helpers/background.helper';

// Inicializador
chrome.runtime.onInstalled.addListener(initializeExtension);

// Cada {periodInMinutes} minutos se ejecuta este método para que actualice los datos
chrome.alarms.onAlarm.addListener(refreshData);

// Función de inicialización de la extensión
function initializeExtension(): void {
	const backgroundHelper = new BackgroundHelper();
	backgroundHelper.init();
}

// Función para actualizar los datos
function refreshData(): void {
	const backgroundHelper = new BackgroundHelper();
	backgroundHelper.refreshData();
}
