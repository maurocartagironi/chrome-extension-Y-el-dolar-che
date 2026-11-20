// El builder @angular/build:karma inyecta su propio framework y preprocesador,
// así que acá solo queda lo propio del proyecto.
module.exports = function (config) {
	config.set({
		basePath: '',
		frameworks: ['jasmine'],
		plugins: [require('karma-jasmine'), require('karma-chrome-launcher'), require('karma-jasmine-html-reporter'), require('karma-coverage')],
		client: {
			clearContext: false,
		},
		jasmineHtmlReporter: {
			suppressAll: true,
		},
		coverageReporter: {
			dir: require('path').join(__dirname, './coverage/app'),
			subdir: '.',
			reporters: [{ type: 'html' }, { type: 'text-summary' }],
			// Piso de cobertura: unos puntos por debajo de lo que hay hoy, para
			// que una caída real falle y un refactor chico no moleste.
			check: {
				global: {
					statements: 92,
					branches: 83,
					functions: 90,
					lines: 94,
				},
			},
		},
		reporters: ['progress', 'kjhtml'],
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: true,
		browsers: ['Chrome'],
		singleRun: false,
		restartOnFileChange: true,
	});
};
