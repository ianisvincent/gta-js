import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiManagerService {
  isDisplayed = true;

  constructor() {
  }

  displayLoadingScreen(value: boolean): void {
    this.isDisplayed = value;
  }
}
