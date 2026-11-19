/**
 * Chequeos del paquete que la store rechazaría (o que el usuario vería roto)
 * y que ni el compilador ni los tests detectan.
 */
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const errors = [];

const manifest = JSON.parse(await readFile(join(DIST, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));

// 1. La versión del manifest es la que ve el usuario: que no se desincronice.
if (manifest.version !== pkg.version) {
	errors.push(`manifest.version (${manifest.version}) != package.json version (${pkg.version})`);
}

// 2. Todo archivo que el manifest nombra tiene que existir en el build.
const referenced = new Set();
const collect = (value) => {
	if (typeof value === 'string') {
		if (/\.(js|html|png|json|css)$/.test(value)) referenced.add(value.split('?')[0]);
	} else if (Array.isArray(value)) {
		value.forEach(collect);
	} else if (value && typeof value === 'object') {
		Object.values(value).forEach(collect);
	}
};
collect(manifest);

for (const file of referenced) {
	try {
		await access(join(DIST, file));
	} catch {
		errors.push(`el manifest apunta a "${file}", que no existe en ${DIST}/`);
	}
}

// 3. Los host_permissions tienen que corresponderse con los endpoints del código.
const endpoints = (await readFile('src/app/shared/constants/api.constant.ts', 'utf8'))
	.matchAll(/'(https:\/\/[^/']+)/g)
	.toArray()
	.map((match) => `${match[1]}/*`);
const declared = manifest.host_permissions ?? [];

for (const host of declared) {
	if (!endpoints.includes(host)) {
		errors.push(`host_permission "${host}" declarado pero ningún endpoint lo usa`);
	}
}
for (const host of endpoints) {
	if (!declared.includes(host)) {
		errors.push(`el código llama a "${host}" pero no está en host_permissions`);
	}
}

// 4. Los locales declarados tienen que estar en el paquete.
if (manifest.default_locale) {
	const locales = await readdir(join(DIST, '_locales')).catch(() => []);
	if (!locales.includes(manifest.default_locale)) {
		errors.push(`default_locale "${manifest.default_locale}" sin carpeta en _locales/`);
	}
}

if (errors.length) {
	console.error('check-manifest: problemas encontrados:');
	for (const error of errors) console.error(`  - ${error}`);
	process.exit(1);
}

console.log('check-manifest: todo en orden.');
