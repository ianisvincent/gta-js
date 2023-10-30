import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CONTROLS } from '../character/controls/Controls';

@Injectable({
    providedIn: 'root'
})
export class UiManagerService {
    isDisplayed = true;
    isPlayerIsAiming = true;
    isWeaponWheelDisplayed = false;
    updateControlsSubject = new BehaviorSubject(undefined);

    toggleWeaponWheel(isWeaponWheelDisplayed: boolean): void {
        this.isWeaponWheelDisplayed = isWeaponWheelDisplayed;
    }

    displayLoadingScreen(value: boolean): void {
        this.isDisplayed = value;
    }

    displayTargetPoint(value: boolean): void {
        this.isPlayerIsAiming = value;
    }

    updateHealthBar(damage: number): void {
        // Update Player's  health bar
        const healthBarElement = document.getElementById('health-bar');
        const barElement = document.getElementById('bar');
        const hitElement = document.getElementById('hit');

        const healthMaxValue = parseInt(healthBarElement.dataset.total) as number;
        const healthValue = parseInt(healthBarElement.dataset.value) as number;

        const newValue = (healthValue - damage) as number;

        const barWidth = (newValue / healthMaxValue) * 100;
        const hitWidth = (damage / healthValue) * 100 + '%';

        hitElement.style.width = hitWidth;
        healthBarElement.dataset.value = String(newValue);

        setTimeout(() => {
            hitElement.style.width = '0';
            barElement.style.width = barWidth + '%';
        }, 500);
    }

    updateControls(controls: any): void {
        this.updateControlsSubject.next(controls);
    }

    initDefaultControls(): void {
        this.updateControlsSubject.next(CONTROLS);
    }
}
