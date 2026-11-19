# Changelog

## [Sin publicar]

### Novedades

-   **Modo oscuro:** automático según el navegador, o fijo en claro u oscuro.
-   **Popup rediseñado:** tarjetas de cotización con indicador de suba/baja, pestañas propias y skeleton de carga.
-   **Copiar al portapapeles:** un click en cualquier precio (o en el resultado del conversor) lo copia.
-   **Tab por defecto:** se puede elegir en qué pestaña abre el popup.

### Correcciones

-   La extensión podía **dejar de actualizar las cotizaciones**: la marca de tiempo del caché era una clave global que se reescribía con cualquier guardado, así que un caché viejo parecía fresco.
-   Cambiar el tipo de cambio del indicador **no lo repintaba** hasta el refresh siguiente.
-   El popup podía romperse si no había configuración guardada, y quien venía de una versión anterior terminaba con los campos nuevos vacíos.
-   El indicador tardaba hasta 10 minutos en volver después de reiniciar el navegador.
-   Si la API tardaba, el popup quedaba cargando para siempre: ahora hay un timeout de 8 segundos y, si falla, se muestra la última cotización conocida.
-   Los valores del indicador se redondean para no cortarse.

### Mejoras internas

-   Se eliminó un pedido a Binance cuyo resultado se descartaba, y con él el permiso de acceso a `p2p.binance.com`.
-   Se eliminó la página de opciones, que era un stub vacío.
-   El paquete pasó de 2,7 MB a 1,8 MB y el service worker de 141 kB a 7 kB.
-   Se validan los datos que devuelve la API antes de usarlos.
-   Lint y tests volvieron a funcionar, con 56 tests sobre la lógica de cotizaciones, caché, conversión y configuración.

## [v3.0.1] - 07-03-2025

### Novedades:

-   **Nuevo:** Ahora la extensión incluye los **términos legales** (descargo de responsabilidad y política de privacidad).
-   **Mejoras internas:** Se optimizó el **código** y se eliminaron funciones innecesarias para un mejor rendimiento.
-   **Ajustes de permisos:** Se actualizaron los **permisos** para mejorar la **seguridad** y control en la extensión.

## [v3.0.0] - 14-04-2024

-   Primera publicación.
