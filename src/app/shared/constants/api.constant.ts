export const ENDPOINT: string = 'https://dolarapi.com/v1/dolares';

/**
 * Cierres diarios históricos. Es otro servicio del mismo grupo que dolarapi:
 * dolarapi da el precio de ahora y este la serie, que es lo que permite
 * calcular la variación del día y dibujar el sparkline.
 */
export const ENDPOINT_HISTORY: string = 'https://api.argentinadatos.com/v1/cotizaciones';
