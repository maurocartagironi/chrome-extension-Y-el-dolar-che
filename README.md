# ¿Y el dólar, che? — Extensión de Chrome

Muestra la cotización del dólar en Argentina (oficial, libre, MEP, CCL, mayorista, cripto y tarjeta) en el icono del navegador y en un popup, con la variación del día, un conversor rápido y avisos cuando el precio cruza un valor. Opcionalmente suma euro, real, peso chileno y peso uruguayo.

Los datos vienen de [dolarapi.com](https://dolarapi.com) y la serie histórica de [argentinadatos.com](https://argentinadatos.com). Nada sale del navegador: la extensión no recopila ni envía información del usuario.

## Instalación

Desde la Chrome Web Store: [¿Y el dólar, che?](https://chromewebstore.google.com/detail/¿y-el-dólar-che/bhekococoidbofnmckchcajcjmlekcna)

Desde el código, para desarrollar:

```bash
npm install
npm run build          # compila a dist/
```

Después, en `chrome://extensions/`: activar el modo de desarrollador, "Cargar descomprimida" y elegir la carpeta `dist/`.

## Uso

- El **icono** muestra el valor del tipo de cambio que elijas (compra o venta), y al pasar el cursor aparece el detalle con la última actualización. `Alt+Shift+D` abre el popup.
- El **popup** tiene tres pestañas: cotizaciones (click en un precio para copiarlo, con la variación del día y el sparkline de los últimos treinta cierres), conversión rápida y configuración.
- El **click derecho** sobre un número seleccionado en cualquier página lo convierte, en los dos sentidos.
- En configuración se puede pedir un **aviso** cuando el precio de venta cruza un valor, y sumar **otras monedas** (euro, real, peso chileno y uruguayo) a la tabla.
- Los datos se refrescan solos cada 10 minutos, y el botón de refresh del popup fuerza una actualización.

## Desarrollo

| Comando                    | Qué hace                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`            | Build de producción en `dist/` (~530 kB), con prune de fuentes no usadas y validación del manifest.                                                                 |
| `npm run watch`            | Build de desarrollo en modo watch (el popup).                                                                                                                       |
| `npm run build:background` | Compila solo el service worker con esbuild.                                                                                                                         |
| `npm run preview`          | Sirve `dist/` en http://localhost:4210 con las APIs de chrome.* stubbeadas, para abrir el popup en un browser normal.                                               |
| `npm run preview:shot`     | Lo mismo pero saca una captura. Acepta `--dark`, `--tab=N`, `--monedas`, `--error`, `--hidden`, `--click=<sel>`, `--focus=<sel>`, `--ventana=AxA` y `--out=<ruta>`. |
| `npm run assets:store`     | Todas las imágenes de la tienda y de la página, en `docs/assets/`: las cinco capturas de 1280×800, la ficha de 440×280, la marquesina de 1400×560 y las del popup.  |
| `npm run icons`            | Genera `icon-16/32/48/128.png` desde `assets/img/icon.svg`.                                                                                                         |
| `npm test`                 | Tests unitarios en modo watch (Karma + Jasmine).                                                                                                                    |
| `npm run test:ci`          | Los mismos tests una sola vez, en Chrome headless.                                                                                                                  |
| `npm run lint`             | ESLint sobre `.ts` y templates.                                                                                                                                     |
| `npm run package`          | Build + `dist.zip` listo para subir a la store (Windows).                                                                                                           |

Puntos a tener en cuenta al tocar el código:

- **El service worker tiene que quedar sin Angular.** `BackgroundHelper` y `DolarAPIService` no llevan `@Injectable` a propósito: ese decorador arrastra todo `@angular/core` al bundle del background y lo lleva de ~5 kB a ~140 kB. Si hacen falta en DI, se proveen a mano en el módulo que los use.
- **El background se compila aparte**, con `scripts/build-background.mjs` (esbuild), no con el builder de Angular. Ojo: esbuild no aplica el `fileReplacements` de `angular.json`, así que el script hace el alias al `environment.prod.ts` a mano.
- **La config se rehidrata con `new Config(guardado ?? {})`**, nunca con un cast. Así los campos que una versión anterior no guardó toman su valor por defecto en vez de quedar en `undefined`.
- **Para ver un cambio visual no hace falta empaquetar la extensión.** `npm run preview` levanta el popup en un browser normal con chrome.* stubbeado y datos de ejemplo (con las tres tendencias, para ver los tres colores de chip). Con `--shot` saca la captura directo.
- **No hay librería de componentes.** La tabla, los selects, el input de monto y los tooltips de ayuda son HTML nativo estilado con los tokens de `styles.scss`. Antes de sumar una librería por un componente, conviene medir: PrimeNG y ng-select costaban 1,3 MB empaquetados para cuatro widgets.
- **Los valores por defecto de la configuración viven en `shared/constants/defaults.constant.ts`,** no en `environments/`. Ahí quedó solo el flag `production`: cuando los defaults estaban duplicados en dos archivos de environment, uno quedó desactualizado y el build publicado salió con `production: false`.
- **El icono es `assets/img/icon.svg`;** los PNG se generan con `npm run icons`. Es un redibujo del original de 48×48, que quedó en el repo como `icon.png`. Si aparece el arte original en vector, reemplazar el SVG y volver a generar.
- **El histórico es información de apoyo.** Se pide aparte de las cotizaciones y sin bloquear la tabla, y si falla los chips caen a la comparación contra el sondeo anterior. Nunca tiene que romper el popup.
- **La política de privacidad vive en dos lugares:** el texto `legal_terms_text` de `_locales` (lo que se ve dentro del popup) y la sección `#privacidad` de `docs/index.html` (la URL que pide la tienda). Hoy dicen lo mismo; si se toca una hay que tocar la otra.
- **Las imágenes de `docs/assets/` se commitean.** Son las que se suben a la tienda y las que muestra la página; si no están en el repo, GitHub Pages queda sin imágenes. Se regeneran con `npm run assets:store`.
- **La configuración vive en `chrome.storage.sync`** y el resto en `local`. Sync tiene cuota de 8 kB por item y límite de escrituras por minuto, así que las cotizaciones y el histórico, que son caché, no van ahí.
- **El tema de los controles nativos sale de `color-scheme`.** `:root { color-scheme: light }` y `html.dark { color-scheme: dark }` hacen que el desplegable de los `<select>`, el input de color y las scrollbars sigan el modo oscuro sin CSS extra.
- **Sin `baseUrl` en el tsconfig.** TypeScript 6 lo deprecó, así que los alias (`@shared/*`, `@containers/*`, `src/*`) están en `paths` con rutas relativas al tsconfig. Si agregás un alias nuevo, va ahí.
- **ESLint usa flat config** (`eslint.config.js`), que es lo único que soporta ESLint 10. El `any` está permitido solo en los specs y en `src/testing/`, donde se imitan APIs del browser.
- `scripts/check-manifest.mjs` corre en cada build y falla si la versión del manifest no coincide con la del `package.json`, si el manifest apunta a un archivo que no existe, si los `host_permissions` no se corresponden con los endpoints del código, si un icono no mide lo que declara, o si a un idioma le falta una clave que el idioma por defecto sí tiene.
- **Los tests tienen piso de cobertura** (`karma.conf.js`). El doble de `chrome.i18n` sirve los mensajes reales de `_locales/es`, así que un texto que falte se ve en los tests.

## Stack

Angular 22 standalone, **sin router y sin zone.js**: la extensión tiene una sola pantalla, así que `main.ts` monta `PopupComponent` directo y la detección de cambios es zoneless. Todos los componentes son `OnPush` y marcan la vista a mano después de cada `await` — eso es lo que hace que zoneless funcione, así que **si agregás código asíncrono que toca el estado, acordate del `markForCheck()`**. El popup lo compila `@angular/build:application` y el service worker esbuild, por separado. Sin librerías de componentes: la única dependencia de UI es la fuente de iconos (`primeicons`).

## Estructura

```
src/
├── background.ts                 # entry del service worker (alarma, onInstalled, onStartup)
│                                 # se compila con esbuild, no con Angular
├── manifest.json
├── _locales/{es,en}/             # textos (chrome.i18n)
└── app/
    ├── containers/popup/         # el popup
    ├── components/               # header, tabla, conversor, settings, resultado, legales
    └── shared/
        ├── services/             # dolarapi.com y la serie histórica
        ├── helpers/              # badge, tooltip y refresco (corre en el SW)
        ├── models/               # Config, ExchangeRate
        └── utils/                # storage, i18n, formato, variación, parseo de montos
```

## Contribuciones

Bienvenidas. Antes de abrir un PR: `npm run lint`, `npm run test:ci` y `npm run build` tienen que pasar.

## Licencia

MIT — ver [LICENSE](LICENSE).

## Contacto

[github.com/maurocartagironi](https://github.com/maurocartagironi)
