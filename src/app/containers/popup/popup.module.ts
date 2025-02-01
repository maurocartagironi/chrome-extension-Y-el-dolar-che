import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { PopupRoutingModule } from './popup-routing.module';
import { PopupComponent } from './popup.component';

import { TabViewModule } from 'primeng/tabview';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { QuickPricingComponent } from 'src/app/components/quick-pricing/quick-pricing.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { SettingComponent } from 'src/app/components/setting/setting.component';

@NgModule({
	declarations: [PopupComponent],
	imports: [
		CommonModule,
		PopupRoutingModule,
		SharedModule,
		QuickPricingComponent,
		HeaderComponent,
		TableComponent,
		TabViewModule,
		MessagesModule,
		ProgressSpinnerModule,
		SettingComponent,
	],
})
export class PopupModule {}
