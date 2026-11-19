import { environment } from 'src/environments/environment';
import { Config } from './Config';

describe('Config', () => {
	it('toma los valores por defecto del environment', () => {
		const config = new Config();

		expect(config.badgeExchangeRateType).toBe(environment.defaultBadgeExchangeRateType);
		expect(config.darkMode).toBe(environment.defaultDarkMode);
		expect(config.alarmPeriodInMinutes).toBe(environment.defaultAlarmPeriodInMinutes);
	});

	it('respeta lo que viene guardado', () => {
		const config = new Config({ darkMode: 'dark', badgeExchangeRateType: 'oficial' });

		expect(config.darkMode).toBe('dark');
		expect(config.badgeExchangeRateType).toBe('oficial');
	});

	// Esto es lo que hace que un usuario que viene de una versión anterior no
	// termine con campos en undefined.
	it('completa los campos que una versión previa no guardó', () => {
		const guardadoViejo = { darkMode: 'light' } as any;

		const config = new Config(guardadoViejo);

		expect(config.darkMode).toBe('light');
		expect(config.defaultTab).toBe(environment.defaultTab);
		expect(config.badgeBackgroundColor).toBe(environment.defaultBadgeBackgroundColor);
		expect(config.hiddenConversionSection).toBe(environment.defaultHiddenConversionSection);
	});

	it('no confunde un false guardado con un valor ausente', () => {
		const config = new Config({ hiddenConversionSection: false, valueConversor: 0 });

		expect(config.hiddenConversionSection).toBeFalse();
		expect(config.valueConversor).toBe(0);
	});
});
