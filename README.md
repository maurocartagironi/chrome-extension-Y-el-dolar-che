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

| Comando | Qué hace |
| --- | --- |
| `npm run build` | Build de producción en `dist/` (~530 kB), con prune de fuentes no usadas y validación del manifest. |
| `npm run watch` | Build de desarrollo en modo watch. |
| `npm test` | Tests unitarios en modo watch (Karma + Jasmine). |
| `npm run test:ci` | Los mismos tests una sola vez, en Chrome headless. |
| `npm run lint` | ESLint sobre `.ts` y templates. |
| `npm run package` | Build + `dist.zip` listo para subir a la store (Windows). |

Puntos a tener en cuenta al tocar el código:

- **El service worker tiene que quedar sin Angular.** `BackgroundHelper` y `DolarAPIService` no llevan `@Injectable` a propósito: ese decorador arrastra todo `@angular/core` al bundle del background y lo lleva de ~7 kB a ~140 kB. Si hacen falta en DI, se proveen a mano en el módulo que los use.
- **La config se rehidrata con `new Config(guardado ?? {})`**, nunca con un cast. Así los campos que una versión anterior no guardó toman su valor por defecto en vez de quedar en `undefined`.
- **No hay librería de componentes.** Los selects, el input de monto y los tooltips de ayuda son HTML nativo estilado con los design tokens de `styles.scss`. Lo único de terceros en la UI es la fuente de iconos (`primeicons`). Antes de sumar una librería por un componente, conviene medir: PrimeNG y ng-select costaban 1,3 MB empaquetados para tres widgets.
- **El tema de los controles nativos sale de `color-scheme`.** `:root { color-scheme: light }` y `html.dark { color-scheme: dark }` hacen que el desplegable de los `<select>`, el input de color y las scrollbars sigan el modo oscuro sin CSS extra.
- `scripts/check-manifest.mjs` corre en cada build y falla si la versión del manifest no coincide con la del `package.json`, si el manifest apunta a un archivo que no existe, o si los `host_permissions` no se corresponden con los endpoints del código.

## Estructura

```
src/
├── background.ts                 # entry del service worker (alarma, onInstalled, onStartup)
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
