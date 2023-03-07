import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { KeepersShellComponent } from './keepers-shell/keepers-shell.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    KeepersShellComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  entryComponents: [
    KeepersShellComponent
  ]
})
export class AppModule {
  constructor(
    private injector: Injector
  ) { }

  ngDoBootstrap() {
    const customElement = createCustomElement(KeepersShellComponent, { injector: this.injector});
    customElements.define('sleepers-keepers', customElement);
  }
}
