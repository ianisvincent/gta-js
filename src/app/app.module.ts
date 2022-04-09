import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ControlsComponent } from './ui/controls/controls.component';
import { LoadingScreenComponent } from './ui/loading-screen/loading-screen.component';
import { TargetComponent } from './ui/target/target.component';
import { HealthBarComponent } from './ui/health-bar/health-bar.component';
import { WordControllerComponent } from './ui/word-controller/word-controller.component';
import { WeaponWheelComponent } from './ui/weapon-wheel/weapon-wheel.component';

@NgModule({
  declarations: [
    AppComponent,
    ControlsComponent,
    LoadingScreenComponent,
    TargetComponent,
    HealthBarComponent,
    WordControllerComponent,
    WeaponWheelComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
