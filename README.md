# ¿Y el dólar, che? — Extensión de Chrome

Muestra la cotización del dólar en Argentina (oficial, libre, MEP, CCL, mayorista, cripto y tarjeta) en el icono del navegador y en un popup, con un conversor rápido de pesos a dólares y viceversa.

Los datos vienen de [dolarapi.com](https://dolarapi.com). Nada sale del navegador: la extensión no recopila ni envía información del usuario.

## Instalación

Desde la Chrome Web Store: [¿Y el dólar, che?](https://chromewebstore.google.com/detail/¿y-el-dólar-che/bhekococoidbofnmckchcajcjmlekcna)

Desde el código, para desarrollar:

```bash
npm install
npm run build          # compila a dist/
```

Después, en `chrome://extensions/`: activar el modo de desarrollador, "Cargar descomprimida" y elegir la carpeta `dist/`.

## Uso

- El **icono** muestra el valor del tipo de cambio que elijas (compra o venta), y al pasar el cursor aparece el detalle con la última actualización.
- El **popup** tiene tres pestañas: cotizaciones (click en un precio para copiarlo), conversión rápida y configuración.
- Los datos se refrescan solos cada 10 minutos, y el botón de refresh del popup fuerza una actualización.

## Desarrollo

| Comando                    | Qué hace                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `npm run build`            | Build de producción en `dist/` (~530 kB), con prune de fuentes no usadas y validación del manifest.                   |
| `npm run watch`            | Build de desarrollo en modo watch (el popup).                                                                         |
| `npm run build:background` | Compila solo el service worker con esbuild.                                                                           |
| `npm run preview`          | Sirve `dist/` en http://localhost:4210 con las APIs de chrome.* stubbeadas, para abrir el popup en un browser normal. |
| `npm run preview:shot`     | Lo mismo pero saca una captura a `preview.png`. Acepta `--dark` y `--tab=1                                            | 2`. |
| `npm test`                 | Tests unitarios en modo watch (Karma + Jasmine).                                                                      |
| `npm run test:ci`          | Los mismos tests una sola vez, en Chrome headless.                                                                    |
| `npm run lint`             | ESLint sobre `.ts` y templates.                                                                                       |
| `npm run package`          | Build + `dist.zip` listo para subir a la store (Windows).                                                             |

Puntos a tener en cuenta al tocar el código:

- **El service worker tiene que quedar sin Angular.** `BackgroundHelper` y `DolarAPIService` no llevan `@Injectable` a propósito: ese decorador arrastra todo `@angular/core` al bundle del background y lo lleva de ~5 kB a ~140 kB. Si hacen falta en DI, se proveen a mano en el módulo que los use.
- **El background se compila aparte**, con `scripts/build-background.mjs` (esbuild), no con el builder de Angular. Ojo: esbuild no aplica el `fileReplacements` de `angular.json`, así que el script hace el alias al `environment.prod.ts` a mano.
- **La config se rehidrata con `new Config(guardado ?? {})`**, nunca con un cast. Así los campos que una versión anterior no guardó toman su valor por defecto en vez de quedar en `undefined`.
- **Para ver un cambio visual no hace falta empaquetar la extensión.** `npm run preview` levanta el popup en un browser normal con chrome.* stubbeado y datos de ejemplo (con las tres tendencias, para ver los tres colores de chip). Con `--shot` saca la captura directo.
- **No hay librería de componentes.** La tabla, los selects, el input de monto y los tooltips de ayuda son HTML nativo estilado con los tokens de `styles.scss`. Antes de sumar una librería por un componente, conviene medir: PrimeNG y ng-select costaban 1,3 MB empaquetados para cuatro widgets.
- **Los valores por defecto de la configuración viven en `shared/constants/defaults.constant.ts`,** no en `environments/`. Ahí quedó solo el flag `production`: cuando los defaults estaban duplicados en dos archivos de environment, uno quedó desactualizado y el build publicado salió con `production: false`.
- **El icono (`assets/img/icon.png`) es de 48×48.** El manifest declara 16, 32 y 48 porque es lo que ese archivo puede cubrir sin verse borroso. Para la ficha de la store conviene exportar un 128×128 desde el diseño original y agregarlo al manifest.
- **El tema de los controles nativos sale de `color-scheme`.** `:root { color-scheme: light }` y `html.dark { color-scheme: dark }` hacen que el desplegable de los `<select>`, el input de color y las scrollbars sigan el modo oscuro sin CSS extra.
- **Sin `baseUrl` en el tsconfig.** TypeScript 6 lo deprecó, así que los alias (`@shared/*`, `@containers/*`, `src/*`) están en `paths` con rutas relativas al tsconfig. Si agregás un alias nuevo, va ahí.
- **ESLint usa flat config** (`eslint.config.js`), que es lo único que soporta ESLint 10. El `any` está permitido solo en los specs y en `src/testing/`, donde se imitan APIs del browser.
- `scripts/check-manifest.mjs` corre en cada build y falla si la versión del manifest no coincide con la del `package.json`, si el manifest apunta a un archivo que no existe, o si los `host_permissions` no se corresponden con los endpoints del código.

## Stack

Angular 22 standalone, **sin router y sin zone.js**: la extensión tiene una sola pantalla, así que `main.ts` monta `PopupComponent` directo y la detección de cambios es zoneless. Todos los componentes son `OnPush` y marcan la vista a mano después de cada `await` — eso es lo que hace que zoneless funcione, así que **si agregás código asíncrono que toca el estado, acordate del `markForCheck()`**. El popup lo compila `@angular/build:application` y el service worker esbuild, por separado. Sin librerías de componentes: la única dependencia de UI es la fuente de iconos (`primeicons`).

## Estructura

```
src/
├── background.ts                 # entry del service worker (alarma, onInstalled, onStartup)
│                                 # se compila con esbuild, no con Angular
├── manifest.json
├── _locales/es/                  # textos (chrome.i18n)
└── app/
    ├── containers/popup/         # el popup
    ├── components/               # header, tabla, conversor, settings, resultado, legales
    └── shared/
        ├── services/             # dolarapi.com
        ├── helpers/              # badge, tooltip y refresco (corre en el SW)
        ├── models/               # Config, ExchangeRate
        └── utils/                # storage, i18n, formato
```

## Contribuciones

Bienvenidas. Antes de abrir un PR: `npm run lint`, `npm run test:ci` y `npm run build` tienen que pasar.

## Licencia

MIT — ver [LICENSE](LICENSE).

## Contacto

[github.com/maurocartagironi](https://github.com/maurocartagironi)
