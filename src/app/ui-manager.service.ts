import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UiManagerService {
    isDisplayed = true;
    isPlayerIsAiming = true;

    constructor() {
    }

    displayLoadingScreen(value: boolean): void {
        this.isDisplayed = value;
    }

    displayTargetPoint(value: boolean): void {
        this.isPlayerIsAiming = value;
    }
}
