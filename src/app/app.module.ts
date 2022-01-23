import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ControlsComponent } from './ui/controls/controls.component';
import { LoadingScreenComponent } from './ui/loading-screen/loading-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    ControlsComponent,
    LoadingScreenComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
