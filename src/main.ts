import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { PopupComponent } from '@containers/popup/popup.component';
import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
}

// La extensión tiene una sola pantalla: no hay router. El popup se monta
// directo, así no hay que esperar un chunk lazy para pintar.
bootstrapApplication(PopupComponent, {
	// Sin zone.js: todos los componentes son OnPush y marcan la vista a mano
	// después de cada await, que es lo que zoneless necesita.
	providers: [provideZonelessChangeDetection()],
}).catch((err) => console.error(err));
