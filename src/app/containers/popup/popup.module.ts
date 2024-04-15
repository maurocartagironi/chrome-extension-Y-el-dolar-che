import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { PopupRoutingModule } from './popup-routing.module';
import { PopupComponent } from './popup.component';

import { QuickPricingComponent } from 'src/app/components/quick-pricing/quick-pricing.component';

@NgModule({
  declarations: [PopupComponent],
  imports: [CommonModule, PopupRoutingModule, SharedModule, QuickPricingComponent],
})
export class PopupModule {}
