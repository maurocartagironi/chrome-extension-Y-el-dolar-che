// ESLint 10 y angular-eslint 22 usan flat config: reemplaza a .eslintrc.json.
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
	{
		ignores: ['dist/**', 'coverage/**', '.angular/**'],
	},
	{
		files: ['**/*.ts'],
		extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
		processor: angular.processInlineTemplates,
		rules: {
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'app',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'app',
					style: 'kebab-case',
				},
			],
		},
	},
	{
		// En los tests y en el doble de chrome.* el `any` es inherente: se
		// imitan APIs del browser y se arman payloads a mano.
		files: ['**/*.spec.ts', 'src/testing/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		files: ['**/*.html'],
		extends: [...angular.configs.templateRecommended],
		rules: {},
	}
);
