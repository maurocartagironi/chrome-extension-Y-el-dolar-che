# Changelog

## [v3.2.0] - 19-11-2026

### Novedades

- **Variación del día:** cada cotización muestra cuánto se movió contra el cierre de ayer, con un sparkline de los últimos treinta cierres. Antes la flecha comparaba contra el sondeo anterior, que podía ser de diez minutos atrás.
- **Aviso por valor:** una notificación cuando el precio de venta supera, o baja de, el valor que marques. Avisa una sola vez por cruce.
- **Otras monedas:** euro, real brasileño, peso chileno y peso uruguayo, detrás de un toggle en configuración. Aparecen también en el indicador, el tooltip y el conversor.
- **Convertir desde el click derecho:** seleccionás un número en cualquier página y la extensión te dice cuánto es, en los dos sentidos.
- **Atajo de teclado:** `Alt+Shift+D` abre la extensión.
- **La extensión habla inglés.** Quedaban doce textos escritos en castellano dentro del código; ahora todo sale de `_locales`, con el idioma inglés completo.
- **La configuración sincroniza** entre las máquinas donde tengas la sesión de Chrome.
- **Botón de reintento** en la tarjeta de error: antes había que cerrar y abrir el popup.
- **Términos y privacidad al día:** el texto solo hablaba de dolarapi.com. Ahora cuenta también la segunda fuente (argentinadatos.com), que las notificaciones se resuelven dentro del navegador, que el texto que seleccionás para convertir no se guarda ni se transmite, y que la configuración sincroniza por tu propia cuenta de Chrome.

### Correcciones

- El error mostraba el mensaje técnico en inglés ("Failed to fetch") pegado al texto en castellano.
- Si se ocultaba el conversor y era la tab por defecto, el popup abría en una tab que ya no existía.

### Mejoras internas

- El icono pasó a ser un SVG: los cuatro tamaños (16, 32, 48 y **128**, el que pide la tienda) se generan con `npm run icons` en vez de estirar un raster de 48.
- `check-manifest` chequea además que los idiomas tengan las mismas claves y que cada icono mida lo que dice medir.
- `npm run assets:store` genera todas las imágenes de la tienda y de la página: las cinco capturas de 1280×800, la ficha de 440×280, la marquesina de 1400×560 y las capturas limpias del popup.
- **Página propia** en `docs/`, para publicar con GitHub Pages: qué hace, capturas y la política de privacidad con URL pública, que es la que pide la tienda.
- Piso de cobertura en los tests, que hoy están en 94 % de sentencias y 96 % de líneas.
- 155 tests.

## [v3.1.0] - 19-11-2026

### Novedades

- **Modo oscuro:** automático según el navegador, o fijo en claro u oscuro.
- **Copiar al portapapeles:** un click en cualquier precio, o en el resultado del conversor, lo copia.
- **Tab por defecto:** se puede elegir en qué pestaña abre el popup.

### Correcciones

- La extensión podía **dejar de actualizar las cotizaciones**: la marca de tiempo del caché era una clave global que se reescribía con cualquier guardado, así que un caché viejo parecía fresco.
- Cambiar el tipo de cambio del indicador **no lo repintaba** hasta el refresh siguiente.
- El popup podía romperse si no había configuración guardada, y quien venía de una versión anterior terminaba con los campos nuevos vacíos.
- El indicador tardaba hasta 10 minutos en volver después de reiniciar el navegador.
- Si la API tardaba, el popup quedaba cargando para siempre: ahora hay un timeout de 8 segundos y, si falla, se muestra la última cotización conocida.
- Los valores del indicador se redondean para no cortarse.

### Mejoras internas

- El popup **abre más rápido**: se quitó el router, que obligaba a esperar un segundo archivo antes de pintar la primera pantalla.
- Se subió Angular de 17 a 22 y se sacaron PrimeNG, ng-select, FontAwesome y zone.js. El paquete pasó de **2,7 MB a 410 kB** y el service worker de **141 kB a 5 kB**.
- `npm audit` quedó **en cero**: antes tenía 94 hallazgos, incluidos ocho de XSS en el propio Angular sin parche para la línea 17.
- Se eliminó un pedido a Binance cuyo resultado se descartaba, y con él el permiso de acceso a `p2p.binance.com`.
- Se eliminó la página de opciones, que era un stub vacío.
- Todos los componentes usan OnPush y la app corre sin zone.js, así que deja de revisar el árbol entero en cada evento.
- Se validan los datos que devuelve la API antes de usarlos.
- Lint, formato y tests corren en CI, con 88 tests sobre cotizaciones, caché, conversión y configuración.

## [v3.0.1] - 07-03-2025

### Novedades:

- **Nuevo:** Ahora la extensión incluye los **términos legales** (descargo de responsabilidad y política de privacidad).
- **Mejoras internas:** Se optimizó el **código** y se eliminaron funciones innecesarias para un mejor rendimiento.
- **Ajustes de permisos:** Se actualizaron los **permisos** para mejorar la **seguridad** y control en la extensión.

## [v3.0.0] - 14-04-2024

- Primera publicación.
