import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** El icono de ayuda con su globo. Se repetía seis veces en configuración. */
@Component({
	selector: 'app-info-tip',
	imports: [],
	templateUrl: './info-tip.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './info-tip.component.scss',
})
export class InfoTipComponent {
	@Input({ required: true }) text!: string;
}
