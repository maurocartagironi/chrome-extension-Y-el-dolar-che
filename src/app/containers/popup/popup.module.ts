import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopupRoutingModule } from './popup-routing.module';
import { PopupComponent } from './popup.component';
import { DolarAPIService } from '@shared/services/dolar-api.service';

import { QuickPricingComponent } from 'src/app/components/quick-pricing/quick-pricing.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { SettingComponent } from 'src/app/components/setting/setting.component';
import { LegalTermsComponent } from '../../components/legalterms/legalterms.component';

@NgModule({
	declarations: [PopupComponent],
	providers: [DolarAPIService],
	imports: [
		CommonModule,
		PopupRoutingModule,
		QuickPricingComponent,
		HeaderComponent,
		TableComponent,
		SettingComponent,
		LegalTermsComponent,
	],
})
export class PopupModule {}
