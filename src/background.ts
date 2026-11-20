import { ALARM_NAME, BackgroundHelper } from '@shared/helpers/background.helper';

// Al instalar o actualizar: crea la alarma y trae los datos.
chrome.runtime.onInstalled.addListener(() => void run((helper) => helper.init()));

// Al arrancar el browser: el badge no sobrevive al reinicio, hay que repintarlo.
chrome.runtime.onStartup.addListener(() => void run((helper) => helper.init()));

// Cada {alarmPeriodInMinutes} minutos se actualizan los datos.
chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === ALARM_NAME) {
		void run((helper) => helper.refreshData());
	}
});

// Click derecho sobre una selección: convierte el número seleccionado.
chrome.contextMenus.onClicked.addListener((info) => {
	void run((helper) => helper.convertSelection(String(info.menuItemId), info.selectionText ?? ''));
});

/**
 * Corre una tarea del background atrapando los errores: una promise rechazada
 * acá mata la actualización del badge y queda como unhandled rejection.
 */
async function run(task: (helper: BackgroundHelper) => Promise<void>): Promise<void> {
	const helper = new BackgroundHelper();
	try {
		await task(helper);
	} catch (error) {
		await helper.showError(error).catch(() => undefined);
	}
}
