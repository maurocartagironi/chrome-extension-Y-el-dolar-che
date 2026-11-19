import { installChromeMock } from 'src/testing/chrome-mock';
import { ChromeService } from './chrome.utils';

describe('ChromeService', () => {
	let service: ChromeService;

	beforeEach(() => {
		const mock = installChromeMock();
		mock.i18n.messages['label_quotations'] = 'Cotizaciones';
		mock.i18n.messages['footer'] = 'Actualizado hace $1';
		service = new ChromeService();
	});

	it('devuelve el mensaje traducido', () => {
		expect(service.getMessage('label_quotations')).toBe('Cotizaciones');
	});

	it('resuelve las sustituciones', () => {
		expect(service.getMessage('footer', '5 minuto(s)')).toBe('Actualizado hace 5 minuto(s)');
	});

	it('cachea los mensajes sin sustituciones', () => {
		const spy = spyOn(chrome.i18n, 'getMessage').and.returnValue('Cotizaciones');

		service.getMessage('label_quotations');
		service.getMessage('label_quotations');
		service.getMessage('label_quotations');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('no cachea los mensajes con sustituciones', () => {
		const spy = spyOn(chrome.i18n, 'getMessage').and.returnValue('Actualizado hace x');

		service.getMessage('footer', '1 minuto(s)');
		service.getMessage('footer', '2 minuto(s)');

		expect(spy).toHaveBeenCalledTimes(2);
	});
});
