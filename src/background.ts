import { BackgroundHelper } from '@shared/helpers/background.helper';
import { onChangedCallback } from '@shared/utils/storage.util';

// Inicializador
chrome.runtime.onInstalled.addListener(initializeExtension);

// Cada {periodInMinutes} minutos se ejecuta este método para que actualice los datos
chrome.alarms.onAlarm.addListener(refreshData);

// Recibe un mensaje del popup
chrome.runtime.onMessage.addListener(receiveMessageFromPopup);

// Función de inicialización de la extensión
function initializeExtension(): void {
	chrome.storage.onChanged.addListener(onChangedCallback);
	const backgroundHelper = new BackgroundHelper();
	backgroundHelper.init();
}

// Función para actualizar los datos
function refreshData(): void {
	const backgroundHelper = new BackgroundHelper();
	backgroundHelper.refreshData();
}

// Función para recibir un mensaje del popup
function receiveMessageFromPopup(message: string, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): void {
	console.log('Received message from popup:', message);
	console.log('sender:', sender);
	console.log('sendResponse:', sendResponse);
}
