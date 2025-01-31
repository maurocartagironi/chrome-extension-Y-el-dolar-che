export function getLocalStorage(param: string): Promise<any> {
	return new Promise((resolve, reject) => {
	   try {
		  chrome.storage.local.get(param, (result) => {
			 if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			 } else {
				resolve(result[param]);
			 }
		  });
	   } catch (error) {
		  reject(error);
	   }
	});
 }
 
 
 export async function setLocalStorage(param: string, value: any) {
	await chrome.storage.local.set({ [param]: value });
	const lastUpdated = new Date();
	await chrome.storage.local.set({ ['lastUpdated']: lastUpdated.getTime() });
 }

 export async function removeLocalStorage(param: string) {
	await chrome.storage.local.remove(param);
 }

export function onChangedCallback(changes: { [x: string]: any; }) {
	for (let key in changes) {
	  	let storageChange = changes[key];
	  	console.log(`Storage key "${key}" changed. Old value: ${storageChange.oldValue}, New value: ${storageChange.newValue}`);
	}
}