import { LOCALSTORAGE_CONFIG } from "../static/default.config";
import { init, refresh } from "./background.core";
import { getLocalStorage } from "../utils/storage";

// Inicializador
chrome.runtime.onInstalled.addListener(initializeExtension());

// Cada {periodInMinutes} minutos se ejecuta este método para que actualice los datos
chrome.alarms.onAlarm.addListener(refreshData);
 
// Recibe un mensaje del popup
chrome.runtime.onMessage.addListener(receiveMessageFromPopup);

// Función de inicialización de la extensión
function initializeExtension(): any {
   init();
}

// Función para actualizar los datos
async function refreshData(): Promise<void> {
   refresh();
}

// Función para recibir un mensaje del popup
async function receiveMessageFromPopup(
   message: any, 
   sender: chrome.runtime.MessageSender,
   sendResponse: (response?: any) => void
): Promise<void> {
   const config = await getLocalStorage(LOCALSTORAGE_CONFIG);
   sendResponse(config);
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
   if (message.message) {
     chrome.action.setBadgeText({ text: message.message.badge });
     chrome.action.setTitle({ title: message.message.tooltip });
     chrome.action.setBadgeBackgroundColor({ color: message.message.color})
   }
 }); 