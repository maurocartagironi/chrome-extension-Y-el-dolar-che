import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecimalPipe } from '@angular/common';

@NgModule({
	declarations: [AppComponent],
	providers: [DecimalPipe],
	imports: [BrowserModule, AppRoutingModule, NoopAnimationsModule],
	bootstrap: [AppComponent],
})
export class AppModule {}
